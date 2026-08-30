"use client";

import { useEffect, useState } from "react";

type AnyFeature = {
  type?: string;
  properties?: Record<string, any>;
  geometry?: {
    type?: string;
    coordinates?: any;
  };
};

type GeologyResult = {
  status: string;
  classId?: number;
  unit?: {
    id: number;
    code: string;
    name_bg: string;
    name_en: string;
  } | null;
};

type ReportData = {
  professionalDrilling: any;
  lat: number;
  lon: number;
  geology: GeologyResult | null;
  bodies: AnyFeature[];
  monitoring: {
    feature: AnyFeature;
    distanceKm: number;
  } | null;
};

function pointInRing(
  lon: number,
  lat: number,
  ring: number[][]
) {
  let inside = false;

  for (
    let i = 0, j = ring.length - 1;
    i < ring.length;
    j = i++
  ) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > lat !== yj > lat &&
      lon <
        ((xj - xi) * (lat - yi)) /
          ((yj - yi) || 1e-12) +
        xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function pointInPolygonGeometry(
  lon: number,
  lat: number,
  geometry: any
) {
  if (!geometry) return false;

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates || [];

    if (!rings.length) return false;

    if (!pointInRing(lon, lat, rings[0])) {
      return false;
    }

    for (let i = 1; i < rings.length; i++) {
      if (pointInRing(lon, lat, rings[i])) {
        return false;
      }
    }

    return true;
  }

  if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates || []) {
      if (
        pointInPolygonGeometry(
          lon,
          lat,
          {
            type: "Polygon",
            coordinates: polygon,
          }
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371.0088;
  const d2r = Math.PI / 180;

  const dLat = (lat2 - lat1) * d2r;
  const dLon = (lon2 - lon1) * d2r;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * d2r) *
      Math.cos(lat2 * d2r) *
      Math.sin(dLon / 2) ** 2;

  return (
    2 *
    R *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function lonLatToUTM35(
  lon: number,
  lat: number
) {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;
  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);

  const rad = Math.PI / 180;
  const phi = lat * rad;
  const lambda = lon * rad;
  const lambda0 = 27 * rad;

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const tanPhi = Math.tan(phi);

  const N =
    a /
    Math.sqrt(
      1 - e2 * sinPhi * sinPhi
    );

  const T = tanPhi * tanPhi;
  const C = ep2 * cosPhi * cosPhi;
  const A =
    cosPhi * (lambda - lambda0);

  const e4 = e2 * e2;
  const e6 = e4 * e2;

  const M =
    a *
    (
      (1 -
        e2 / 4 -
        (3 * e4) / 64 -
        (5 * e6) / 256) *
        phi -
      (3 * e2 / 8 +
        3 * e4 / 32 +
        45 * e6 / 1024) *
        Math.sin(2 * phi) +
      (15 * e4 / 256 +
        45 * e6 / 1024) *
        Math.sin(4 * phi) -
      (35 * e6 / 3072) *
        Math.sin(6 * phi)
    );

  const easting =
    k0 *
      N *
      (
        A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 -
          18 * T +
          T * T +
          72 * C -
          58 * ep2) *
          A ** 5) /
          120
      ) +
    500000;

  let northing =
    k0 *
    (
      M +
      N *
        tanPhi *
        (
          A ** 2 / 2 +
          ((5 -
            T +
            9 * C +
            4 * C * C) *
            A ** 4) /
            24 +
          ((61 -
            58 * T +
            T * T +
            600 * C -
            330 * ep2) *
            A ** 6) /
            720
        )
    );

  if (lat < 0) {
    northing += 10000000;
  }

  return { easting, northing };
}

async function loadRaster(url: string) {
  return new Promise<{
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas =
        document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext(
        "2d",
        { willReadFrequently: true }
      );

      if (!ctx) {
        reject(
          new Error("Canvas unavailable")
        );
        return;
      }

      ctx.drawImage(image, 0, 0);

      resolve({
        ctx,
        width: canvas.width,
        height: canvas.height,
      });
    };

    image.onerror = () =>
      reject(
        new Error(
          "Raster load failed: " + url
        )
      );

    image.src = url;
  });
}

function pixelValue(
  raster: {
    ctx: CanvasRenderingContext2D;
  },
  x: number,
  y: number
) {
  return raster.ctx.getImageData(
    x,
    y,
    1,
    1
  ).data[0];
}

async function geologyAt(
  lat: number,
  lon: number
): Promise<GeologyResult> {
  const meta = await fetch(
    "/geology-map/data/bd_ibr_geology_lookup.json"
  ).then(r => r.json());

  const [direct, reliable, obscured] =
    await Promise.all([
      loadRaster(meta.rasters.direct),
      loadRaster(meta.rasters.reliable),
      loadRaster(
        meta.rasters.source_obscured
      ),
    ]);

  const utm =
    lonLatToUTM35(lon, lat);

  const inv =
    meta.affine.utm_to_pixel_matrix;

  const offsetE =
    meta.affine.pixel_to_utm_easting[2];

  const offsetN =
    meta.affine.pixel_to_utm_northing[2];

  const de =
    utm.easting - offsetE;

  const dn =
    utm.northing - offsetN;

  const cropX =
    inv[0][0] * de +
    inv[0][1] * dn;

  const cropY =
    inv[1][0] * de +
    inv[1][1] * dn;

  const x = Math.round(
    (cropX + meta.master.crop_x) *
      meta.master.scale_x
  );

  const y = Math.round(
    (cropY + meta.master.crop_y) *
      meta.master.scale_y
  );

  if (
    x < 0 ||
    y < 0 ||
    x >= meta.master.width ||
    y >= meta.master.height
  ) {
    return {
      status: "OUTSIDE_RASTER",
      unit: null,
    };
  }

  const directId =
    pixelValue(direct, x, y);

  const reliableId =
    pixelValue(reliable, x, y);

  const isObscured =
    pixelValue(obscured, x, y) > 0;

  let status = "UNRESOLVED";
  let classId = 0;

  if (isObscured) {
    status = "SOURCE_OBSCURED";
  } else if (reliableId === 0) {
    status = "UNRESOLVED";
  } else if (directId > 0) {
    status = "DIRECT";
    classId = directId;
  } else {
    status = "GAP_FILL";
    classId = reliableId;
  }

  const unit =
    (meta.units || []).find(
      (u: any) =>
        Number(u.id) === classId
    ) || null;

  return {
    status,
    classId,
    unit,
  };
}


function waterTypeExplanation(value: string) {
  const t = String(value || "").toLowerCase();

  if (t.includes("поров")) {
    return "Порови води означава, че водата се намира и се движи основно в празните пространства между песъчинки, чакъл и други зърнести материали. Представи си мокър пясък или чакъл – водата е между отделните частици, а не в голяма подземна кухина.";
  }

  if (t.includes("карст")) {
    return "Карстови води означава, че водата се движи главно по разширени пукнатини, канали и кухини в разтворими скали, най-често варовици. Дебитът може да се променя рязко от място на място.";
  }

  if (
    t.includes("пукнат") ||
    t.includes("пукнатин")
  ) {
    return "Пукнатинни води означава, че основната скала може да е компактна, но водата се събира и движи по пукнатини, разломени и изветрели зони. Затова две близки сондажни точки могат да дадат много различен резултат.";
  }

  return "Това е официалният хидрогеоложки тип на водите. Той описва по какъв начин водата обикновено се съхранява и движи в геоложката среда.";
}


function monitoringMeaning(
  measurementType: string
) {
  if (measurementType === "level") {
    return "„Ниво“ означава, че в този пункт се наблюдава положението на подземната вода – тоест как се изменя водното ниво във времето. Това НЕ е измерен дебит и НЕ означава автоматично дълбочината, на която ще намериш вода в избраната точка. Стойностите в сантиметри са отчетени така, както са публикувани в официалния мониторинг.";
  }

  if (measurementType === "discharge") {
    return "„Дебит“ означава, че в пункта се следи количеството вода, което изтича за единица време. Стойността е ориентир за конкретния наблюдаван източник и не може директно да се пренася като очакван дебит на бъдещ сондаж.";
  }

  return "Мониторинговият пункт показва реално наблюдение на подземните води в района. Данните от него трябва да се използват като ориентир, а не като директна прогноза за конкретния имот.";
}


function groundwaterBodyMeaning(
  p: Record<string, any>
) {
  const type = String(
    p.gwb_type_name_bg || ""
  ).toLowerCase();

  if (type.includes("алувиал")) {
    return "Това водно тяло е свързано основно с речни и алувиални наслаги – пясъци, чакъли, глини и смесени наноси. Такива пластове често са сравнително лесни за пробиване, но могат да бъдат нестабилни.";
  }

  if (
    type.includes("грабен") ||
    type.includes("депрес")
  ) {
    return "Това водно тяло е свързано с понижен структурен басейн, в който могат да са натрупани дебели седиментни пластове. При сондиране е възможно редуване на глини, пясъци, чакъли и по-споени пластове.";
  }

  if (type.includes("карст")) {
    return "Това водно тяло е свързано с карстова среда. Водата може да е концентрирана в пукнатини, канали и кухини, затова водоносността често е неравномерна.";
  }

  if (
    type.includes("пукнат") ||
    type.includes("fract")
  ) {
    return "Това водно тяло е свързано с напукани скали. Най-важни са пукнатините и структурно нарушените зони, а не целият скален масив.";
  }

  return "Това е отделно официално картографирано подземно водно тяло. То описва регионална водоносна система, а не конкретен пласт с известна дълбочина под имота.";
}


function bodyShortName(
  feature: AnyFeature,
  index: number
) {
  const p = feature.properties || {};

  return (
    p.localId ||
    p.nameText ||
    p.nameTxtInt ||
    `ПВТ ${index + 1}`
  );
}

function geologyConfidenceBg(
  status: string
) {
  if (status === "DIRECT") {
    return "Висока за мащаба на картата – единицата е директно класифицирана.";
  }

  if (status === "GAP_FILL") {
    return "Средна – стойността е консервативно попълнена от близка надеждно класифицирана зона.";
  }

  if (
    status === "SOURCE_OBSCURED"
  ) {
    return "Недостатъчна – изходната карта не позволява надеждно определяне.";
  }

  return "Недостатъчна за надеждна интерпретация.";
}


function likelyDrillingMaterials(
  geologyCode: string,
  bodies: AnyFeature[]
) {
  const combined = bodies
    .map(f => {
      const p = f.properties || {};

      return [
        p.water_type_bg,
        p.gwb_type_name_bg,
        p.horizon_bg,
        p.nameText,
        p.nameTxtInt,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    })
    .join(" ");

  const pore =
    combined.includes("поров");

  const alluvial =
    combined.includes("алувиал") ||
    combined.includes("речн");

  const quaternary =
    geologyCode.trim().toUpperCase() === "Q" ||
    combined.includes("кватернер") ||
    bodies.some((feature) => {
      const properties = feature.properties || {};

      const code = String(
        properties.localId ||
        properties.cod ||
        properties.code ||
        properties.gwb_code ||
        ""
      ).trim().toUpperCase();

      return /^BG[23]G0+Q\d+$/.test(code);
    });

  const depression =
    combined.includes("депрес") ||
    combined.includes("грабен");

  const karst =
    combined.includes("карст");

  const fractured =
    combined.includes("пукнат");

  if (
    quaternary && pore && alluvial
  ) {
    return {
      title:
        "Пясък, чакъл, глина и смесени речни наноси",
      short:
        "Най-вероятно ще се редуват рохкави и слабо споени материали.",
      details:
        "При пробиването е вероятно да излизат пясък, чакъл, глина, прахови материали и смесени речни наноси. Възможно е отделни пластове да са по-глинести, а други по-песъчливи или чакълести.",
      behavior:
        "Пясъкът и чакълът могат да се свличат в отвора, а глинестите пластове могат да лепнат и да затрудняват промивката. Обсаждането може да е важно.",
      confidence:
        "Добра регионална интерпретация",
    };
  }

  if (
    quaternary && pore
  ) {
    return {
      title:
        "Рохкави до слабо споени седименти",
      short:
        "Вероятни са пясък, чакъл, глина и смесени наноси.",
      details:
        "Кватернерната възраст и поровият тип води насочват към сравнително млади седиментни материали. Възможни са пясъчни, чакълести и глинести пластове, но точната последователност не е известна.",
      behavior:
        "Стените на сондажа могат да бъдат нестабилни в рохкави участъци.",
      confidence:
        "Средна до добра регионална интерпретация",
    };
  }

  if (
    pore &&
    depression
  ) {
    return {
      title:
        "Редуващи се седиментни пластове",
      short:
        "Възможни са глини, пясъци, чакъли и по-споени седименти.",
      details:
        "При сондиране в подобна седиментна депресия може да има често редуване на по-меки глинести пластове, пясъци, чакъли и локално по-споени материали.",
      behavior:
        "Съпротивлението при пробиване може да се променя рязко между отделните пластове.",
      confidence:
        "Средна регионална интерпретация",
    };
  }

  if (karst && geologyCode !== "Q") {
    return {
      title:
        "Вероятна твърда карстова скална среда",
      short:
        "Очакват се компактни скали с пукнатини и възможни кухини.",
      details:
        "Карстовият тип водоносна среда насочва към твърда разтворима скала с пукнатини, канали и възможни кухини. Самите налични данни не определят точния литоложки състав в сондажната точка.",
      behavior:
        "Възможни са резки преходи от здрава скала към силно напукана зона или кухина.",
      confidence:
        "Средна интерпретация – нуждае се от локална проверка",
    };
  }

  if (fractured) {
    return {
      title:
        "Компактна до твърда напукана скала",
      short:
        "По-вероятно е пробиване в скален масив, а не в рохкави наноси.",
      details:
        "Водоносността вероятно е свързана основно с пукнатини и нарушени участъци. Точният вид скала не може да се определи само от този регионален слой.",
      behavior:
        "Пробиването вероятно ще бъде по-тежко, но може рязко да се облекчи в напукана или изветряла зона.",
      confidence:
        "Средна регионална интерпретация",
    };
  }

  if (
    [
      "K",
      "J-K",
      "J",
      "T-J",
      "T",
      "P",
      "C-P",
      "C",
      "D",
      "S-D",
      "S",
      "O",
      "Cm-O",
      "Cm",
    ].includes(geologyCode)
  ) {
    return {
      title:
        "По-компактна и вероятно по-твърда геоложка основа",
      short:
        "Възможни са споени или масивни скали.",
      details:
        "По-старата геоложка единица насочва към по-компактна среда, но от картата не може надеждно да се каже дали конкретно ще се срещнат варовик, пясъчник, вулканит, метаморфна или друга скала.",
      behavior:
        "Скоростта на пробиване може да е по-ниска и силно зависима от напукаността и изветрянето.",
      confidence:
        "Ограничена – точният материал не е определен от източника",
    };
  }

  return {
    title:
      "Материалът не може да се определи надеждно",
    short:
      "Регионалните данни не са достатъчни за конкретен вид скала.",
    details:
      "Не е коректно да се посочват конкретни материали без допълнителна литоложка или теренна информация.",
    behavior:
      "Нужно е локално проучване.",
    confidence:
      "Ниска",
  };
}


function simpleGroundInterpretation(
  geologyCode: string,
  bodies: AnyFeature[]
) {
  const bodyText = bodies
    .map(f =>
      [
        f.properties?.water_type_bg,
        f.properties
          ?.gwb_type_name_bg,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    )
    .join(" ");

  const isKarst =
    bodyText.includes("карст");

  const isPore =
    bodyText.includes("поров");

  const isFractured =
    bodyText.includes("пукнат");

  if (isKarst && geologyCode !== "Q") {
    return {
      headline:
        "По-скоро твърда, напукана/карстова скална среда",
      hardness: "Висока",
      looseness: "Ниска",
      collapse:
        "Нисък до среден, но са възможни кухини и силно нарушени участъци",
      drilling:
        "Вероятно ще се работи в по-компактна скала. Възможни са резки промени при попадане в пукнатини или карстови кухини.",
      water:
        "Водата по-често се концентрира в пукнатини, разломени зони и карстови празнини.",
    };
  }

  if (
    isPore ||
    geologyCode === "Q"
  ) {
    return {
      headline:
        "По-скоро мека до рохкава седиментна среда",
      hardness: "Ниска до средна",
      looseness: "Средна до висока",
      collapse:
        "Среден до висок при пясъчни и чакълести пластове",
      drilling:
        "Пробиването обикновено е сравнително лесно, но стените могат да се свличат. Често трябва да се мисли за своевременно обсаждане.",
      water:
        "Водата най-често се движи в порите между песъчинки, чакъл и други насипни или слабо споени материали.",
    };
  }

  if (isFractured) {
    return {
      headline:
        "По-скоро компактна и напукана скала",
      hardness: "Средна до висока",
      looseness: "Ниска",
      collapse:
        "Обикновено по-нисък, освен в силно нарушени зони",
      drilling:
        "Очаква се по-твърдо пробиване. Водоносността може да се променя рязко според пукнатините.",
      water:
        "Водата се търси главно в пукнатини и структурно нарушени зони.",
    };
  }

  if (
    ["K", "J-K", "J", "T-J", "T",
     "P", "C-P", "C", "D", "S-D",
     "S", "O", "Cm-O", "Cm"]
      .includes(geologyCode)
  ) {
    return {
      headline:
        "По-скоро по-стара и по-компактна геоложка основа",
      hardness: "Средна до висока",
      looseness: "Ниска до средна",
      collapse:
        "Зависи силно от напукаността и изветрянето",
      drilling:
        "По-вероятно е да се срещнат споени или компактни скали. Реалната твърдост може да се мени значително.",
      water:
        "Ако средата е компактна, водата обикновено е по-свързана с пукнатини и нарушени зони, отколкото с целия скален масив.",
    };
  }

  return {
    headline:
      "Смесена или недостатъчно определена геоложка среда",
    hardness: "Не може да се определи надеждно",
    looseness: "Не може да се определи надеждно",
    collapse:
      "Нужна е локална проверка",
    drilling:
      "Регионалните данни не са достатъчни за надеждна оценка на поведението при пробиване.",
    water:
      "Необходима е локална хидрогеоложка/геофизична проверка.",
  };
}

export default function GeologyReportPage() {
  const [data, setData] =
    useState<ReportData | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function run() {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const lat =
          Number(params.get("lat"));

        const lonParam =
          params.get("lon") ??
          params.get("lng");

        const lon =
          Number(lonParam);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lon)
        ) {
          throw new Error(
            "Липсват валидни координати lat/lon."
          );
        }

        const [
          geology,
          eastBodiesData,
          blackSeaBodiesData,
          monitoringData,
          geologyProfilesData,
          eastOrdinaryData,
          blackSeaOrdinaryData,
          mineralFacilitiesData,
          section4Data,
          section5Data,
          section7Data,
          blackSeaSection7Data,
          blackSeaAdditionalRegistersData,
          blackSeaInvestigationFeaturesData,
          blackSeaRegionalGeologyData,
          blackSeaProtectionZonesData,
          blackSeaOfficialSection1Data,
          blackSeaOfficialSection2Data,
          blackSeaOfficialSection3Data,
          blackSeaOfficialSection4Data,
          blackSeaOfficialSection5Data,
          blackSeaCurrentRegistersData,

          westernAegeanBodiesData,
          westernAegeanOrdinaryData,
          westernAegeanSection1Data,
          westernAegeanSection2Data,
          westernAegeanSection3Data,
          westernAegeanSection4Data,
          westernAegeanSection5Data,
          westernAegeanSection7Data,
          westernAegeanCurrentRegistersData,
          westernAegeanAdditionalRegistersData,
          westernAegeanInvestigationFeaturesData,
          westernAegeanQuantitativeMonitoringData,
          westernAegeanChemicalMonitoringData,

          danubeBodiesData,
          danubeOrdinaryData,
          danubeSection1Data,
          danubeSection2Data,
          danubeSection3Data,
          danubeSection4Data,
          danubeSection5Data,
          danubeSection7Data,
          danubeCurrentRegistersData,
          danubeClimateData,
        ] = await Promise.all([
          geologyAt(lat, lon),

          fetch(
            "/geology-map/data/bd_ibr_groundwater_bodies_enriched.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_groundwater_bodies.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_ibr_monitoring_2019_2020.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/groundwater_geology_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_ibr_ordinary_groundwater_wells.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_ordinary_groundwater_wells.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/official_water_facilities.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_ibr_section4_pro_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_ibr_section5_environmental_objectives.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_ibr_section7_groundwater_measures.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section7_groundwater_measures.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_additional_groundwater_registers.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_hydrogeological_investigations.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_regional_geology_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_sanitary_protection_zones.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section1_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section2_pressure_risk.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section3_protected_zones.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section4_monitoring_status.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_section5_environmental_objectives.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_bs_current_groundwater_registers.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_groundwater_bodies.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_active_groundwater_facilities.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section1_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section2_pressure_risk.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section3_protected_zones.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section4_monitoring_status.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section5_environmental_objectives.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_section7_groundwater_measures.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_current_groundwater_registers.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_additional_groundwater_registers.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_hydrogeological_investigations.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_quantitative_monitoring.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_wabd_chemical_monitoring.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_groundwater_bodies.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_active_groundwater_facilities.geojson"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_section1_profiles.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_section2_pressure_risk.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_section3_protected_zones.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_section4_monitoring_status.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_section5_objectives.json"
          ).then(r => r.json()),

          Promise.resolve({}),

          fetch(
            "/geology-map/data/bd_danube_current_groundwater_resource.json"
          ).then(r => r.json()),

          fetch(
            "/geology-map/data/bd_danube_climate_scenarios.json"
          ).then(r => r.json()),

        ]);

        const requestedGwb =
          String(params.get("gwb") || "")
            .trim()
            .toUpperCase();

        const requestedGwbs =
          String(params.get("gwbs") || "")
            .split(",")
            .map(code =>
              code.trim().toUpperCase()
            )
            .filter(Boolean);


        /*
          Common source with Sondi EXPERT.

          Spatial information used in drilling
          recommendations must come from the same
          canonical server-side context as /pro.
        */
        let expertContext: any = null;

        try {
          const expertContextUrl =
            "/api/expert-context" +
            "?lat=" +
            encodeURIComponent(String(lat)) +
            "&lng=" +
            encodeURIComponent(String(lon)) +
            (
              requestedGwb
                ? "&gwb=" +
                  encodeURIComponent(
                    requestedGwb
                  )
                : ""
            );

          const expertContextResponse =
            await fetch(
              expertContextUrl,
              {
                cache: "no-store",
              }
            );

          if (expertContextResponse.ok) {
            const payload =
              await expertContextResponse.json();

            if (payload?.success) {
              expertContext = payload;
            }
          } else {
            console.warn(
              "[SONDI DRILLING] EXPERT context HTTP:",
              expertContextResponse.status
            );
          }

        } catch (expertContextError) {
          console.warn(
            "[SONDI DRILLING] EXPERT context unavailable:",
            expertContextError
          );
        }


        const allBodies = [
          ...(danubeBodiesData.features || []),
          ...(eastBodiesData.features || []),
          ...(blackSeaBodiesData.features || []),
          ...(westernAegeanBodiesData.features || []),
        ];

        const spatiallyIntersectingBodies =
          allBodies.filter(
            (feature: AnyFeature) =>
              pointInPolygonGeometry(
                lon,
                lat,
                feature.geometry
              )
          );

        const bodyCode = (
          feature: AnyFeature
        ) =>
          String(
            feature.properties?.canonical_code ||
            feature.properties?.localId ||
            feature.properties?.cod ||
            feature.properties?.code ||
            feature.properties?.gwb_code ||
            ""
          ).trim().toUpperCase();

        const intersectingBodies =
          Array.from(
            new Map(
              spatiallyIntersectingBodies.map(
                (feature: AnyFeature) => [
                  bodyCode(feature),
                  feature,
                ]
              )
            ).values()
          );

        const canonicalContextGwb =
          String(
            expertContext?.gwb || ""
          )
            .trim()
            .toUpperCase();

        const selectedBody =
          (
            requestedGwb
              ? intersectingBodies.find(
                  (feature: AnyFeature) =>
                    bodyCode(feature) === requestedGwb
                )
              : null
          ) ||
          (
            canonicalContextGwb
              ? intersectingBodies.find(
                  (feature: AnyFeature) =>
                    bodyCode(feature) ===
                    canonicalContextGwb
                )
              : null
          ) ||
          intersectingBodies[0] ||
          null;

        const selectedGwbCode =
          selectedBody
            ? bodyCode(selectedBody)
            : "";

        const basinCode =
          selectedGwbCode.startsWith("BG1")
            ? "BG1"
            : selectedGwbCode.startsWith("BG4")
              ? "BG4"
              : selectedGwbCode.startsWith("BG2")
                ? "BG2"
                : selectedGwbCode.startsWith("BG3")
                  ? "BG3"
                  : "";

        const basinName =
          basinCode === "BG1"
            ? "\u0414\u0443\u043d\u0430\u0432\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d"
            : basinCode === "BG4"
              ? "\u0417\u0430\u043f\u0430\u0434\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d"
            : basinCode === "BG2"
              ? "\u0427\u0435\u0440\u043d\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d"
              : basinCode === "BG3"
                ? "\u0418\u0437\u0442\u043e\u0447\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d"
                : "\u041d\u0435\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d \u0440\u0430\u0439\u043e\u043d";

        const selectedGeologyProfile =
          (geologyProfilesData.profiles || []).find(
            (profile: any) =>
              String(
                profile.code ||
                profile.gwb_code ||
                ""
              ).trim().toUpperCase() === selectedGwbCode
          ) || null;

        const bodies = (
          selectedBody
            ? [
                selectedBody,
                ...intersectingBodies.filter(
                  (feature: AnyFeature) =>
                    bodyCode(feature) !== selectedGwbCode
                ),
              ]
            : intersectingBodies
        ).map(
          (feature: AnyFeature) => {
            const properties =
              feature.properties || {};

            const profile =
              (geologyProfilesData.profiles || []).find(
                (item: any) =>
                  String(
                    item.code ||
                    item.gwb_code ||
                    ""
                  ).trim().toUpperCase() ===
                  bodyCode(feature)
              ) || null;

            return {
              ...feature,
              properties: {
                ...properties,

                localId:
                  properties.localId ||
                  properties.canonical_code ||
                  properties.cod ||
                  profile?.code ||
                  "",

                nameText:
                  profile?.name ||
                  properties.groundwater_body_name ||
                  properties.name_bg ||
                  properties.name ||
                  properties.ime ||
                  properties.nameText ||
                  properties.nameTxtInt ||
                  "",

                water_type_bg:
                  properties.water_type_bg ||
                  profile?.water_type ||
                  profile?.collector_type ||
                  "",

                horizon_bg:
                  properties.horizon_bg ||
                  profile?.hydrogeological_horizon ||
                  "",

                gwb_type_name_bg:
                  properties.gwb_type_name_bg ||
                  profile?.aquifer_type_name ||
                  "",
              },
            };
          }
        );

        const eastOrdinaryFeatures = (
          eastOrdinaryData.features || []
        ).filter(
          (feature: AnyFeature) =>
            [
              "ordinary_borehole",
              "combined_well",
              "shaft_well",
            ].includes(
              String(
                feature.properties?.category || ""
              ).trim().toLowerCase()
            )
        );

        const blackSeaOrdinaryFeatures =
          blackSeaOrdinaryData.features || [];

        const westernAegeanOrdinaryFeatures =
          westernAegeanOrdinaryData.features || [];

        const selectedOrdinaryFeatures =
          basinCode === "BG4"
            ? westernAegeanOrdinaryFeatures
            : basinCode === "BG2"
              ? blackSeaOrdinaryFeatures
              : basinCode === "BG3"
                ? eastOrdinaryFeatures
                : [];

        const measuredFacilities = (
          features: AnyFeature[]
        ) =>
          features
            .filter(
              (feature: AnyFeature) =>
                feature.geometry?.type === "Point" &&
                Array.isArray(
                  feature.geometry.coordinates
                ) &&
                feature.geometry.coordinates.length >= 2
            )
            .map(
              (feature: AnyFeature) => ({
                properties:
                  feature.properties || {},

                distanceKm:
                  haversineKm(
                    lat,
                    lon,
                    Number(
                      feature.geometry?.coordinates?.[1]
                    ),
                    Number(
                      feature.geometry?.coordinates?.[0]
                    )
                  ),
              })
            )
            .filter(
              (item: any) =>
                Number.isFinite(item.distanceKm) &&
                Number(item.distanceKm) > 0.01
            )
            .sort(
              (first: any, second: any) =>
                first.distanceKm -
                second.distanceKm
            );

        const ordinaryNearby =
          measuredFacilities(
            selectedOrdinaryFeatures
          );

        const ordinaryWithin5Km =
          ordinaryNearby.filter(
            (item: any) =>
              item.distanceKm <= 5
          );

        const ordinarySameBody =
          ordinaryWithin5Km.filter(
            (item: any) =>
              String(
                item.properties
                  ?.canonical_code ||
                item.properties
                  ?.groundwater_body_code ||
                item.properties
                  ?.gwb_code ||
                ""
              ).trim().toUpperCase() ===
              selectedGwbCode
          );

        const numericValues = (
          records: any[],
          field: string
        ) =>
          records
            .map(
              (record: any) =>
                record.properties?.[field]
            )
            .filter(
              (value: any) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== "" &&
                Number.isFinite(Number(value)) &&
                Number(value) >= 0
            )
            .map(
              (value: any) =>
                Number(value)
            )
            .sort(
              (first: number, second: number) =>
                first - second
            );

        const preferredDepthRecords =
          ordinarySameBody.length >= 3
            ? ordinarySameBody
            : ordinaryWithin5Km;

        const depthValues = numericValues(
          preferredDepthRecords,
          "depth_m"
        ).filter(
          (value: number) =>
            value > 0
        );

        const staticLevelValues = numericValues(
          preferredDepthRecords,
          "static_water_level_m"
        );

        const median = (
          values: number[]
        ) => {
          if (!values.length) {
            return null;
          }

          const middle =
            Math.floor(values.length / 2);

          return values.length % 2 === 1
            ? values[middle]
            : (
                values[middle - 1] +
                values[middle]
              ) / 2;
        };

        const mineralNearby = measuredFacilities(
          (
            mineralFacilitiesData.features || []
          ).filter(
            (feature: AnyFeature) =>
              String(
                feature.properties
                  ?.display_category ||
                ""
              ).trim().toLowerCase() ===
              "минерален сондаж"
          )
        );

        const findProfile = (
          dataset: any
        ) =>
          (
            dataset?.profiles || []
          ).find(
            (profile: any) =>
              String(
                profile.code ||
                profile.gwb_code ||
                ""
              ).trim().toUpperCase() ===
              selectedGwbCode
          ) || null;

        const findOfficialProfile = (
          dataset: any
        ): any | null => {
          if (
            !selectedGwbCode ||
            !dataset
          ) {
            return null;
          }

          const normalize = (
            value: unknown
          ) =>
            String(value ?? "")
              .trim()
              .toUpperCase();

          const wanted =
            normalize(selectedGwbCode);

          const candidates: any[] = [];

          if (Array.isArray(dataset)) {
            candidates.push(...dataset);
          }

          if (Array.isArray(dataset?.profiles)) {
            candidates.push(...dataset.profiles);
          }

          if (Array.isArray(dataset?.records)) {
            candidates.push(...dataset.records);
          }

          if (
            dataset?.profiles &&
            !Array.isArray(dataset.profiles) &&
            typeof dataset.profiles === "object"
          ) {
            const direct =
              dataset.profiles[wanted];

            if (direct) {
              return direct;
            }

            for (
              const [key, value]
              of Object.entries(dataset.profiles)
            ) {
              if (
                normalize(key) === wanted
              ) {
                return value;
              }
            }
          }

          return (
            candidates.find(
              (item: any) =>
                [
                  item?.canonical_code,
                  item?.code,
                  item?.gwb_code,
                  item?.gwbCode,
                  item?.groundwater_body_code,
                  item?.localId,
                  item?.cod,
                ].some(
                  value =>
                    normalize(value) === wanted
                )
            ) || null
          );
        };

        const findBlackSeaOfficialProfile = (
          dataset: any
        ): any | null => {
          if (
            basinCode !== "BG2" ||
            !selectedGwbCode ||
            !dataset
          ) {
            return null;
          }

          const normalize = (
            value: unknown
          ) =>
            String(value ?? "")
              .trim()
              .toUpperCase();

          const wanted = normalize(
            selectedGwbCode
          );

          const candidates: any[] = [];

          if (Array.isArray(dataset)) {
            candidates.push(...dataset);
          }

          if (Array.isArray(dataset?.profiles)) {
            candidates.push(
              ...dataset.profiles
            );
          }

          if (Array.isArray(dataset?.records)) {
            candidates.push(
              ...dataset.records
            );
          }

          if (
            dataset?.profiles &&
            !Array.isArray(dataset.profiles) &&
            typeof dataset.profiles === "object"
          ) {
            const direct =
              dataset.profiles[wanted];

            if (direct) {
              return direct;
            }

            for (
              const [key, value]
              of Object.entries(dataset.profiles)
            ) {
              if (normalize(key) === wanted) {
                return value;
              }
            }
          }

          if (
            dataset?.profiles_by_groundwater_body_code &&
            typeof dataset
              .profiles_by_groundwater_body_code === "object"
          ) {
            const direct =
              dataset
                .profiles_by_groundwater_body_code
                [wanted];

            if (direct) {
              return direct;
            }
          }

          return candidates.find(
            (item: any) =>
              [
                item?.code,
                item?.gwb_code,
                item?.gwbCode,
                item?.groundwater_body_code,
                item?.localId,
                item?.cod,
              ].some(
                value =>
                  normalize(value) === wanted
              )
          ) || null;
        };

        const westernAegeanOfficialSection1 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection1Data
              )
            : null;

        const danubeOfficialSection1 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection1Data
              )
            : null;

        const danubeOfficialSection2 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection2Data
              )
            : null;

        const danubeOfficialSection3 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection3Data
              )
            : null;

        const danubeOfficialSection4 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection4Data
              )
            : null;

        const danubeOfficialSection5 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection5Data
              )
            : null;

        const danubeOfficialSection7 =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeSection7Data
              )
            : null;

        const danubeCurrentRegisters =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeCurrentRegistersData
              )
            : null;

        const danubeClimate =
          basinCode === "BG1"
            ? findOfficialProfile(
                danubeClimateData
              )
            : null;

        const westernAegeanOfficialSection2 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection2Data
              )
            : null;

        const westernAegeanOfficialSection3 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection3Data
              )
            : null;

        const westernAegeanOfficialSection4 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection4Data
              )
            : null;

        const westernAegeanOfficialSection5 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection5Data
              )
            : null;

        const westernAegeanOfficialSection7 =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanSection7Data
              )
            : null;

        const westernAegeanCurrentRegisters =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanCurrentRegistersData
              )
            : null;

        const westernAegeanAdditionalRegisters =
          basinCode === "BG4"
            ? findOfficialProfile(
                westernAegeanAdditionalRegistersData
              )
            : null;

        const westernAegeanChemicalMonitoring =
          Array.isArray(
            westernAegeanOfficialSection4
              ?.chemical_monitoring
          )
            ? westernAegeanOfficialSection4
                .chemical_monitoring
            : [];

        const westernAegeanQuantitativeMonitoring =
          Array.isArray(
            westernAegeanOfficialSection4
              ?.quantitative_monitoring
          )
            ? westernAegeanOfficialSection4
                .quantitative_monitoring
            : [];

        const westernAegeanChemicalRisk =
          westernAegeanOfficialSection2
            ?.chemical_risk || null;

        const westernAegeanQuantitativeRisk =
          westernAegeanOfficialSection2
            ?.quantitative_risk || null;

        const blackSeaOfficialSection1 =
          findBlackSeaOfficialProfile(
            blackSeaOfficialSection1Data
          );

        const blackSeaOfficialSection2 =
          findBlackSeaOfficialProfile(
            blackSeaOfficialSection2Data
          );

        const blackSeaOfficialSection3 =
          findBlackSeaOfficialProfile(
            blackSeaOfficialSection3Data
          );

        const blackSeaOfficialSection4 =
          findBlackSeaOfficialProfile(
            blackSeaOfficialSection4Data
          );

        const blackSeaOfficialSection5 =
          findBlackSeaOfficialProfile(
            blackSeaOfficialSection5Data
          );

        const blackSeaCurrentRegisters =
          findBlackSeaOfficialProfile(
            blackSeaCurrentRegistersData
          );

        const blackSeaChemicalMonitoring =
          Array.isArray(
            blackSeaOfficialSection4
              ?.chemical_monitoring
          )
            ? blackSeaOfficialSection4
                .chemical_monitoring
            : [];

        const blackSeaQuantitativeMonitoring =
          Array.isArray(
            blackSeaOfficialSection4
              ?.quantitative_monitoring
          )
            ? blackSeaOfficialSection4
                .quantitative_monitoring
            : [];

        const blackSeaChemicalRisk =
          blackSeaOfficialSection2
            ?.chemical_risk || null;

        const blackSeaQuantitativeRisk =
          blackSeaOfficialSection2
            ?.quantitative_risk || null;

        const blackSeaPollutionSources =
          Array.isArray(
            blackSeaOfficialSection2
              ?.pollution_sources
          )
            ? blackSeaOfficialSection2
                .pollution_sources
            : [];

        const section4 =
          basinCode === "BG4"
            ? westernAegeanOfficialSection4
            : basinCode === "BG3"
              ? findProfile(section4Data)
              : basinCode === "BG2" &&
                blackSeaOfficialSection4
                ? {
                    ...blackSeaOfficialSection4,

                    comparison: {
                      risk_2022_2027:
                        blackSeaOfficialSection4
                          .chemical_risk ||
                        blackSeaChemicalRisk
                          ?.risk_label ||
                        null,

                      status_2022_2027:
                        blackSeaOfficialSection4
                          .overall_status_purb3 ||
                        blackSeaOfficialSection4
                          .chemical_status ||
                        null,

                      status_2016_2021:
                        blackSeaOfficialSection4
                          .overall_status_purb2 ||
                        null,
                    },

                    chemical_monitoring:
                      blackSeaChemicalMonitoring,

                    quantitative_monitoring:
                      blackSeaQuantitativeMonitoring,

                    tests:
                      blackSeaOfficialSection4
                        .chemical_tests || [],

                    water_balance:
                      blackSeaCurrentRegisters
                        ?.current_resource
                        ? {
                            ...(
                              blackSeaOfficialSection4
                                .water_balance || {}
                            ),

                            natural_resource_l_s:
                              blackSeaCurrentRegisters
                                .current_resource
                                .natural_resource_l_s,

                            available_resource_l_s:
                              blackSeaCurrentRegisters
                                .current_resource
                                .available_resource_l_s,

                            permitted_abstraction_l_s:
                              blackSeaCurrentRegisters
                                .current_resource
                                .authorized_abstraction_l_s,

                            household_abstraction_l_s:
                              blackSeaCurrentRegisters
                                .current_resource
                                .household_abstraction_l_s,

                            total_abstraction_l_s:
                              Number(
                                blackSeaCurrentRegisters
                                  .current_resource
                                  .authorized_abstraction_l_s || 0
                              ) +
                              Number(
                                blackSeaCurrentRegisters
                                  .current_resource
                                  .household_abstraction_l_s || 0
                              ),

                            free_resource_l_s:
                              blackSeaCurrentRegisters
                                .current_resource
                                .free_resource_l_s,

                            exploitation_index:
                              blackSeaCurrentRegisters
                                .current_resource
                                .exploitation_index,

                            derived_load_percent:
                              Number(
                                blackSeaCurrentRegisters
                                  .current_resource
                                  .exploitation_index
                              ) * 100,

                            quantitative_status:
                              blackSeaOfficialSection4
                                .quantitative_status ||
                              blackSeaOfficialSection4
                                .water_balance
                                ?.status ||
                              null,
                          }
                        : blackSeaOfficialSection4
                            .water_balance
                          ? {
                              ...blackSeaOfficialSection4
                                .water_balance,

                              quantitative_status:
                                blackSeaOfficialSection4
                                  .quantitative_status ||
                                blackSeaOfficialSection4
                                  .water_balance
                                  ?.status ||
                                null,
                            }
                          : null,

                    upward_trend:
                      blackSeaOfficialSection4
                        .upward_trend === true
                        ? "\u0434\u0430"
                        : blackSeaOfficialSection4
                            .upward_trend === false
                          ? "\u043d\u0435"
                          : null,

                    drinking_monitoring:
                      blackSeaChemicalMonitoring.filter(
                        (station: any) =>
                          station
                            ?.drinking_water_monitoring === true
                      ),

                    trend_series: [],
                  }
                : null;

        const section5 =
          basinCode === "BG4"
            ? westernAegeanOfficialSection5
            : basinCode === "BG3"
              ? findProfile(section5Data)
              : basinCode === "BG2"
                ? blackSeaOfficialSection5
                : null;

        const section7 =
          basinCode === "BG4"
            ? westernAegeanOfficialSection7
            : basinCode === "BG3"
              ? findProfile(section7Data)
              : basinCode === "BG2"
                ? findProfile(
                    blackSeaSection7Data
                  )
                : null;

        const blackSeaAdditionalProfile =
          basinCode === "BG2"
            ? (
                blackSeaAdditionalRegistersData
                  ?.profiles?.[selectedGwbCode] || null
              )
            : null;

        const blackSeaRegionalGeology =
          basinCode === "BG2"
            ? (
                blackSeaRegionalGeologyData
                  ?.profiles_by_groundwater_body_code
                  ?.[selectedGwbCode] || null
              )
            : null;

        const exactProtectionZonesAtPoint =
          basinCode === "BG2"
            ? (
                blackSeaProtectionZonesData
                  ?.features || []
              ).filter(
                (feature: AnyFeature) =>
                  feature.properties
                    ?.basin_code === "BG2" &&
                  pointInPolygonGeometry(
                    lon,
                    lat,
                    feature.geometry
                  )
              )
            : [];

        const westernAegeanGeologyProfile =
          basinCode === "BG4" &&
          westernAegeanOfficialSection1
            ? {
                ...selectedGeologyProfile,

                code:
                  westernAegeanOfficialSection1
                    .code ||
                  selectedGwbCode,

                name:
                  westernAegeanOfficialSection1
                    .name,

                aquifer_type_name:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.aquifer_type,

                water_type:
                  westernAegeanOfficialSection1
                    ?.typology
                    ?.groundwater_body_type,

                hydrogeological_horizon:
                  westernAegeanOfficialSection1
                    ?.typology
                    ?.vertical_horizon,

                lithology:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.lithology,

                stratigraphy:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.stratigraphy,

                aquifer_thickness_m:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.aquifer_thickness_m,

                filtration_coefficient_m_day:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                hydraulic_conductivity_m_day:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                transmissivity_m2_day:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.transmissivity_m2_day,

                pressure_condition:
                  westernAegeanOfficialSection1
                    ?.detailed
                    ?.pressure_condition,

                is_detailed_point_geology:
                  false,
              }
            : null;

        const danubeGeologyProfile =
          basinCode === "BG1" &&
          danubeOfficialSection1
            ? {
                ...selectedGeologyProfile,

                code:
                  danubeOfficialSection1.code ||
                  selectedGwbCode,

                name:
                  danubeOfficialSection1.name ||
                  selectedGeologyProfile?.name,

                aquifer_type_name:
                  danubeOfficialSection1
                    ?.detailed
                    ?.aquifer_type,

                water_type:
                  danubeOfficialSection1
                    ?.typology
                    ?.groundwater_body_type,

                collector_type:
                  danubeOfficialSection1
                    ?.typology
                    ?.collector_type ||
                  danubeOfficialSection1
                    ?.detailed
                    ?.collector_type,

                hydrogeological_horizon:
                  danubeOfficialSection1
                    ?.typology
                    ?.vertical_horizon,

                lithology:
                  danubeOfficialSection1
                    ?.detailed
                    ?.lithology,

                stratigraphy:
                  danubeOfficialSection1
                    ?.detailed
                    ?.stratigraphy,

                aquifer_thickness_m:
                  danubeOfficialSection1
                    ?.detailed
                    ?.aquifer_thickness_m ??
                  danubeOfficialSection1
                    ?.detailed
                    ?.average_aquifer_thickness_m,

                filtration_coefficient_m_day:
                  danubeOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                hydraulic_conductivity_m_day:
                  danubeOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                transmissivity_m2_day:
                  danubeOfficialSection1
                    ?.detailed
                    ?.transmissivity_m2_day,

                pressure_condition:
                  danubeOfficialSection1
                    ?.detailed
                    ?.pressure_condition,

                is_detailed_point_geology:
                  false,
              }
            : null;

        const blackSeaGeologyProfile =
          basinCode === "BG2" &&
          blackSeaOfficialSection1
            ? {
                ...selectedGeologyProfile,

                code:
                  blackSeaOfficialSection1.code ||
                  selectedGwbCode,

                name:
                  blackSeaOfficialSection1.name ||
                  blackSeaRegionalGeology
                    ?.groundwater_body_name ||
                  selectedGeologyProfile?.name,

                aquifer_type_name:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.aquifer_type ||
                  blackSeaOfficialSection1
                    ?.typology
                    ?.collector_type ||
                  blackSeaRegionalGeology
                    ?.aquifer_environment,

                water_type:
                  blackSeaOfficialSection1
                    ?.typology
                    ?.groundwater_body_type ||
                  blackSeaOfficialSection1
                    ?.typology
                    ?.collector_type ||
                  (
                    blackSeaRegionalGeology
                      ?.aquifer_environment
                      ? `${blackSeaRegionalGeology.aquifer_environment} \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430`
                      : null
                  ),

                collector_type:
                  blackSeaOfficialSection1
                    ?.typology
                    ?.collector_type ||
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.collector_type,

                hydrogeological_horizon:
                  blackSeaOfficialSection1
                    ?.typology
                    ?.vertical_horizon ||
                  blackSeaRegionalGeology
                    ?.hydrogeological_horizons,

                lithology:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.lithology ||
                  null,

                stratigraphy:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.stratigraphy,

                aquifer_thickness_m:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.aquifer_thickness_m ??
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.average_aquifer_thickness_m,

                filtration_coefficient_m_day:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                hydraulic_conductivity_m_day:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.hydraulic_conductivity_m_day,

                transmissivity_m2_day:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.transmissivity_m2_day,

                pressure_condition:
                  blackSeaOfficialSection1
                    ?.detailed
                    ?.pressure_condition,

                regional_geological_age:
                  blackSeaRegionalGeology
                    ?.geological_age_label,

                regional_explanation:
                  blackSeaRegionalGeology
                    ?.regional_explanation,

                is_detailed_point_geology:
                  false,
              }
            : null;

        const effectiveGeologyProfile =
          danubeGeologyProfile ||
          westernAegeanGeologyProfile ||
          blackSeaGeologyProfile ||
          (
            blackSeaRegionalGeology
              ? {
                  ...selectedGeologyProfile,
                  code:
                    blackSeaRegionalGeology
                      .groundwater_body_code,
                  name:
                    blackSeaRegionalGeology
                      .groundwater_body_name,
                  aquifer_type_name:
                    blackSeaRegionalGeology
                      .aquifer_environment,
                  water_type:
                    blackSeaRegionalGeology
                      .aquifer_environment
                      ? `${blackSeaRegionalGeology.aquifer_environment} \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430`
                      : null,
                  hydrogeological_horizon:
                    blackSeaRegionalGeology
                      .hydrogeological_horizons,
                  lithology:
                    blackSeaRegionalGeology
                      .geological_age_label
                      ? `\u0420\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0432\u044a\u0437\u0440\u0430\u0441\u0442: ${blackSeaRegionalGeology.geological_age_label}`
                      : null,
                  regional_geological_age:
                    blackSeaRegionalGeology
                      .geological_age_label,
                  regional_explanation:
                    blackSeaRegionalGeology
                      .regional_explanation,
                  is_detailed_point_geology:
                    false,
                }
              : selectedGeologyProfile
          );

        const registeredInvestigationNearby =
          basinCode === "BG4"
            ? measuredFacilities(
                (
                  westernAegeanInvestigationFeaturesData
                    ?.features || []
                ).filter(
                  (feature: any) =>
                    String(
                      feature.properties
                        ?.canonical_code ||
                      feature.properties
                        ?.gwb_code ||
                      ""
                    ).trim().toUpperCase() ===
                    selectedGwbCode
                )
              )
            : basinCode === "BG2"
              ? measuredFacilities(
                  (
                    blackSeaInvestigationFeaturesData
                      ?.features || []
                  ).filter(
                    (feature: any) =>
                      String(
                        feature.properties?.gwb_code || ""
                      ).trim().toUpperCase() ===
                      selectedGwbCode
                  )
                )
              : [];

        const professionalDrilling = {
          basinCode,

          nearestFault: null as any,

          danubeOfficialSection1,
          danubeOfficialSection2,
          danubeOfficialSection3,
          danubeOfficialSection4,
          danubeOfficialSection5,
          danubeOfficialSection7,
          danubeCurrentRegisters,
          danubeClimate,

          westernAegeanOfficialSection1,
          westernAegeanOfficialSection2,
          westernAegeanOfficialSection3,
          westernAegeanOfficialSection4,
          westernAegeanOfficialSection5,
          westernAegeanCurrentRegisters,
          westernAegeanAdditionalRegisters,
          westernAegeanChemicalMonitoring,
          westernAegeanQuantitativeMonitoring,
          westernAegeanChemicalRisk,
          westernAegeanQuantitativeRisk,


          additionalGroundwaterRegisters:
            basinCode === "BG4"
              ? westernAegeanAdditionalRegisters
              : basinCode === "BG2"
                ? blackSeaAdditionalProfile
                : null,

          blackSeaOfficialSection1,

          blackSeaOfficialSection2,

          blackSeaOfficialSection3,

          blackSeaOfficialSection4,

          blackSeaOfficialSection5,

          blackSeaCurrentRegisters,

          blackSeaChemicalMonitoring,

          blackSeaQuantitativeMonitoring,

          blackSeaChemicalRisk,

          blackSeaQuantitativeRisk,

          blackSeaPollutionSources,

          regionalGeology:
            blackSeaRegionalGeology,

          exactProtectionZonesAtPoint,

          isInsideExactProtectionZone:
            exactProtectionZonesAtPoint.length > 0,

          registeredHydrogeologicalInvestigations:
            registeredInvestigationNearby
              .filter(
                (item: any) => item.distanceKm <= 25
              )
              .slice(0, 12),

          nearestHydrogeologicalInvestigation:
            registeredInvestigationNearby[0] || null,
          basinName,
          groundwaterBodyCode:
            selectedGwbCode,

          geologyProfile:
            effectiveGeologyProfile,

          nearestOrdinary:
            ordinaryNearby[0] || null,

          ordinaryWithin5Km:
            ordinaryWithin5Km.slice(0, 12),

          ordinaryCount1Km:
            ordinaryNearby.filter(
              (item: any) =>
                item.distanceKm <= 1
            ).length,

          ordinaryCount3Km:
            ordinaryNearby.filter(
              (item: any) =>
                item.distanceKm <= 3
            ).length,

          ordinaryCount5Km:
            ordinaryWithin5Km.length,

          ordinarySameBodyCount:
            ordinarySameBody.length,

          depthMin:
            depthValues.length
              ? depthValues[0]
              : null,

          depthMax:
            depthValues.length
              ? depthValues[
                  depthValues.length - 1
                ]
              : null,

          depthMedian:
            median(depthValues),

          depthCount:
            depthValues.length,

          staticMin:
            staticLevelValues.length
              ? staticLevelValues[0]
              : null,

          staticMax:
            staticLevelValues.length
              ? staticLevelValues[
                  staticLevelValues.length - 1
                ]
              : null,

          staticMedian:
            median(staticLevelValues),

          staticCount:
            staticLevelValues.length,

          nearestMineral:
            mineralNearby[0] || null,

          mineralsWithin10Km:
            mineralNearby.filter(
              (item: any) =>
                item.distanceKm <= 10
            ).slice(0, 5),

          section4,
          section5,
          section7,
        };

        /*
          Synchronise drilling spatial evidence
          with the canonical EXPERT spatial profile.
        */
        const expertSpatial =
          expertContext?.spatial || null;

        if (expertSpatial) {

          professionalDrilling.nearestOrdinary =
            expertSpatial.nearestOrdinaryWell ??
            null;

          professionalDrilling.nearestFault =
            expertSpatial.nearestFault ??
            null;

          professionalDrilling.ordinaryCount1Km =
            expertSpatial.counts
              ?.ordinaryWells?.km1 ??
            0;

          professionalDrilling.ordinaryCount3Km =
            expertSpatial.counts
              ?.ordinaryWells?.km3 ??
            0;

          professionalDrilling.ordinaryCount5Km =
            expertSpatial.counts
              ?.ordinaryWells?.km5 ??
            0;

          const expertOrdinaryStatistics =
            expertSpatial.ordinaryStatistics ||
            null;

          if (expertOrdinaryStatistics) {

            professionalDrilling.depthMin =
              expertOrdinaryStatistics.depthMin ??
              null;

            professionalDrilling.depthMax =
              expertOrdinaryStatistics.depthMax ??
              null;

            professionalDrilling.depthMedian =
              expertOrdinaryStatistics.depthMedian ??
              null;

            professionalDrilling.depthCount =
              expertOrdinaryStatistics.depthCount ??
              0;

            professionalDrilling.staticMin =
              expertOrdinaryStatistics.staticLevelMin ??
              null;

            professionalDrilling.staticMax =
              expertOrdinaryStatistics.staticLevelMax ??
              null;

            professionalDrilling.staticMedian =
              expertOrdinaryStatistics.staticLevelMedian ??
              null;

            professionalDrilling.staticCount =
              expertOrdinaryStatistics.staticLevelCount ??
              0;
          }
        }


        let nearest = null as
          | {
              feature: AnyFeature;
              distanceKm: number;
            }
          | null;

        const selectedMonitoringFeatures =
          basinCode === "BG4"
            ? (
                westernAegeanQuantitativeMonitoringData
                  ?.features || []
              )
            : basinCode === "BG2"
              ? blackSeaQuantitativeMonitoring
                  .filter(
                    (station: any) =>
                      Number.isFinite(
                        Number(station?.latitude)
                      ) &&
                      Number.isFinite(
                        Number(station?.longitude)
                      )
                  )
                  .map(
                    (station: any) => ({
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: [
                          Number(station.longitude),
                          Number(station.latitude),
                        ],
                      },
                      properties: {
                        ...station,
                        gwb_code: selectedGwbCode,
                      },
                    })
                  )
              : monitoringData.features || [];

        for (
          const feature of
            selectedMonitoringFeatures
        ) {
          if (
            feature.geometry?.type !==
            "Point"
          ) {
            continue;
          }

          const c =
            feature.geometry.coordinates;

          const d =
            haversineKm(
              lat,
              lon,
              c[1],
              c[0]
            );

          if (
            !nearest ||
            d < nearest.distanceKm
          ) {
            nearest = {
              feature,
              distanceKm: d,
            };
          }
        }

        const maximumMonitoringDistanceKm = 25;

        const monitoringProperties: any =
          nearest?.feature?.properties || {};

        const monitoringGroundwaterBodyCode = [
          monitoringProperties.canonical_code,
          monitoringProperties.gwb_code,
          monitoringProperties.groundwater_body_code,
          monitoringProperties.groundwaterBodyCode,
          monitoringProperties.water_body_code,
          monitoringProperties.waterBodyCode,
          monitoringProperties.gwbCode,
          monitoringProperties.GWB_CODE,
          monitoringProperties.GWBCode,
          monitoringProperties.pvt_code,
          monitoringProperties.PVT_CODE,
        ]
          .map((value: any) =>
            String(value || "").trim().toUpperCase()
          )
          .find((value: string) =>
            /^BG[234]G/.test(value)
          ) || "";

        const monitoringMatchesSelectedBody =
          monitoringGroundwaterBodyCode
            ? monitoringGroundwaterBodyCode === selectedGwbCode
            : basinCode === "BG3";

        const representativeMonitoring =
          nearest &&
          nearest.distanceKm <= maximumMonitoringDistanceKm &&
          monitoringMatchesSelectedBody
            ? nearest
            : null;

        const basinSpecificGeology =
          basinCode === "BG3"
            ? geology
            : (
                basinCode === "BG1" ||
                basinCode === "BG2" ||
                basinCode === "BG4"
              ) &&
              effectiveGeologyProfile
              ? {
                  status:
                    "official_groundwater_body_profile",

                  unit: {
                    id: Number(
                      selectedBody
                        ?.properties
                        ?.OBJECTID || 0
                    ),

                    code:
                      effectiveGeologyProfile
                        .hydrogeological_horizon ||
                      effectiveGeologyProfile.code ||
                      selectedGwbCode,

                    name_bg:
                      effectiveGeologyProfile.name ||
                      effectiveGeologyProfile
                        .aquifer_type_name ||
                      "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u0442\u044f\u043b\u043e",

                    name_en:
                      String(
                        selectedBody
                          ?.properties
                          ?.name_en ||
                        selectedBody
                          ?.properties
                          ?.nameText ||
                        selectedBody
                          ?.properties
                          ?.nameTxtInt ||
                        ""
                      ),
                  },

                  source:
                    basinCode === "BG1"
                      ? "BDDR PURB3 Section 1"
                      : basinCode === "BG4"
                        ? "BDZBR PURB3 Section 1"
                        : "\u0411\u0414 \u0427\u0435\u0440\u043d\u043e\u043c\u043e\u0440\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d \u2014 \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e",

                  is_groundwater_body_profile:
                    true,
                }
              : null;

        setData({
          professionalDrilling,
          lat,
          lon,
          geology: basinSpecificGeology,
          bodies,
          monitoring: representativeMonitoring,
        });
      } catch (e: any) {
        setError(
          e?.message || String(e)
        );
      }
    }

    run();
  }, []);

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>Подробен геоложки анализ</h1>
          <p>{error}</p>
          <a href="/geology">
            ← Обратно към картата
          </a>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          Зареждане на анализа…
        </div>
      </main>
    );
  }

  const professional =
    data.professionalDrilling;

  const geologyProfile =
    professional?.geologyProfile || null;

  const additionalGroundwaterRegisters =
    professional?.additionalGroundwaterRegisters || null;

  const registeredHydrogeologicalInvestigations =
    Array.isArray(
      professional?.registeredHydrogeologicalInvestigations
    )
      ? professional.registeredHydrogeologicalInvestigations
      : [];

  const nearestHydrogeologicalInvestigation =
    professional?.nearestHydrogeologicalInvestigation || null;

  const lithologyText = [
    geologyProfile?.lithology,
    geologyProfile?.water_type,
    geologyProfile?.collector_type,
    geologyProfile?.aquifer_type_name,
    geologyProfile?.recharge_cover_layers,
    geologyProfile?.hydrogeological_horizon,
  ].filter(Boolean)
   .join(" ")
   .toLowerCase();

  const bg1OfficialKarstProfile =
    professional?.basinCode === "BG1" &&
    (
      /\u043a\u0430\u0440\u0441\u0442/.test(
        lithologyText
      ) ||
      String(
        geologyProfile?.aquifer_type_name ||
        geologyProfile?.water_type ||
        geologyProfile?.collector_type ||
        ""
      )
        .toLowerCase()
        .includes("\u043a\u0430\u0440\u0441\u0442")
    );

  const bg1MixedKarstPoreProfile =
    professional?.basinCode === "BG1" &&
    String(
      geologyProfile?.name ||
      ""
    )
      .toLowerCase()
      .includes("\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432");

  const bg2OfficialTypeText =
    professional?.basinCode === "BG2"
      ? [
          geologyProfile?.name,
          geologyProfile?.aquifer_type_name,
          geologyProfile?.water_type,
          geologyProfile?.collector_type,
        ]
          .filter(Boolean)
          .join(" | ")
          .toLowerCase()
      : "";

  const bg2BodyTypeText =
    professional?.basinCode === "BG2"
      ? [
          geologyProfile?.name,
          geologyProfile?.aquifer_type_name,
          geologyProfile?.water_type,
        ]
          .filter(Boolean)
          .join(" | ")
          .toLowerCase()
      : "";

  const bg2CollectorTypeText =
    professional?.basinCode === "BG2"
      ? String(
          geologyProfile?.collector_type || ""
        ).toLowerCase()
      : "";

  const bg2BodyFracturedKarst =
    bg2BodyTypeText.includes("\u043a\u0430\u0440\u0441\u0442") &&
    (
      bg2BodyTypeText.includes("\u043f\u0443\u043a\u043d\u0430\u0442") ||
      bg2BodyTypeText.includes("\u043d\u0430\u043f\u0443\u043a\u0430\u043d")
    );

  const bg2CollectorFracturedKarst =
    bg2CollectorTypeText.includes("\u043a\u0430\u0440\u0441\u0442") &&
    bg2CollectorTypeText.includes("\u043f\u0443\u043a\u043d\u0430\u0442");

  const bg2FracturedKarstProfile =
    professional?.basinCode === "BG2" &&
    (
      bg2BodyFracturedKarst ||
      bg2CollectorFracturedKarst
    );

  const bg2KarstPoreProfile =
    professional?.basinCode === "BG2" &&
    !bg2FracturedKarstProfile &&
    (
      bg2OfficialTypeText.includes("\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432") ||
      bg2OfficialTypeText.includes("\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e -\u043f\u043e\u0440\u043e\u0432") ||
      (
        bg2CollectorTypeText.includes("\u043a\u0430\u0440\u0441\u0442") &&
        bg2CollectorTypeText.includes("\u043f\u043e\u0440\u043e\u0432")
      )
    );

  const bg2KarstProfile =
    professional?.basinCode === "BG2" &&
    !bg2KarstPoreProfile &&
    !bg2FracturedKarstProfile &&
    bg2OfficialTypeText.includes("\u043a\u0430\u0440\u0441\u0442");

  const bg2FracturedProfile =
    professional?.basinCode === "BG2" &&
    !bg2KarstPoreProfile &&
    !bg2FracturedKarstProfile &&
    bg2OfficialTypeText.includes("\u043f\u0443\u043a\u043d\u0430\u0442");

  const bg2PoreProfile =
    professional?.basinCode === "BG2" &&
    !bg2KarstPoreProfile &&
    !bg2FracturedKarstProfile &&
    !bg2KarstProfile &&
    !bg2FracturedProfile &&
    bg2OfficialTypeText.includes("\u043f\u043e\u0440\u043e\u0432");

  const looseGround =
    professional?.basinCode === "BG2"
      ? (
          bg2PoreProfile ||
          bg2KarstPoreProfile
        )
      : (
          (
            !bg1OfficialKarstProfile ||
            bg1MixedKarstPoreProfile
          ) &&
          /\u043f\u044f\u0441|\u0447\u0430\u043a\u044a\u043b|\u0430\u043b\u0443\u0432|\u043d\u0430\u043d\u043e\u0441|\u0440\u043e\u0445\u043a|\u043b\u044c\u043e\u0441|\u043f\u043e\u0440\u043e\u0432|\u043a\u0432\u0430\u0442\u0435\u0440\u043d\u0435\u0440|\u0440\u0435\u0447\u043d|\u0433\u0440\u0430\u0432|\u0441\u0435\u0434\u0438\u043c\u0435\u043d\u0442/.test(
            lithologyText
          )
        );

  const rockGround =
    professional?.basinCode === "BG2"
      ? (
          bg2KarstProfile ||
          bg2FracturedProfile ||
          bg2FracturedKarstProfile ||
          bg2KarstPoreProfile
        )
      : (
          bg1OfficialKarstProfile ||
          /\u0432\u0430\u0440\u043e\u0432|\u0434\u043e\u043b\u043e\u043c\u0438\u0442|\u0433\u0440\u0430\u043d\u0438\u0442|\u0433\u043d\u0430\u0439\u0441|\u0441\u043a\u0430\u043b|\u043f\u0443\u043a\u043d\u0430\u0442|\u043a\u0430\u0440\u0441\u0442/.test(
            lithologyText
          )
        );

  const mixedGround =
    professional?.basinCode === "BG2"
      ? bg2KarstPoreProfile
      : looseGround && rockGround;

  const drillingTechnology =
    mixedGround
      ? "Възможна комбинирана технология: обсаждане или промивно преминаване през нестабилните горни пластове и преценка за пневмоударно сондиране след достигане на устойчива скала."
      : looseGround
        ? "При потвърдени рохкави седименти може да се обсъди ротационно сондиране с промивка и своевременно обсаждане на нестабилните участъци."
        : rockGround
          ? "При потвърдена компактна скала може да се обсъди пневмоударно сондиране с въздух или друга подходяща технология за скални условия."
          : "Няма достатъчно официални литоложки данни за надеждна препоръка на конкретна сондажна технология.";

  const casingRecommendation =
    looseGround
      ? "Вероятно ще е необходимо обсаждане в рохкавите и нестабилни интервали. Материалът, диаметърът и дълбочината на обсадните тръби се определят по сондажния разрез и проекта."
      : rockGround
        ? "Начално обсаждане и санитарно уплътняване се преценяват според покривните пластове. В здрава скала конструкцията зависи от действително установените условия."
        : "Необходимостта от обсадни тръби следва да се определи след теренно проучване и установяване на реалните пластове.";

  const bg2PoreWithoutOfficialLithology =
    professional?.basinCode === "BG2" &&
    !geologyProfile?.lithology &&
    (
      String(
        geologyProfile?.water_type ||
        geologyProfile?.collector_type ||
        geologyProfile?.aquifer_type_name ||
        geologyProfile?.name ||
        ""
      )
        .toLowerCase()
        .includes("\u043f\u043e\u0440\u043e\u0432")
    );

  const filterRecommendation =
    bg2PoreWithoutOfficialLithology
      ? "\u041f\u0440\u0438 \u043b\u0438\u043f\u0441\u0430 \u043d\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u0435\u043d \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u044a\u0441\u0442\u0430\u0432 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0442\u0430 \u043e\u0442 \u0444\u0438\u043b\u0442\u044a\u0440\u0435\u043d \u0443\u0447\u0430\u0441\u0442\u044a\u043a, \u0442\u0438\u043f\u044a\u0442 \u043d\u0430 \u0444\u0438\u043b\u0442\u044a\u0440\u0430 \u0438 \u0435\u0432\u0435\u043d\u0442\u0443\u0430\u043b\u043d\u0430\u0442\u0430 \u0437\u0430\u0441\u0438\u043f\u043a\u0430 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u0441\u043b\u0435\u0434 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u0435\u043d \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u043f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e."
      : looseGround
      ? "При водоносни пясъци и чакъли може да е необходим филтърен участък и подходяща чакълеста засипка. Интервалът и отворите се определят според реалния пласт."
      : rockGround
        ? "При устойчива скална или карстова среда необходимостта от филтър се определя според напукаността, устойчивостта и конструкцията на сондажа."
        : "Наличните данни не определят надеждно необходимостта от филтърна колона.";

  const cementationRecommendation =
    mixedGround ||
    (
      Number(
        geologyProfile?.vertical_horizons
      ) > 1
    )
      ? "Да се прецени изолиране на плитките води и разделяне на водоносните интервали чрез подходящо обсаждане и циментация. Точните дълбочини се определят само по реалния сондажен разрез."
      : "Да се предвиди санитарно уплътняване на горната част и да се оцени необходимостта от изолиране на плитки или замърсени води.";

  const drillingNearestFault =
    professional?.nearestFault || null;

  const drillingLithologyText =
    String(
      geologyProfile?.lithology ||
      geologyProfile?.main_lithology ||
      geologyProfile?.description ||
      ""
    ).trim();

  const drillingHydroEnvironmentText =
    String(
      geologyProfile?.aquifer_type ||
      geologyProfile?.water_bearing_environment ||
      geologyProfile?.hydrogeological_environment ||
      geologyProfile?.aquifer_environment ||
      ""
    ).trim();

  const drillingGeologyContextText =
    [
      drillingLithologyText,
      drillingHydroEnvironmentText,
    ]
      .filter(Boolean)
      .join(" / ");

  const drillingRiskItems: string[] = [];

  if (looseGround) {
    drillingRiskItems.push(
      bg2PoreWithoutOfficialLithology
        ? "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0441\u0440\u0435\u0434\u0430\u0442\u0430 \u043a\u0430\u0442\u043e \u043f\u043e\u0440\u043e\u0432\u0430, \u043d\u043e \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0438 \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u0441\u0442\u0435\u043d\u0438\u0442\u0435 \u043d\u0435 \u0441\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438. \u0420\u0438\u0441\u043a\u044a\u0442 \u043e\u0442 \u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u043e\u0441\u0442 \u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0442\u0430 \u043e\u0442 \u043e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u043e\u0446\u0435\u043d\u044f\u0442 \u043f\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437."
        : "\u0417\u0430 \u0442\u0430\u0437\u0438 \u0442\u043e\u0447\u043a\u0430 \u0434\u0430\u043d\u043d\u0438\u0442\u0435 \u043d\u0430\u0441\u043e\u0447\u0432\u0430\u0442 \u043a\u044a\u043c \u0440\u043e\u0445\u043a\u0430\u0432\u0430 \u0438\u043b\u0438 \u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430" +
          (
            drillingGeologyContextText
              ? " (" + drillingGeologyContextText + ")"
              : ""
          ) +
          ". \u041f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u044f\u0442 \u0442\u0435\u0445\u043d\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0438\u0441\u043a \u0435 \u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u043e\u0441\u0442 \u043d\u0430 \u0441\u0442\u0435\u043d\u0438\u0442\u0435 \u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442 \u043e\u0442 \u043d\u0430\u0432\u0440\u0435\u043c\u0435\u043d\u043d\u043e \u043e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435."
    );
  }

  if (rockGround) {
    drillingRiskItems.push(
      "\u0412 \u0438\u0437\u0431\u0440\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u0435 \u043e\u0447\u0430\u043a\u0432\u0430\u043d\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 / \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430" +
      (
        drillingGeologyContextText
          ? " (" + drillingGeologyContextText + ")"
          : ""
      ) +
      ". \u041f\u043e-\u0432\u0430\u0436\u043d\u043e \u0435 \u0434\u0430 \u0441\u0435 \u043e\u0442\u0431\u0435\u043b\u044f\u0437\u0432\u0430\u0442 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438\u0442\u0435 \u043d\u0430 \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438 \u0438 \u0440\u0430\u0437\u0434\u0440\u043e\u0431\u0435\u043d\u0438 \u0437\u043e\u043d\u0438, \u0437\u0430\u0449\u043e\u0442\u043e \u0438\u043c\u0435\u043d\u043d\u043e \u0442\u0430\u043c \u043c\u043e\u0436\u0435 \u0434\u0430 \u0431\u044a\u0434\u0435 \u0441\u044a\u0441\u0440\u0435\u0434\u043e\u0442\u043e\u0447\u0435\u043d \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u044f\u0442 \u0432\u043e\u0434\u043e\u043f\u0440\u0438\u0442\u043e\u043a."
    );
  }

  if (mixedGround) {
    drillingRiskItems.push(
      "\u041f\u0440\u043e\u0444\u0438\u043b\u044a\u0442 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u0441\u043c\u0435\u0441\u0435\u043d\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0441\u0440\u0435\u0434\u0430. \u041f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043e\u0447\u0430\u043a\u0432\u0430 \u043f\u0440\u0435\u0445\u043e\u0434 \u043e\u0442 \u043f\u043e-\u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u0438 \u0433\u043e\u0440\u043d\u0438 \u043f\u043b\u0430\u0441\u0442\u043e\u0432\u0435 \u043a\u044a\u043c \u043f\u043e-\u0442\u0432\u044a\u0440\u0434\u0430 \u043e\u0441\u043d\u043e\u0432\u0430, \u043a\u043e\u0435\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u043d\u0430\u043b\u043e\u0436\u0438 \u043f\u0440\u043e\u043c\u044f\u043d\u0430 \u043d\u0430 \u0440\u0435\u0436\u0438\u043c\u0430 \u0438 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430."
    );
  }

  if (
    drillingNearestFault?.distanceKm != null &&
    Number.isFinite(
      Number(drillingNearestFault.distanceKm)
    )
  ) {
    const faultDistance =
      Number(drillingNearestFault.distanceKm);

    if (faultDistance <= 5) {
      drillingRiskItems.push(
        "\u041d\u0430\u0439-\u0431\u043b\u0438\u0437\u043a\u0438\u044f\u0442 \u043a\u0430\u0440\u0442\u043e\u0433\u0440\u0430\u0444\u0438\u0440\u0430\u043d \u0440\u0430\u0437\u043b\u043e\u043c \u0435 \u043d\u0430 " +
        (
          faultDistance < 1
            ? Math.round(
                faultDistance * 1000
              ) + " m"
            : faultDistance.toFixed(2) +
              " km"
        ) +
        ". \u0422\u043e\u0432\u0430 \u043d\u0435 \u0434\u043e\u043a\u0430\u0437\u0432\u0430 \u0432\u043e\u0434\u0430 \u0432 \u0441\u0430\u043c\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430, \u043d\u043e \u043f\u043e\u0432\u0438\u0448\u0430\u0432\u0430 \u0438\u043d\u0442\u0435\u0440\u0435\u0441\u0430 \u043a\u044a\u043c \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u0438 \u0438 \u0440\u0430\u0437\u0434\u0440\u043e\u0431\u0435\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u043f\u043e \u0432\u0440\u0435\u043c\u0435 \u043d\u0430 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435."
      );
    }
  }

  if (
    professional?.depthMedian != null &&
    professional?.depthMin != null &&
    professional?.depthMax != null
  ) {
    drillingRiskItems.push(
      "\u0412 \u0441\u044a\u0441\u0435\u0434\u043d\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0441 \u043d\u0430\u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438\u0442\u0435 \u0441\u0430 \u043c\u0435\u0436\u0434\u0443 " +
      Number(professional.depthMin).toFixed(0) +
      " \u0438 " +
      Number(professional.depthMax).toFixed(0) +
      " m, \u0430 \u043c\u0435\u0434\u0438\u0430\u043d\u0430\u0442\u0430 \u0435 " +
      Number(professional.depthMedian).toFixed(0) +
      " m. \u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440, \u0430 \u043d\u0435 \u043f\u0440\u0435\u0434\u043f\u0438\u0441\u0430\u043d\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436."
    );
  }

  if (drillingRiskItems.length === 0) {
    drillingRiskItems.push(
      "\u0417\u0430 \u0442\u043e\u0447\u043a\u0430\u0442\u0430 \u043d\u044f\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0438 \u0434\u0430\u043d\u043d\u0438, \u0437\u0430 \u0434\u0430 \u0441\u0435 \u0434\u0430\u0434\u0435 \u0441\u043f\u0435\u0446\u0438\u0444\u0438\u0447\u0435\u043d \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u043d \u0440\u0438\u0441\u043a."
    );
  }

  const drillingFieldControlItems: string[] = [];

  if (looseGround) {
    drillingFieldControlItems.push(
      bg2PoreWithoutOfficialLithology
        ? "\u0414\u0430 \u0441\u0435 \u0437\u0430\u043f\u0438\u0441\u0432\u0430\u0442 \u0442\u043e\u0447\u043d\u0438\u0442\u0435 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438, \u043d\u0430 \u043a\u043e\u0438\u0442\u043e \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044a\u0442, \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u0438 \u0432\u043e\u0434\u043e\u043f\u0440\u0438\u0442\u043e\u043a\u044a\u0442. \u0422\u043e\u0432\u0430 \u043f\u043e\u0437\u0432\u043e\u043b\u044f\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0442 \u0440\u0435\u0430\u043b\u043d\u0438\u0442\u0435 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u0431\u0435\u0437 \u043f\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043b\u043d\u043e \u043f\u0440\u0435\u0434\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u0435\u043d \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u044a\u0441\u0442\u0430\u0432."
        : "\u041f\u0440\u0438 \u043f\u0440\u0435\u043c\u0438\u043d\u0430\u0432\u0430\u043d\u0435 \u043f\u0440\u0435\u0437 \u043f\u044f\u0441\u044a\u0446\u0438 \u0438 \u0447\u0430\u043a\u044a\u043b\u0438 \u0434\u0430 \u0441\u0435 \u043e\u0442\u0431\u0435\u043b\u044f\u0437\u0432\u0430 \u043d\u0430 \u043a\u043e\u044f \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0437\u0430\u043f\u043e\u0447\u0432\u0430 \u0438 \u0437\u0430\u0432\u044a\u0440\u0448\u0432\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u044f\u0442 \u0433\u0440\u0430\u043d\u0443\u043b\u043e\u043c\u0435\u0442\u0440\u0438\u0447\u0435\u043d \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b. \u0422\u043e\u0432\u0430 \u0435 \u0432\u0430\u0436\u043d\u043e \u0437\u0430 \u043f\u043e\u0441\u043b\u0435\u0434\u0432\u0430\u0449\u043e\u0442\u043e \u0440\u0430\u0437\u043f\u043e\u043b\u0430\u0433\u0430\u043d\u0435 \u043d\u0430 \u0444\u0438\u043b\u0442\u044a\u0440\u0430."
    );
  }

  if (rockGround) {
    drillingFieldControlItems.push(
      "\u0414\u0430 \u0441\u0435 \u0437\u0430\u043f\u0438\u0441\u0432\u0430\u0442 \u0442\u043e\u0447\u043d\u0438\u0442\u0435 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0438, \u043d\u0430 \u043a\u043e\u0438\u0442\u043e \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u044f \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435, \u043f\u043e\u044f\u0432\u044f\u0432\u0430\u0442 \u0441\u0435 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438 \u0438\u043b\u0438 \u0437\u0430\u043f\u043e\u0447\u0432\u0430 \u043f\u0440\u0438\u0442\u043e\u043a. \u0422\u043e\u0432\u0430 \u0434\u0430\u0432\u0430 \u0440\u0435\u0430\u043b\u043d\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438."
    );
  }

  if (
    professional?.staticMedian != null &&
    professional?.staticMin != null &&
    professional?.staticMax != null
  ) {
    drillingFieldControlItems.push(
      "\u0421\u044a\u0441\u0435\u0434\u043d\u0438\u0442\u0435 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0441 \u043d\u0430\u043b\u0438\u0447\u043d\u0438 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f \u0438\u043c\u0430\u0442 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u0438 \u043d\u0438\u0432\u0430 \u0432 \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d " +
      Number(professional.staticMin).toFixed(1) +
      "\u2013" +
      Number(professional.staticMax).toFixed(1) +
      " m, \u0441 \u043c\u0435\u0434\u0438\u0430\u043d\u0430 " +
      Number(professional.staticMedian).toFixed(1) +
      " m. \u041f\u0440\u0438 \u043d\u043e\u0432\u0438\u044f \u0441\u043e\u043d\u0434\u0430\u0436 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u0441\u043b\u0435\u0434 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0441\u0440\u0430\u0432\u043d\u0438 \u0441 \u0442\u043e\u0437\u0438 \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440."
    );
  }

  if (drillingFieldControlItems.length === 0) {
    drillingFieldControlItems.push(
      "\u041f\u043e \u0432\u0440\u0435\u043c\u0435 \u043d\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0438\u0437\u0433\u0440\u0430\u0434\u0438 \u0440\u0435\u0430\u043b\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437 \u043d\u0430 \u043f\u043b\u0430\u0441\u0442\u043e\u0432\u0435\u0442\u0435 \u0438 \u0432\u043e\u0434\u043e\u043f\u0440\u043e\u044f\u0432\u0438\u0442\u0435, \u0442\u044a\u0439 \u043a\u0430\u0442\u043e \u0437\u0430 \u0442\u043e\u0447\u043a\u0430\u0442\u0430 \u043d\u044f\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438 \u0441\u044a\u0441\u0435\u0434\u043d\u0438 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f."
    );
  }

  const drillingCompletionItems: string[] = [];

  if (
    professional?.staticMedian != null
  ) {
    drillingCompletionItems.push(
      "\u0421\u043b\u0435\u0434 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435 \u0434\u0430 \u0441\u0435 \u0438\u0437\u043c\u0435\u0440\u0438 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u0438 \u0434\u0430 \u0441\u0435 \u0441\u0440\u0430\u0432\u043d\u0438 \u0441 \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u0430 \u043e\u0442 \u043e\u043a\u043e\u043b\u043d\u0438\u0442\u0435 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u2014 \u043c\u0435\u0434\u0438\u0430\u043d\u0430 \u043e\u043a\u043e\u043b\u043e " +
      Number(professional.staticMedian).toFixed(1) +
      " m. \u0421\u044a\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0438\u0435 \u0435 \u043f\u043e\u043b\u0435\u0437\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043b\u043e\u043a\u0430\u043b\u043d\u0438\u0442\u0435 \u0443\u0441\u043b\u043e\u0432\u0438\u044f."
    );
  }

  drillingCompletionItems.push(
    "\u041f\u0440\u043e\u0431\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432\u0438\u044f \u0434\u0435\u0431\u0438\u0442 \u0438 \u043f\u043e\u043d\u0438\u0436\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e. \u0418\u043c\u0435\u043d\u043d\u043e \u0442\u0435\u0437\u0438 \u0434\u0432\u0435 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438, \u0430 \u043d\u0435 \u043f\u0440\u0438\u0442\u043e\u043a\u044a\u0442 \u043f\u043e \u0432\u0440\u0435\u043c\u0435 \u043d\u0430 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435, \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0430 \u043e\u0441\u043d\u043e\u0432\u0430\u0442\u0430 \u0437\u0430 \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u043f\u043e\u043c\u043f\u0430."
  );

  if (looseGround) {
    drillingCompletionItems.push(
      bg2PoreWithoutOfficialLithology
        ? "\u0410\u043a\u043e \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0431\u044a\u0434\u0435 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d \u0441 \u0444\u0438\u043b\u0442\u0440\u043e\u0432 \u0443\u0447\u0430\u0441\u0442\u044a\u043a, \u043f\u0440\u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435\u0442\u043e \u0434\u0430 \u0441\u0435 \u0441\u043b\u0435\u0434\u0438 \u0437\u0430 \u0438\u0437\u043d\u0430\u0441\u044f\u043d\u0435 \u043d\u0430 \u0444\u0438\u043d \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b. \u041f\u0440\u0438 \u043d\u0430\u043b\u0438\u0447\u0438\u0435 \u043d\u0430 \u0442\u0430\u043a\u044a\u0432 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0442 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u044f\u0442\u0430 \u043d\u0430 \u0444\u0438\u043b\u0442\u044a\u0440\u0430, \u0435\u0432\u0435\u043d\u0442\u0443\u0430\u043b\u043d\u0430\u0442\u0430 \u0444\u0438\u043b\u0442\u044a\u0440\u043d\u0430 \u0437\u0430\u0441\u0438\u043f\u043a\u0430 \u0438 \u0440\u0435\u0436\u0438\u043c\u044a\u0442 \u043d\u0430 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435."
        : "\u041f\u0440\u0438 \u0444\u0438\u043b\u0442\u0440\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436 \u0441\u0435 \u043e\u0446\u0435\u043d\u044f\u0432\u0430 \u0434\u0430\u043b\u0438 \u043f\u0440\u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435\u0442\u043e \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0430\u0432\u0430 \u0438\u0437\u043d\u0430\u0441\u044f\u043d\u0435 \u043d\u0430 \u043f\u044f\u0441\u044a\u043a. \u0410\u043a\u043e \u0434\u0430, \u0442\u043e\u0432\u0430 \u0435 \u0441\u0438\u0433\u043d\u0430\u043b \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0442 \u0444\u0438\u043b\u0442\u044a\u0440\u044a\u0442, \u0447\u0430\u043a\u044a\u043b\u0435\u0441\u0442\u0430\u0442\u0430 \u0437\u0430\u0441\u0438\u043f\u043a\u0430 \u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435\u0442\u043e."
    );
  }

  if (rockGround) {
    drillingCompletionItems.push(
      "\u041f\u0440\u0438 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436 \u0435 \u0432\u0430\u0436\u043d\u043e \u0434\u0430 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438 \u0434\u0430\u043b\u0438 \u0434\u0435\u0431\u0438\u0442\u044a\u0442 \u0441\u0435 \u0437\u0430\u043f\u0430\u0437\u0432\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0438\u0442\u0435\u043b\u043d\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435 \u0438 \u043a\u043e\u043b\u043a\u043e \u0431\u044a\u0440\u0437\u043e \u0441\u0435 \u0432\u044a\u0437\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430 \u043d\u0438\u0432\u043e\u0442\u043e \u0441\u043b\u0435\u0434 \u0441\u043f\u0438\u0440\u0430\u043d\u0435."
    );
  }


  const nearestOrdinary =
    professional?.nearestOrdinary || null;

  const nearestMineral =
    professional?.nearestMineral || null;

  const section4 =
    professional?.section4 || null;

  const section5 =
    professional?.section5 || null;

  const section7 =
    professional?.section7 || null;

  const fmt = (
    value: any,
    digits = 1
  ) => {
    if (
      value === null ||
      value === undefined ||
      String(value).trim() === "" ||
      !Number.isFinite(Number(value))
    ) {
      return "Няма данни";
    }

    return Number(value).toLocaleString(
      "bg-BG",
      {
        maximumFractionDigits: digits,
      }
    );
  };

  const geologyCode =
    data.geology?.unit?.code || "";

  const selectedInterpretationBodies =
    data.bodies.length > 0
      ? [
          (
            professional?.basinCode === "BG1" ||
            professional?.basinCode === "BG2"
          ) &&
          geologyProfile
            ? {
                ...data.bodies[0],
                properties: {
                  ...(data.bodies[0].properties || {}),
                  water_type_bg:
                    geologyProfile.water_type ||
                    geologyProfile.collector_type ||
                    data.bodies[0].properties?.water_type_bg ||
                    "",
                  gwb_type_name_bg:
                    geologyProfile.aquifer_type_name ||
                    geologyProfile.collector_type ||
                    data.bodies[0].properties?.gwb_type_name_bg ||
                    "",
                  nameText:
                    geologyProfile.name ||
                    data.bodies[0].properties?.nameText ||
                    "",
                },
              }
            : data.bodies[0],
        ]
      : [];

  const bg1KarstProfile =
    bg1OfficialKarstProfile &&
    !bg1MixedKarstPoreProfile;

  const simple =
    bg2FracturedKarstProfile
      ? {
          headline:
            "\u041f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u043e-\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",
          hardness:
            "\u0421\u0440\u0435\u0434\u043d\u0430 \u0434\u043e \u0432\u0438\u0441\u043e\u043a\u0430",
          looseness:
            "\u041d\u0438\u0441\u043a\u0430; \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438, \u0440\u0430\u0437\u0434\u0440\u043e\u0431\u0435\u043d\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043d\u0438 \u0437\u043e\u043d\u0438",
          collapse:
            "\u041d\u0438\u0441\u044a\u043a \u0434\u043e \u0441\u0440\u0435\u0434\u0435\u043d; \u043b\u043e\u043a\u0430\u043b\u043d\u043e \u0441\u0430 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u043a\u0443\u0445\u0438\u043d\u0438 \u0438 \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438 \u0443\u0447\u0430\u0441\u0442\u044a\u0446\u0438",
          drilling:
            "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0438\u0441\u0432\u0430 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u043e-\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430. \u041f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u0441\u0430 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0440\u0435\u0437\u043a\u0438 \u043f\u0440\u0435\u0445\u043e\u0434\u0438 \u043c\u0435\u0436\u0434\u0443 \u0437\u0434\u0440\u0430\u0432\u0430 \u0441\u043a\u0430\u043b\u0430, \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438 \u0443\u0447\u0430\u0441\u0442\u044a\u0446\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u043f\u0440\u0430\u0437\u043d\u0438\u043d\u0438.",
          water:
            "\u0412\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0434\u0432\u0438\u0436\u0438 \u0433\u043b\u0430\u0432\u043d\u043e \u043f\u043e \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0438 \u0437\u043e\u043d\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u043a\u0430\u043d\u0430\u043b\u0438 \u0438 \u043f\u0440\u0430\u0437\u043d\u0438\u043d\u0438.",
        }
      : (
          bg1MixedKarstPoreProfile ||
          bg2KarstPoreProfile
        )
      ? {
          headline:
            "\u0421\u043c\u0435\u0441\u0435\u043d\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",

          hardness:
            "\u041f\u0440\u043e\u043c\u0435\u043d\u043b\u0438\u0432\u0430 \u2014 \u043e\u0442 \u043d\u0438\u0441\u043a\u0430 \u0434\u043e \u0432\u0438\u0441\u043e\u043a\u0430",

          looseness:
            "\u0421\u043c\u0435\u0441\u0435\u043d\u0430; \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u0440\u043e\u0445\u043a\u0430\u0432\u0438 \u0438 \u0441\u043a\u0430\u043b\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438",

          collapse:
            "\u0421\u0440\u0435\u0434\u0435\u043d; \u0437\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0440\u0435\u0434\u0443\u0432\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u043f\u044f\u0441\u044a\u0446\u0438, \u0433\u043b\u0438\u043d\u0438, \u043f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438 \u0438 \u0432\u0430\u0440\u043e\u0432\u0438\u0446\u0438",

          drilling:
            "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0438\u0441\u0432\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e-\u043f\u043e\u0440\u043e\u0432\u0430 \u0441\u0440\u0435\u0434\u0430. \u041f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u0441\u0440\u0435\u0449\u0430\u0442 \u0440\u0435\u0434\u0443\u0432\u0430\u0449\u0438 \u0441\u0435 \u0440\u043e\u0445\u043a\u0430\u0432\u0438, \u0441\u043f\u043e\u0435\u043d\u0438 \u0438 \u043a\u0430\u0440\u0431\u043e\u043d\u0430\u0442\u043d\u0438 \u043f\u043b\u0430\u0441\u0442\u043e\u0432\u0435.",

          water:
            "\u0412\u043e\u0434\u0430\u0442\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u0434\u0432\u0438\u0436\u0438 \u043a\u0430\u043a\u0442\u043e \u043f\u0440\u0435\u0437 \u043f\u043e\u0440\u043e\u0432\u043e\u0442\u043e \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e \u043d\u0430 \u043f\u044f\u0441\u044a\u0446\u0438 \u0438 \u043f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438, \u0442\u0430\u043a\u0430 \u0438 \u043f\u043e \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u0437\u043e\u043d\u0438 \u0432\u044a\u0432 \u0432\u0430\u0440\u043e\u0432\u0438\u0446\u0438\u0442\u0435.",
        }

      : bg1KarstProfile
      ? {
          headline:
            "\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",

          hardness:
            "\u0421\u0440\u0435\u0434\u043d\u0430 \u0434\u043e \u0432\u0438\u0441\u043e\u043a\u0430",

          looseness:
            "\u041d\u0438\u0441\u043a\u0430; \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438 \u0437\u043e\u043d\u0438",

          collapse:
            "\u041d\u0438\u0441\u044a\u043a \u0434\u043e \u0441\u0440\u0435\u0434\u0435\u043d; \u043b\u043e\u043a\u0430\u043b\u043d\u043e \u0441\u0430 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u043a\u0443\u0445\u0438\u043d\u0438 \u0438 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438 \u0443\u0447\u0430\u0441\u0442\u044a\u0446\u0438",

          drilling:
            "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0438\u0441\u0432\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430. \u041f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u043c\u043e\u0433\u0430\u0442 \u0434\u0430 \u0441\u0435 \u0441\u0440\u0435\u0449\u043d\u0430\u0442 \u0440\u0435\u0437\u043a\u0438 \u043f\u0440\u0435\u0445\u043e\u0434\u0438 \u043c\u0435\u0436\u0434\u0443 \u0437\u0434\u0440\u0430\u0432\u0430 \u0441\u043a\u0430\u043b\u0430, \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438 \u0437\u043e\u043d\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u043a\u0443\u0445\u0438\u043d\u0438.",

          water:
            "\u0412\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0434\u0432\u0438\u0436\u0438 \u043f\u0440\u0435\u0434\u0438\u043c\u043d\u043e \u043f\u043e \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u0440\u0430\u0437\u0442\u0432\u043e\u0440\u0435\u043d\u0438 \u043a\u0430\u043d\u0430\u043b\u0438 \u0438 \u043a\u0443\u0445\u0438\u043d\u0438. \u0417\u0430 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435\u0442\u043e \u043d\u0430\u0439-\u0432\u0430\u0436\u043d\u0438 \u0441\u0430 \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438\u0442\u0435 \u0438 \u0440\u0430\u0437\u0434\u0440\u043e\u0431\u0435\u043d\u0438 \u0437\u043e\u043d\u0438, \u043a\u044a\u0434\u0435\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u0441\u044a\u0441\u0440\u0435\u0434\u043e\u0442\u043e\u0447\u0435\u043d \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u044f\u0442 \u0432\u043e\u0434\u043e\u043f\u0440\u0438\u0442\u043e\u043a.",
        }

      : bg2PoreWithoutOfficialLithology
        ? {
            headline: "\u041f\u043e\u0440\u043e\u0432\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430 \u2013 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u043d\u0435 \u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d",
            hardness: "\u041d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u043d\u0430\u0434\u0435\u0436\u0434\u043d\u043e",
            looseness: "\u041d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u043d\u0430\u0434\u0435\u0436\u0434\u043d\u043e",
            collapse: "\u0417\u0430\u0432\u0438\u0441\u0438 \u043e\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b; \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0430 \u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u043f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435",
            drilling: "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0441\u0440\u0435\u0434\u0430\u0442\u0430 \u043a\u0430\u0442\u043e \u043f\u043e\u0440\u043e\u0432\u0430, \u043d\u043e \u043d\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f. \u0421\u043e\u043d\u0434\u0430\u0436\u043d\u0430\u0442\u0430 \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u044f \u0438 \u043e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435\u0442\u043e \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u0441\u043b\u0435\u0434 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u0440\u0435\u0430\u043b\u043d\u0438\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b.",
            water: "\u0412\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0434\u0432\u0438\u0436\u0438 \u043f\u0440\u0435\u0437 \u043f\u043e\u0440\u043e\u0432\u043e\u0442\u043e \u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e \u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b; \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0438 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438 \u0442\u0440\u044f\u0431\u0432\u0430 \u0434\u0430 \u0441\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0442 \u043d\u0430 \u0442\u0435\u0440\u0435\u043d.",
          }
      : professional?.basinCode === "BG4" &&
        String(
          geologyProfile?.water_type ||
          geologyProfile?.aquifer_type_name ||
          ""
        ).toLowerCase().includes("\u043f\u0443\u043a\u043d\u0430\u0442")
        ? {
            headline:
              "\u041f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",
            hardness:
              "\u0421\u0440\u0435\u0434\u043d\u0430 \u0434\u043e \u0432\u0438\u0441\u043e\u043a\u0430",
            looseness:
              "\u041d\u0438\u0441\u043a\u0430 \u0434\u043e \u0441\u0440\u0435\u0434\u043d\u0430",
            collapse:
              "\u041d\u0438\u0441\u044a\u043a \u0434\u043e \u0441\u0440\u0435\u0434\u0435\u043d; \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438 \u0438 \u0438\u0437\u0432\u0435\u0442\u0440\u0435\u043b\u0438 \u0437\u043e\u043d\u0438",
            drilling:
              "\u041e\u0447\u0430\u043a\u0432\u0430 \u0441\u0435 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u0432 \u0441\u043a\u0430\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430. \u041f\u0440\u0438 \u043f\u0440\u0435\u043c\u0438\u043d\u0430\u0432\u0430\u043d\u0435 \u043f\u0440\u0435\u0437 \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438, \u0440\u0430\u0437\u043b\u043e\u043c\u0435\u043d\u0438 \u0438\u043b\u0438 \u0438\u0437\u0432\u0435\u0442\u0440\u0435\u043b\u0438 \u0443\u0447\u0430\u0441\u0442\u044a\u0446\u0438 \u043f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043f\u0440\u043e\u043c\u0435\u043d\u0438 \u0440\u044f\u0437\u043a\u043e.",
            water:
              "\u0412\u043e\u0434\u0430\u0442\u0430 \u0441\u0435 \u0434\u0432\u0438\u0436\u0438 \u0433\u043b\u0430\u0432\u043d\u043e \u043f\u043e \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u0440\u0430\u0437\u043b\u043e\u043c\u043d\u0438 \u0438 \u0438\u0437\u0432\u0435\u0442\u0440\u0435\u043b\u0438 \u0437\u043e\u043d\u0438. \u0422\u043e\u0447\u043d\u0430\u0442\u0430 \u043f\u043e\u0437\u0438\u0446\u0438\u044f \u0438 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u043d\u0435 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u0441\u0430\u043c\u043e \u043e\u0442 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0438\u044f \u043f\u0440\u043e\u0444\u0438\u043b.",
          }
        : simpleGroundInterpretation(
            geologyCode,
            selectedInterpretationBodies
          );



  const drillingMaterials =
    bg2FracturedKarstProfile
      ? {
          title:
            "\u041f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u043e-\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",
          short:
            geologyProfile?.lithology
              ? `\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u043e \u043e\u043f\u0438\u0441\u0430\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f: ${geologyProfile.lithology}.`
              : "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0441\u0440\u0435\u0434\u0430\u0442\u0430 \u043a\u0430\u0442\u043e \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u043e-\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430.",
          details:
            "\u041e\u0447\u0430\u043a\u0432\u0430 \u0441\u0435 \u0441\u043a\u0430\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430 \u0441 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u043d\u0430\u0440\u0443\u0448\u0435\u043d\u0438 \u0437\u043e\u043d\u0438 \u0438 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u043e \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u043e \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435.",
          behavior:
            "\u0412\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u0440\u0435\u0437\u043a\u0438 \u043f\u0440\u0435\u0445\u043e\u0434\u0438 \u043e\u0442 \u043a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u0430 \u0441\u043a\u0430\u043b\u0430 \u043a\u044a\u043c \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438, \u0440\u0430\u0437\u0434\u0440\u043e\u0431\u0435\u043d\u0438 \u0438\u043b\u0438 \u043a\u0430\u0440\u0441\u0442\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043d\u0438 \u0437\u043e\u043d\u0438.",
          confidence:
            "\u0421\u0440\u0435\u0434\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f \u2013 \u043d\u0443\u0436\u0434\u0430\u0435 \u0441\u0435 \u043e\u0442 \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430",
        }
      : bg2PoreWithoutOfficialLithology
      ? {
          title:
            "\u041f\u043e\u0440\u043e\u0432\u0430 \u0441\u0435\u0434\u0438\u043c\u0435\u043d\u0442\u043d\u0430 \u0441\u0440\u0435\u0434\u0430 \u2013 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f\u0442 \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u044a\u0441\u0442\u0430\u0432 \u043d\u0435 \u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d",
          short:
            "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0438\u044f\u0442 \u043f\u0440\u043e\u0444\u0438\u043b \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430\u0442\u0430 \u0441\u0440\u0435\u0434\u0430 \u043a\u0430\u0442\u043e \u043f\u043e\u0440\u043e\u0432\u0430, \u043d\u043e \u043d\u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f.",
          details:
            "\u0417\u0430\u0442\u043e\u0432\u0430 \u043d\u0435 \u0435 \u043a\u043e\u0440\u0435\u043a\u0442\u043d\u043e \u0434\u0430 \u0441\u0435 \u0442\u0432\u044a\u0440\u0434\u0438 \u0434\u0430\u043b\u0438 \u043d\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430 \u0449\u0435 \u0438\u0437\u043b\u0438\u0437\u0430\u0442 \u043f\u044f\u0441\u044a\u0446\u0438, \u0447\u0430\u043a\u044a\u043b\u0438, \u0433\u043b\u0438\u043d\u0438 \u0438\u043b\u0438 \u0434\u0440\u0443\u0433\u0438 \u0441\u0435\u0434\u0438\u043c\u0435\u043d\u0442\u0438 \u0431\u0435\u0437 \u0442\u0435\u0440\u0435\u043d\u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430.",
          behavior:
            "\u0421\u043e\u043d\u0434\u0430\u0436\u043d\u0430\u0442\u0430 \u0442\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u044f \u0438 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e\u0441\u0442\u0442\u0430 \u043e\u0442 \u043e\u0431\u0441\u0430\u0436\u0434\u0430\u043d\u0435 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0442 \u0441\u043b\u0435\u0434 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435 \u043d\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u043d\u0438\u044f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u043d\u0430 \u0442\u0435\u0440\u0435\u043d.",
          confidence:
            "\u0421\u0440\u0435\u0434\u043d\u0430 \u0437\u0430 \u0442\u0438\u043f\u0430 \u043d\u0430 \u0441\u0440\u0435\u0434\u0430\u0442\u0430; \u043d\u0438\u0441\u043a\u0430 \u0437\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u043b\u0438\u0442\u043e\u043b\u043e\u0436\u043a\u0438 \u0441\u044a\u0441\u0442\u0430\u0432",
        }
      : (
          bg1MixedKarstPoreProfile ||
          bg2KarstPoreProfile
        )
      ? {
          title:
            "\u0421\u043c\u0435\u0441\u0435\u043d\u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u0438 \u043f\u043e\u0440\u043e\u0432\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0438",

          short:
            geologyProfile?.lithology
              ? `\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u043e \u043e\u043f\u0438\u0441\u0430\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f: ${geologyProfile.lithology}.`
              : "\u0412\u044a\u0437\u043c\u043e\u0436\u043d\u043e \u0435 \u0440\u0435\u0434\u0443\u0432\u0430\u043d\u0435 \u043d\u0430 \u0441\u043a\u0430\u043b\u043d\u0438 \u0438 \u043f\u043e-\u0440\u043e\u0445\u043a\u0430\u0432\u0438 \u0441\u0435\u0434\u0438\u043c\u0435\u043d\u0442\u043d\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438.",

          details:
            "\u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430, \u0430 \u043d\u0435 \u0442\u043e\u0447\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437 \u0437\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u0430\u0442\u0430 \u0442\u043e\u0447\u043a\u0430.",

          behavior:
            "\u041f\u0440\u0438 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u043c\u043e\u0433\u0430\u0442 \u0434\u0430 \u0441\u0435 \u0441\u043c\u0435\u043d\u044f\u0442 \u0440\u043e\u0445\u043a\u0430\u0432\u0438 \u0438\u043d\u0442\u0435\u0440\u0432\u0430\u043b\u0438, \u043f\u044f\u0441\u044a\u0447\u043d\u0438\u0446\u0438 \u0438 \u043f\u043e-\u0442\u0432\u044a\u0440\u0434\u0438 \u0432\u0430\u0440\u043e\u0432\u0438\u0446\u0438; \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438 \u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u0437\u043e\u043d\u0438.",

          confidence:
            "\u0414\u043e\u0431\u0440\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f; \u043d\u0443\u0436\u043d\u0430 \u0435 \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430",
        }

      : bg1KarstProfile
      ? {
          title:
            "\u0412\u0435\u0440\u043e\u044f\u0442\u043d\u0430 \u0442\u0432\u044a\u0440\u0434\u0430 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0441\u043a\u0430\u043b\u043d\u0430 \u0441\u0440\u0435\u0434\u0430",

          short:
            "\u041e\u0447\u0430\u043a\u0432\u0430\u0442 \u0441\u0435 \u043a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u0438 \u0441\u043a\u0430\u043b\u0438 \u0441 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438 \u0438 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0438 \u043a\u0443\u0445\u0438\u043d\u0438.",

          details:
            geologyProfile?.lithology
              ? `\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u043e \u043e\u043f\u0438\u0441\u0430\u043d\u0430 \u043b\u0438\u0442\u043e\u043b\u043e\u0433\u0438\u044f: ${geologyProfile.lithology}. \u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u0438 \u043d\u0435 \u0435 \u0442\u043e\u0447\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436\u0435\u043d \u0440\u0430\u0437\u0440\u0435\u0437 \u0437\u0430 \u0438\u043c\u043e\u0442\u0430.`
              : "\u041a\u0430\u0440\u0441\u0442\u043e\u0432\u0438\u044f\u0442 \u0442\u0438\u043f \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430 \u043d\u0430\u0441\u043e\u0447\u0432\u0430 \u043a\u044a\u043c \u0442\u0432\u044a\u0440\u0434\u0430 \u0440\u0430\u0437\u0442\u0432\u043e\u0440\u0438\u043c\u0430 \u0441\u043a\u0430\u043b\u0430 \u0441 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438, \u043a\u0430\u043d\u0430\u043b\u0438 \u0438 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u043a\u0443\u0445\u0438\u043d\u0438.",

          behavior:
            "\u0412\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u0440\u0435\u0437\u043a\u0438 \u043f\u0440\u0435\u0445\u043e\u0434\u0438 \u043e\u0442 \u0437\u0434\u0440\u0430\u0432\u0430 \u0441\u043a\u0430\u043b\u0430 \u043a\u044a\u043c \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0430 \u0437\u043e\u043d\u0430 \u0438\u043b\u0438 \u043a\u0443\u0445\u0438\u043d\u0430.",

          confidence:
            "\u0414\u043e\u0431\u0440\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f; \u043d\u0443\u0436\u043d\u0430 \u0435 \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430",
        }
      : likelyDrillingMaterials(
          geologyCode,
          selectedInterpretationBodies
        );

  const mp =
    data.monitoring?.feature
      ?.properties || {};

  const monitoringType =
    mp.measurement_type === "level" ||
    Boolean(mp.water_level_frequency)
      ? "\u043d\u0438\u0432\u043e"
      : mp.measurement_type === "discharge" ||
        Boolean(mp.discharge_frequency)
        ? "\u0434\u0435\u0431\u0438\u0442"
        : professional?.basinCode === "BG4"
          ? "\u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0435\u043d \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433"
          : "\u043d\u0435\u0443\u0442\u043e\u0447\u043d\u0435\u043d\u043e";


  const monitoringFrequency =
    mp.discharge_frequency != null
      ? Number(mp.discharge_frequency)
      : mp.water_level_frequency != null
        ? Number(mp.water_level_frequency)
        : null;

  const monitoringFrequencyText =
    monitoringFrequency != null &&
    Number.isFinite(monitoringFrequency)
      ? `${fmt(monitoringFrequency, 0)} \u043f\u044a\u0442\u0438 \u0433\u043e\u0434\u0438\u0448\u043d\u043e`
      : "\u0447\u0435\u0441\u0442\u043e\u0442\u0430\u0442\u0430 \u043d\u0435 \u0435 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0430";

  const monitoringExplanation =
    mp.discharge_frequency != null
      ? `\u041d\u0430 \u0442\u043e\u0437\u0438 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432 \u043f\u0443\u043d\u043a\u0442 \u0441\u0435 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u044f\u0432\u0430 \u0434\u0435\u0431\u0438\u0442\u044a\u0442 ${monitoringFrequencyText}. \u041f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438\u044f\u0442 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u0441\u044a\u0434\u044a\u0440\u0436\u0430 \u0447\u0435\u0441\u0442\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u043d\u0430\u0431\u043b\u044e\u0434\u0435\u043d\u0438\u0435, \u043d\u043e \u043d\u0435 \u0438 \u0441\u0442\u043e\u0439\u043d\u043e\u0441\u0442\u0438\u0442\u0435 \u043e\u0442 \u043e\u0442\u0434\u0435\u043b\u043d\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f. \u0417\u0430\u0442\u043e\u0432\u0430 \u043e\u0442 \u0442\u0435\u0437\u0438 \u0434\u0430\u043d\u043d\u0438 \u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0434\u0430\u043b\u0438 \u0434\u0435\u0431\u0438\u0442\u044a\u0442 \u0435 \u0432\u0438\u0441\u043e\u043a \u0438\u043b\u0438 \u043d\u0438\u0441\u044a\u043a, \u043d\u0438\u0442\u043e \u0434\u0430\u043b\u0438 \u0441\u0435 \u0443\u0432\u0435\u043b\u0438\u0447\u0430\u0432\u0430 \u0438\u043b\u0438 \u043d\u0430\u043c\u0430\u043b\u044f\u0432\u0430.`
      : mp.water_level_frequency != null
        ? `\u041d\u0430 \u0442\u043e\u0437\u0438 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432 \u043f\u0443\u043d\u043a\u0442 \u0441\u0435 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u044f\u0432\u0430 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e ${monitoringFrequencyText}. \u041f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438\u044f\u0442 \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u043f\u043e\u043a\u0430\u0437\u0432\u0430 \u0447\u0435\u0441\u0442\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u043d\u0430\u0431\u043b\u044e\u0434\u0435\u043d\u0438\u0435, \u043d\u043e \u043d\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430 \u0441\u0430\u043c\u0438\u0442\u0435 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438 \u043d\u0438\u0432\u0430. \u0417\u0430\u0442\u043e\u0432\u0430 \u043d\u0435 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0441\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0438 \u0434\u0430\u043b\u0438 \u0432\u043e\u0434\u043d\u043e\u0442\u043e \u043d\u0438\u0432\u043e \u0441\u0435 \u043f\u043e\u043a\u0430\u0447\u0432\u0430 \u0438\u043b\u0438 \u0441\u043f\u0430\u0434\u0430.`
        : "\u041f\u0443\u043d\u043a\u0442\u044a\u0442 \u0435 \u0447\u0430\u0441\u0442 \u043e\u0442 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432\u0430 \u043c\u0440\u0435\u0436\u0430, \u043d\u043e \u0432 \u043d\u0430\u043b\u0438\u0447\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u043d\u044f\u043c\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u044a\u0447\u043d\u043e \u0434\u0430\u043d\u043d\u0438 \u0437\u0430 \u0438\u043d\u0442\u0435\u0440\u043f\u0440\u0435\u0442\u0430\u0446\u0438\u044f.";

  const unit =
    mp.measurement_type === "level" ||
    Boolean(mp.water_level_frequency)
      ? " cm"
      : mp.measurement_type === "discharge" ||
        Boolean(mp.discharge_frequency)
        ? " l/s"
        : "";

  const uniqueWaterTypes = Array.from(
    new Set(
      data.bodies
        .map(
          f =>
            String(
              f.properties?.water_type_bg ||
              ""
            ).trim()
        )
        .filter(Boolean)
    )
  );

  const primaryWaterType =
    uniqueWaterTypes[0] || "";


  return (
    <main style={styles.page}>
      <div style={styles.shell}>

        <div style={styles.topbar}>
          <div>
            <div style={styles.eyebrow}>
              AISMM GEOLOGY
            </div>
            <h1 style={styles.h1}>
              Препоръки за сондиране
            </h1>
            <div style={styles.coords}>
              {data.lat.toFixed(6)},{" "}
              {data.lon.toFixed(6)}
            </div>
          </div>

          <a
            href="/geology"
            style={styles.backButton}
          >
            ← Към картата
          </a>
        </div>

        <section style={styles.heroCard}>
          <div style={styles.sectionLabel}>
            С ДВЕ ДУМИ ЗА СОНДАЖИСТА
          </div>

          <h2 style={styles.heroTitle}>
            {simple.headline}
          </h2>

          <p style={styles.lead}>
            Това е практическо обобщение
            на наличните картографски
            данни за района. То не замества
            геофизично измерване или реален
            сондажен разрез.
          </p>

          <div style={styles.grid4}>
            <Metric
              title="Твърдост"
              value={simple.hardness}
            />
            <Metric
              title="Ронливост"
              value={simple.looseness}
            />
            <Metric
              title="Риск от свличане"
              value={simple.collapse}
            />
            <Metric
              title="ПВТ в точката"
              value={String(
                data.bodies.length
              )}
            />
          </div>

          <div style={styles.materialHero}>
            <div style={styles.materialIcon}>
              ⛏
            </div>

            <div>
              <div style={styles.materialLabel}>
                КАКЪВ МАТЕРИАЛ ВЕРОЯТНО ЩЕ ИЗЛИЗА ПРИ ПРОБИВАНЕТО
              </div>

              <div style={styles.materialTitle}>
                {drillingMaterials.title}
              </div>

              <div style={styles.materialShort}>
                {drillingMaterials.short}
              </div>
            </div>
          </div>

          <div style={styles.simpleBox}>
            <strong>
              Как се очаква да се държи
              при пробиване:
            </strong>
            <p>{simple.drilling}</p>

            <strong>
              Къде по-вероятно се движи
              водата:
            </strong>
            <p style={{marginBottom:0}}>
              {simple.water}
            </p>
          </div>
        </section>

        <div style={styles.twoColumns}>

          <section style={styles.card}>
            <div style={styles.sectionLabel}>
              ГЕОЛОГИЯ
            </div>

            <h2 style={styles.h2}>
              {data.geology?.unit
                ? `${data.geology.unit.code} – ${data.geology.unit.name_bg}`
                : "Неопределена геоложка единица"}
            </h2>

            <p style={{marginBottom:10}}>
              {professional?.basinCode === "BG1"
                ? "\u0422\u043e\u0432\u0430 \u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0432 \u0414\u0443\u043d\u0430\u0432\u0441\u043a\u0438\u044f \u0440\u0430\u0439\u043e\u043d. \u0422\u043e\u0432\u0430 \u043d\u0435 \u0435 \u0442\u043e\u0447\u0435\u043d \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0440\u0430\u0437\u0440\u0435\u0437 \u043d\u0430 \u0438\u043c\u043e\u0442\u0430."
                : professional?.basinCode === "BG4"
                ? "\u0422\u043e\u0432\u0430 \u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0445\u0438\u0434\u0440\u043e\u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u0432 \u0417\u0430\u043f\u0430\u0434\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438\u044f \u0440\u0430\u0439\u043e\u043d. \u0422\u043e\u0432\u0430 \u043d\u0435 \u0435 \u0442\u043e\u0447\u0435\u043d \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0440\u0430\u0437\u0440\u0435\u0437 \u043d\u0430 \u0438\u043c\u043e\u0442\u0430."
                : professional?.basinCode === "BG2"
                  ? "\u0422\u043e\u0432\u0430 \u0435 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u043d\u0430 \u0447\u0435\u0440\u043d\u043e\u043c\u043e\u0440\u0441\u043a\u043e\u0442\u043e \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e. \u0422\u044f \u043d\u0435 \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043b\u044f\u0432\u0430 \u0442\u043e\u0447\u0435\u043d \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0440\u0430\u0437\u0440\u0435\u0437 \u043d\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0438\u044f \u0438\u043c\u043e\u0442."
                  : "\u0422\u043e\u0432\u0430 \u0435 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u043d\u0430\u0442\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u0435\u0434\u0438\u043d\u0438\u0446\u0430 \u0441\u043f\u043e\u0440\u0435\u0434 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430\u0442\u0430 \u043a\u0430\u0440\u0442\u0430 \u043d\u0430 \u0418\u0437\u0442\u043e\u0447\u043d\u043e\u0431\u0435\u043b\u043e\u043c\u043e\u0440\u0441\u043a\u0438\u044f \u0440\u0430\u0439\u043e\u043d."}
            </p>

            <div style={styles.note}>
              <strong>{"\u041d\u0430\u0434\u0435\u0436\u0434\u043d\u043e\u0441\u0442:"}</strong>{" "}
              {professional?.basinCode === "BG1"
                ? (
                    data.geology?.unit
                      ? "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e \u043e\u0442 \u0411\u0430\u0441\u0435\u0439\u043d\u043e\u0432\u0430 \u0434\u0438\u0440\u0435\u043a\u0446\u0438\u044f \u201e\u0414\u0443\u043d\u0430\u0432\u0441\u043a\u0438 \u0440\u0430\u0439\u043e\u043d\u201c."
                      : "\u041d\u044f\u043c\u0430 \u043d\u0430\u043b\u0438\u0447\u0435\u043d \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u0437\u0430 \u0438\u0437\u0431\u0440\u0430\u043d\u043e\u0442\u043e \u041f\u0412\u0422."
                  )
                : professional?.basinCode === "BG4"
                ? (
                    data.geology?.unit
                      ? "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e; \u043d\u0435 \u0435 \u043b\u043e\u043a\u0430\u043b\u0435\u043d \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0438 \u0440\u0430\u0437\u0440\u0435\u0437 \u043d\u0430 \u0438\u043c\u043e\u0442\u0430."
                      : "\u041d\u044f\u043c\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0430 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u0437\u0430 \u0442\u043e\u0432\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e."
                  )
                : professional?.basinCode === "BG2"
                  ? (
                      data.geology?.unit
                        ? "\u041e\u0444\u0438\u0446\u0438\u0430\u043b\u0435\u043d \u043f\u0440\u043e\u0444\u0438\u043b \u043d\u0430 \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u043e\u0442\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e; \u043d\u044f\u043c\u0430 \u043b\u043e\u043a\u0430\u043b\u043d\u0430 \u0433\u0435\u043e\u043b\u043e\u0436\u043a\u0430 \u043a\u0430\u0440\u0442\u0430 \u0437\u0430 \u0438\u043c\u043e\u0442\u0430."
                        : "\u041d\u044f\u043c\u0430 \u043d\u0430\u043b\u0438\u0447\u043d\u0430 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u043d\u0430 \u0445\u0430\u0440\u0430\u043a\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043a\u0430 \u0437\u0430 \u0442\u043e\u0432\u0430 \u0447\u0435\u0440\u043d\u043e\u043c\u043e\u0440\u0441\u043a\u043e \u0432\u043e\u0434\u043d\u043e \u0442\u044f\u043b\u043e."
                    )
                  : geologyConfidenceBg(
                      data.geology?.status || ""
                    )}
            </div>
          </section>



        </div>








        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            МАТЕРИАЛ ПРИ ПРОБИВАНЕ
          </div>

          <h2 style={styles.h2}>
            Какво може да излиза от отвора
          </h2>

          {/* BG1_DIRECT_MATERIAL_RENDER */}
          {bg1KarstProfile ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(280px,1fr))",
                gap: 15,
                width: "100%",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  padding: 16,
                  background: "#f7f5ef",
                  border: "1px solid #e3ded0",
                  borderRadius: 8,
                  color: "#18363d",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  {drillingMaterials.title}
                </div>

                <div
                  style={{
                    lineHeight: 1.55,
                  }}
                >
                  {drillingMaterials.details}
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  background: "#eef6f2",
                  borderRadius: 8,
                  borderLeft: "4px solid #0b6b43",
                  color: "#18363d",
                }}
              >
                <strong>
                  {"\u041f\u043e\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u043f\u0440\u0438 \u0441\u043e\u043d\u0434\u0438\u0440\u0430\u043d\u0435"}
                </strong>

                <div
                  style={{
                    marginTop: 7,
                    lineHeight: 1.55,
                  }}
                >
                  {drillingMaterials.behavior}
                </div>
              </div>
            </div>
          ) : (
          <div
            style={{
              ...styles.materialDetailGrid,
              color: "#18363d",
            }}
          >
            <div style={styles.materialDetailMain}>
              <div style={styles.materialDetailTitle}>
                {drillingMaterials.title}
              </div>

              <p>
                {drillingMaterials.details}
              </p>
            </div>

            <div style={styles.materialBehavior}>
              <strong>
                Поведение при сондиране
              </strong>

              <div style={{marginTop:7}}>
                {drillingMaterials.behavior}
              </div>
            </div>
          </div>

          )}

          <div style={styles.interpretationBadge}>
            <strong>
              Степен на увереност:
            </strong>{" "}
            {drillingMaterials.confidence}
          </div>

          <div style={styles.warning}>
            Това е интерпретация от регионалната
            геоложка и хидрогеоложка информация,
            а не описание на реално извадена
            сондажна проба. Точният материал и
            редуването на пластовете се доказват
            само с теренно проучване или сондаж.
          </div>
        </section>


        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            ПРАКТИЧЕСКИ ИЗВОД
          </div>

          <h2 style={styles.h2}>
            Какво означава това за сондирането
          </h2>

          {/* BG1_DIRECT_PRACTICAL_RENDER */}
          {bg1KarstProfile ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(240px,1fr))",
                gap: 12,
                width: "100%",
                marginTop: 12,
                color: "#18363d",
              }}
            >
              <div style={styles.recommendItem}>
                <strong>
                  {"\u041a\u0430\u043a\u0432\u043e \u0434\u0430 \u0441\u0435 \u043e\u0447\u0430\u043a\u0432\u0430"}
                </strong>

                <span>
                  {"\u041f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435\u0442\u043e \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u043d\u0435\u0440\u0430\u0432\u043d\u043e\u043c\u0435\u0440\u043d\u043e: \u0437\u0434\u0440\u0430\u0432\u0430 \u0441\u043a\u0430\u043b\u0430 \u043c\u043e\u0436\u0435 \u0440\u044f\u0437\u043a\u043e \u0434\u0430 \u043f\u0440\u0435\u043c\u0438\u043d\u0435 \u0432 \u0441\u0438\u043b\u043d\u043e \u043d\u0430\u043f\u0443\u043a\u0430\u043d \u0443\u0447\u0430\u0441\u0442\u044a\u043a \u0438\u043b\u0438 \u043a\u0443\u0445\u0438\u043d\u0430."}
                </span>
              </div>

              <div style={styles.recommendItem}>
                <strong>
                  {"\u041f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0440\u0438\u0441\u043a"}
                </strong>

                <span>
                  {"\u0412\u044a\u0437\u043c\u043e\u0436\u043d\u0438 \u0441\u0430 \u0432\u043d\u0435\u0437\u0430\u043f\u043d\u0438 \u043f\u0440\u043e\u043c\u0435\u043d\u0438 \u0432 \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435, \u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u043d\u0438 \u0437\u043e\u043d\u0438 \u0438 \u0440\u044f\u0437\u043a\u0430 \u043f\u043e\u044f\u0432\u0430 \u043d\u0430 \u0432\u043e\u0434\u043e\u043f\u0440\u0438\u0442\u043e\u043a. \u0412\u043e\u0434\u0430\u0442\u0430 \u043c\u043e\u0436\u0435 \u0434\u0430 \u0435 \u0441\u044a\u0441\u0440\u0435\u0434\u043e\u0442\u043e\u0447\u0435\u043d\u0430 \u0432 \u043e\u0442\u0434\u0435\u043b\u043d\u0438 \u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u0438 \u0438 \u043a\u0443\u0445\u0438\u043d\u0438, \u0430 \u043d\u0435 \u0440\u0430\u0432\u043d\u043e\u043c\u0435\u0440\u043d\u043e \u043f\u043e \u0446\u0435\u043b\u0438\u044f \u0440\u0430\u0437\u0440\u0435\u0437."}
                </span>
              </div>

              <div style={styles.recommendItem}>
                <strong>
                  {"\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u0430 \u0440\u0430\u0437\u0443\u043c\u043d\u0430 \u0441\u0442\u044a\u043f\u043a\u0430"}
                </strong>

                <span>
                  {"\u0422\u0435\u0440\u0435\u043d\u043d\u043e \u0433\u0435\u043e\u0444\u0438\u0437\u0438\u0447\u043d\u043e \u043f\u0440\u043e\u0443\u0447\u0432\u0430\u043d\u0435 \u0437\u0430 \u043b\u043e\u043a\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043d\u0430\u043f\u0443\u043a\u0430\u043d\u0438\u0442\u0435 \u0438 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0438\u0442\u0435 \u0437\u043e\u043d\u0438 \u043f\u0440\u0435\u0434\u0438 \u0438\u0437\u0431\u043e\u0440 \u043d\u0430 \u0442\u043e\u0447\u043d\u0430 \u0441\u043e\u043d\u0434\u0430\u0436\u043d\u0430 \u0442\u043e\u0447\u043a\u0430 \u0438 \u0446\u0435\u043b\u0435\u0432\u0430 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430."}
                </span>
              </div>
            </div>
          ) : (
          <div
            style={{
              ...styles.recommendGrid,
              color: "#18363d",
            }}
          >
            <div style={styles.recommendItem}>
              <strong>
                Вероятна среда
              </strong>
              <span>
                {simple.headline}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                При пробиване
              </strong>
              <span>
                {simple.drilling}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Къде се движи водата
              </strong>
              <span>
                {simple.water}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Следваща разумна стъпка
              </strong>
              <span>
                Теренно геофизично проучване
                за определяне на локалните
                водоносни зони и тяхното
                развитие по дълбочина.
              </span>
            </div>
          </div>          )}

        </section>





        {professional?.isInsideExactProtectionZone && (
          <section style={{
            ...styles.card,
            border: "2px solid #d39b25",
            background: "#fffaf0",
          }}>
            <div style={styles.sectionLabel}>
              САНИТАРНО-ОХРАНИТЕЛНА ЗОНА
            </div>

            <h2 style={styles.h2}>
              Избраната точка попада в официален
              защитен пояс
            </h2>

            <div style={styles.warning}>
              Проверено по точните официални GIS
              полигони на Черноморския район.
              Преди сондиране трябва да се провери
              приложимият разрешителен режим.
            </div>

            <div style={styles.recommendGrid}>
              {professional.exactProtectionZonesAtPoint.map(
                (zone: AnyFeature, index: number) => (
                  <div
                    key={
                      String(
                        zone.properties
                          ?.source_object_id ||
                        index
                      ) +
                      "-" +
                      String(
                        zone.properties
                          ?.protection_belt ||
                        ""
                      )
                    }
                    style={styles.recommendItem}
                  >
                    <strong>
                      {zone.properties
                        ?.protection_belt ||
                        "Неуточнен пояс"}
                    </strong>

                    <span>
                      {zone.properties
                        ?.establishment_order ||
                        "Няма посочена заповед"}

                      {zone.properties
                        ?.competent_authority
                        ? `; орган: ${zone.properties.competent_authority}`
                        : ""}
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {additionalGroundwaterRegisters && (
          <section style={styles.card}>
            <div style={styles.sectionLabel}>
              ОФИЦИАЛНИ ХИДРОГЕОЛОЖКИ ПРОУЧВАНИЯ
            </div>

            <h2 style={styles.h2}>
              Проектни примери в същото подземно водно тяло
            </h2>

            <div style={styles.recommendGrid}>
              <div style={styles.recommendItem}>
                <strong>
                  Регистрирани проучвания за водното тяло
                </strong>

                <span>
                  {additionalGroundwaterRegisters
                    ?.investigation_count ?? 0}
                </span>
              </div>

              <div style={styles.recommendItem}>
                <strong>
                  Проучвания с налични координати
                </strong>

                <span>
                  {additionalGroundwaterRegisters
                    ?.mappable_investigation_count ?? 0}
                </span>
              </div>

              <div style={styles.recommendItem}>
                <strong>
                  Санитарно-охранителни зони за водното тяло
                </strong>

                <span>
                  {additionalGroundwaterRegisters
                    ?.protection_zone_count ?? 0}
                </span>
              </div>

              <div style={styles.recommendItem}>
                <strong>
                  Потвърдено прекратени санитарни зони
                </strong>

                <span>
                  {additionalGroundwaterRegisters
                    ?.terminated_protection_zone_count ?? 0}
                </span>
              </div>
            </div>

            {nearestHydrogeologicalInvestigation && (
              <div style={styles.note}>
                <strong>
                  Най-близко регистрирано проучване:
                </strong>{" "}

                {fmt(
                  nearestHydrogeologicalInvestigation
                    .distanceKm,
                  2
                )} km.

                {" "}Населено място:{" "}
                {nearestHydrogeologicalInvestigation
                  .properties?.settlement || "Няма данни"}.

                {" "}Проектна дълбочина:{" "}
                {nearestHydrogeologicalInvestigation
                  .properties?.project_depth_source ||
                  (
                    nearestHydrogeologicalInvestigation
                      .properties?.project_depth_m != null
                      ? `${fmt(
                          nearestHydrogeologicalInvestigation
                            .properties.project_depth_m
                        )} m`
                      : "Няма данни"
                  )}.

                {" "}Конструкция:{" "}
                {nearestHydrogeologicalInvestigation
                  .properties?.construction_description ||
                  "Няма публикувана конструкция"}.
              </div>
            )}

            {registeredHydrogeologicalInvestigations.length > 0 && (
              <details style={{ marginTop: 16 }}>
                <summary style={{
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#173f32",
                }}>
                  Виж проектни дълбочини и конструкции
                </summary>

                <div style={{
                  overflowX: "auto",
                  marginTop: 12,
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 8 }}>
                          Населено място
                        </th>

                        <th style={{ padding: 8 }}>
                          Разстояние
                        </th>

                        <th style={{ padding: 8 }}>
                          Проектна дълбочина
                        </th>

                        <th style={{ padding: 8 }}>
                          Конструкция
                        </th>

                        <th style={{ padding: 8 }}>
                          Статус
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {registeredHydrogeologicalInvestigations.map(
                        (item: any, index: number) => (
                          <tr key={
                            String(
                              item.properties?.source_row || index
                            ) +
                            "-" +
                            index
                          }>
                            <td style={{
                              padding: 8,
                              borderTop: "1px solid #e2e9e5",
                            }}>
                              {item.properties?.settlement ||
                                "Няма данни"}
                            </td>

                            <td style={{
                              padding: 8,
                              borderTop: "1px solid #e2e9e5",
                            }}>
                              {fmt(item.distanceKm, 2)} km
                            </td>

                            <td style={{
                              padding: 8,
                              borderTop: "1px solid #e2e9e5",
                            }}>
                              {item.properties?.project_depth_source ||
                                (
                                  item.properties?.project_depth_m != null
                                    ? `${fmt(
                                        item.properties.project_depth_m
                                      )} m`
                                    : "Няма данни"
                                )}
                            </td>

                            <td style={{
                              padding: 8,
                              borderTop: "1px solid #e2e9e5",
                            }}>
                              {item.properties
                                ?.construction_description ||
                                "Няма данни"}
                            </td>

                            <td style={{
                              padding: 8,
                              borderTop: "1px solid #e2e9e5",
                            }}>
                              {item.properties?.status === "liquidated"
                                ? "Ликвидирано проучване"
                                : "Регистрирано проучване"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {nearestHydrogeologicalInvestigation ? (
              <div style={{
                ...styles.note,
                marginTop: 16,
                lineHeight: 1.7,
              }}>
                <strong>
                  Какво означава това за планирания сондаж?
                </strong>

                <p
                  data-sondi-keep-note="true"
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  В същото подземно водно тяло има официално
                  регистрирано хидрогеоложко проучване на{" "}
                  {fmt(
                    nearestHydrogeologicalInvestigation
                      .distanceKm,
                    2
                  )}{" "}
                  km от избраната точка.

                  {nearestHydrogeologicalInvestigation
                    .properties?.project_depth_m != null && (
                    <>
                      {" "}За него е предвидена проектна
                      дълбочина{" "}
                      {nearestHydrogeologicalInvestigation
                        .properties?.project_depth_source ||
                        `${fmt(
                          nearestHydrogeologicalInvestigation
                            .properties.project_depth_m
                        )} m`}.
                    </>
                  )}

                  {nearestHydrogeologicalInvestigation
                    .properties?.construction_description && (
                    <>
                      {" "}В регистъра е описана следната
                      конструкция:{" "}
                      {nearestHydrogeologicalInvestigation
                        .properties.construction_description}.
                    </>
                  )}

                  {" "}Това дава ориентир какъв подход е
                  използван при проучване на същия водоносен
                  хоризонт. Не означава, че за конкретния имот
                  трябва да се повторят същата дълбочина,
                  диаметър или конструкция.
                </p>
              </div>
            ) : (
              <div style={{
                ...styles.note,
                marginTop: 16,
                lineHeight: 1.7,
              }}>
                <strong>
                  Какво означава това за планирания сондаж?
                </strong>

                <p
                  data-sondi-keep-note="true"
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  В използвания официален регистър няма
                  картографирано хидрогеоложко проучване,
                  което да предоставя подходящ сравнителен
                  пример за същото подземно водно тяло.
                  Дълбочината и конструкцията трябва да се
                  определят по наличните геоложки данни,
                  действителните близки съоръжения и
                  проучване на конкретния терен.
                </p>
              </div>
            )}

            {Number(
              additionalGroundwaterRegisters
                ?.protection_zone_count ?? 0
            ) > 0 && (
              <div style={{
                ...styles.warning,
                marginTop: 12,
                lineHeight: 1.7,
              }}>
                <strong>
                  Проверка преди започване на сондаж:
                </strong>{" "}

                За същото подземно водно тяло са
                регистрирани{" "}
                {
                  additionalGroundwaterRegisters
                    .protection_zone_count
                }{" "}
                санитарно-охранителни{" "}
                {Number(
                  additionalGroundwaterRegisters
                    .protection_zone_count
                ) === 1
                  ? "зона"
                  : "зони"}.

                {" "}Преди сондиране трябва да се провери
                приложимият разрешителен режим и дали
                имотът попада в защитена зона. Броят тук се отнася за цялото
                подземно водно тяло. Избраната точка
                се проверява отделно по официалните
                GIS граници на защитните пояси.
              </div>
            )}

            <div style={styles.warning}>
              Посочените дълбочини, диаметри и конструкции
              са проектни примери от официални хидрогеоложки
              проучвания. Те не потвърждават действащ сондаж
              и не определят автоматично технологията или
              дълбочината за конкретния имот. Санитарните зони от регистъра са
              обобщени за цялото подземно водно тяло.
              За избраната точка се използват точните
              официални GIS граници на защитните пояси.
              Те не представляват граници на имоти.
            </div>
          </section>
        )}

        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            ДЪЛБОЧИНА И СТАТИЧНО ВОДНО НИВО
          </div>

          <h2 style={styles.h2}>
            Ориентири от действителни съседни съоръжения
          </h2>

          <div style={styles.recommendGrid}>

            <div style={styles.recommendItem}>
              <strong>
                {"\u041e\u0431\u0449\u043e \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u0438 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u044f \u0434\u043e 5 km"}
              </strong>

              <span>
                {professional.ordinaryCount5Km ?? 0}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Регистрирани дълбочини до 5 km
              </strong>

              <span>
                {professional.depthCount > 0
                  ? `${fmt(
                      professional.depthMin
                    )} - ${fmt(
                      professional.depthMax
                    )} m`
                  : "Няма достатъчно данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Медианна дълбочина
              </strong>

              <span>
                {professional.depthMedian != null
                  ? `${fmt(
                      professional.depthMedian
                    )} m`
                  : "Няма достатъчно данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Статични водни нива
              </strong>

              <span>
                {professional.staticCount > 0
                  ? `${fmt(
                      professional.staticMin
                    )} - ${fmt(
                      professional.staticMax
                    )} m`
                  : "Няма достатъчно данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Медианно статично ниво
              </strong>

              <span>
                {professional.staticMedian != null
                  ? `${fmt(
                      professional.staticMedian
                    )} m`
                  : "Няма достатъчно данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Брой съоръжения с известна дълбочина
              </strong>

              <span>
                {professional.depthCount}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Брой съоръжения със статично ниво
              </strong>

              <span>
                {professional.staticCount}
              </span>
            </div>
          </div>

                    {professional.ordinaryCount5Km > 0 &&
          professional.depthCount === 0 &&
          professional.staticCount === 0 ? (
            <div
              style={{
                ...styles.note,
                marginTop: 12,
                color: "#18363d",
              }}
            >
              {"\u0412 \u0440\u0430\u0434\u0438\u0443\u0441 \u0434\u043e 5 km \u0438\u043c\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0430\u043d\u043e \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435, \u043d\u043e \u0437\u0430 \u043d\u0435\u0433\u043e \u0432 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438\u044f \u0440\u0435\u0433\u0438\u0441\u0442\u044a\u0440 \u043d\u044f\u043c\u0430 \u043f\u043e\u0441\u043e\u0447\u0435\u043d\u0438 \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430 \u0438 \u0441\u0442\u0430\u0442\u0438\u0447\u043d\u043e \u0432\u043e\u0434\u043d\u043e \u043d\u0438\u0432\u043e. \u041d\u0443\u043b\u0430\u0442\u0430 \u043f\u043e-\u0433\u043e\u0440\u0435 \u043e\u0437\u043d\u0430\u0447\u0430\u0432\u0430 \u043b\u0438\u043f\u0441\u0430 \u043d\u0430 \u043f\u0443\u0431\u043b\u0438\u043a\u0443\u0432\u0430\u043d\u0438 \u0438\u0437\u043c\u0435\u0440\u0432\u0430\u043d\u0438\u044f, \u0430 \u043d\u0435 \u043b\u0438\u043f\u0441\u0430 \u043d\u0430 \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435."}
            </div>
          ) : null}

<div style={styles.warning}>
            Статичното водно ниво е установеното ниво на
            водата в съществуващо съоръжение. То не е
            гарантирана дълбочина до първата вода.
            Дълбочините на близките съоръжения са
            сравнителен ориентир, а не проектна
            дълбочина за конкретния имот.
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            ТЕХНОЛОГИЯ И КОНСТРУКЦИЯ НА СОНДАЖА
          </div>

          <h2 style={styles.h2}>
            Предварителна техническа преценка
          </h2>

          <div style={styles.recommendGrid}>
            <div style={styles.recommendItem}>
              <strong>
                Официално описана литология
              </strong>

              <span>
                {geologyProfile?.lithology ||
                  "Няма публикувана подробна литология"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Водоносен хоризонт
              </strong>

              <span>
                {geologyProfile
                  ?.hydrogeological_horizon ||
                  "Няма налични данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Тип на водоносната среда
              </strong>

              <span>
                {bg2FracturedKarstProfile
                  ? "\u043f\u0443\u043a\u043d\u0430\u0442\u0438\u043d\u043d\u043e-\u043a\u0430\u0440\u0441\u0442\u043e\u0432\u0430 \u0432\u043e\u0434\u043e\u043d\u043e\u0441\u043d\u0430 \u0441\u0440\u0435\u0434\u0430"
                  : geologyProfile?.water_type ||
                    geologyProfile?.collector_type ||
                  "Няма налични данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Дебелина на водоносния хоризонт
              </strong>

              <span>
                {geologyProfile?.aquifer_thickness_m
                  ? `${geologyProfile.aquifer_thickness_m} m`
                  : "Няма налични данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Коефициент на филтрация
              </strong>

              <span>
                {geologyProfile
                  ?.filtration_coefficient_m_day
                  ? `${geologyProfile.filtration_coefficient_m_day} m/ден`
                  : "Няма налични данни"}
              </span>
            </div>

            <div style={styles.recommendItem}>
              <strong>
                Водопроводимост
              </strong>

              <span>
                {geologyProfile
                  ?.transmissivity_m2_day
                  ? `${geologyProfile.transmissivity_m2_day} m²/ден`
                  : "Няма налични данни"}
              </span>
            </div>
          </div>

          <details style={{ marginTop: 18 }}>
            <summary style={{
              cursor: "pointer",
              fontWeight: 800,
              color: "#173f32",
            }}>
              Виж технологичните препоръки
            </summary>

            <div style={styles.note}>
              <strong>
                Подходящ тип сондажна технология:
              </strong>

              <p>
                {drillingTechnology}
              </p>

              <strong>
                Обсадни тръби:
              </strong>

              <p>
                {casingRecommendation}
              </p>

              <strong>
                Филтри и чакълеста засипка:
              </strong>

              <p>
                {filterRecommendation}
              </p>

              <strong>
                Изолиране на горни води и циментация:
              </strong>

              <p style={{ marginBottom: 0 }}>
                {cementationRecommendation}
              </p>
            </div>
          </details>

          <div style={styles.warning}>
            Методът, диаметърът, сондажната глава,
            обсадните тръби, филтърните интервали и
            циментацията се определят окончателно по
            проект и действителен сондажен разрез.
          </div>
        </section>






        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            {"\u0420\u0418\u0421\u041a\u041e\u0412\u0415 \u041f\u0420\u0418 \u041f\u0420\u041e\u0411\u0418\u0412\u0410\u041d\u0415"}
          </div>

          <h2 style={styles.h2}>
            {"\u041a\u0430\u043a\u0432\u043e \u0434\u0430 \u0441\u0435 \u0438\u043c\u0430 \u043f\u0440\u0435\u0434\u0432\u0438\u0434 \u043d\u0430 \u0442\u0435\u0440\u0435\u043d"}
          </h2>

          <div style={styles.note}>
            {drillingRiskItems.map(
              (item, index) => (
                <p
                  key={index}
                  data-sondi-keep-note="true"
                  style={{
                    margin:
                      index === 0
                        ? 0
                        : "10px 0 0",
                  }}
                >
                  {"\u2022 "}{item}
                </p>
              )
            )}
          </div>
        </section>


        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            {"\u041a\u041e\u041d\u0422\u0420\u041e\u041b \u041f\u041e \u0412\u0420\u0415\u041c\u0415 \u041d\u0410 \u0421\u041e\u041d\u0414\u0418\u0420\u0410\u041d\u0415"}
          </div>

          <h2 style={styles.h2}>
            {"\u041a\u0430\u043a\u0432\u043e \u0434\u0430 \u0441\u0435 \u043e\u0442\u0431\u0435\u043b\u044f\u0437\u0432\u0430 \u043f\u043e \u0434\u044a\u043b\u0431\u043e\u0447\u0438\u043d\u0430"}
          </h2>

          <div style={styles.recommendGrid}>
            {drillingFieldControlItems.map(
              (item, index) => (
                <div
                  key={index}
                  style={styles.recommendItem}
                >
                  <strong>
                    {index + 1}.
                  </strong>{" "}
                  {item}
                </div>
              )
            )}
          </div>
        </section>


        <section style={styles.card}>
          <div style={styles.sectionLabel}>
            {"\u0421\u041b\u0415\u0414 \u0414\u041e\u0421\u0422\u0418\u0413\u0410\u041d\u0415 \u041d\u0410 \u0412\u041e\u0414\u0410"}
          </div>

          <h2 style={styles.h2}>
            {"\u041a\u0430\u043a \u0441\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u044f\u0432\u0430 \u0434\u0430\u043b\u0438 \u0441\u043e\u043d\u0434\u0430\u0436\u044a\u0442 \u0435 \u0443\u0441\u043f\u0435\u0448\u0435\u043d"}
          </h2>

          <div style={styles.recommendGrid}>
            {drillingCompletionItems.map(
              (item, index) => (
                <div
                  key={index}
                  style={styles.recommendItem}
                >
                  <strong>
                    {index + 1}.
                  </strong>{" "}
                  {item}
                </div>
              )
            )}
          </div>

          <div
            style={{
              ...styles.warning,
              marginTop: 16,
            }}
          >
            {"\u041c\u043e\u043c\u0435\u043d\u0442\u043d\u0438\u044f\u0442 \u043f\u0440\u0438\u0442\u043e\u043a \u043f\u043e \u0432\u0440\u0435\u043c\u0435 \u043d\u0430 \u043f\u0440\u043e\u0431\u0438\u0432\u0430\u043d\u0435 \u043d\u0435 \u0435 \u0440\u0430\u0432\u0435\u043d \u043d\u0430 \u0443\u0441\u0442\u043e\u0439\u0447\u0438\u0432 \u0434\u0435\u0431\u0438\u0442. \u041e\u043a\u043e\u043d\u0447\u0430\u0442\u0435\u043b\u043d\u0430\u0442\u0430 \u043e\u0446\u0435\u043d\u043a\u0430 \u0441\u0435 \u043f\u0440\u0430\u0432\u0438 \u0441\u043b\u0435\u0434 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u043d\u0435 \u0438 \u043f\u0440\u043e\u0431\u043d\u043e \u0432\u043e\u0434\u043e\u0447\u0435\u0440\u043f\u0435\u043d\u0435."}
          </div>
        </section>


        <div style={styles.footer}>
          Източници: официални регистри на басейновите дирекции, ПУРБ 2022–2027, геоложки и хидрогеоложки данни, регистрирани водовземни съоръжения и наличен официален мониторинг.
        </div>

      </div>
    </main>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricTitle}>
        {title}
      </div>
      <div style={styles.metricValue}>
        {value}
      </div>
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background: "#eef2f0",
    color: "#17211d",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    padding: "28px 16px 60px",
  },

  shell: {
    maxWidth: 1180,
    margin: "0 auto",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: 800,
    color: "#0b6b43",
  },

  h1: {
    fontSize: 34,
    margin: "5px 0 5px",
  },

  h2: {
    fontSize: 22,
    margin: "6px 0 14px",
  },

  coords: {
    color: "#5e6863",
    fontFamily: "monospace",
  },

  backButton: {
    textDecoration: "none",
    color: "#fff",
    background: "#173f32",
    padding: "11px 16px",
    borderRadius: 8,
    fontWeight: 700,
  },

  heroCard: {
    background: "#183f33",
    color: "#fff",
    padding: 28,
    borderRadius: 14,
    marginBottom: 18,
    boxShadow:
      "0 8px 28px rgba(0,0,0,.10)",
  },

  heroTitle: {
    fontSize: 30,
    margin: "7px 0 10px",
  },

  lead: {
    maxWidth: 850,
    lineHeight: 1.55,
    opacity: 0.92,
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 12,
    marginTop: 22,
  },

  metric: {
    padding: 14,
    background:
      "rgba(255,255,255,.09)",
    border:
      "1px solid rgba(255,255,255,.14)",
    borderRadius: 9,
  },

  metricTitle: {
    fontSize: 12,
    opacity: 0.75,
    marginBottom: 5,
  },

  metricValue: {
    fontWeight: 800,
    lineHeight: 1.3,
  },

  materialHero: {
    marginTop: 18,
    padding: 18,
    display: "flex",
    gap: 16,
    alignItems: "center",
    background: "rgba(255,255,255,.12)",
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 10,
  },

  materialIcon: {
    fontSize: 34,
    minWidth: 44,
    textAlign: "center",
  },

  materialLabel: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.2,
    opacity: 0.75,
    marginBottom: 4,
  },

  materialTitle: {
    fontSize: 20,
    fontWeight: 900,
    lineHeight: 1.25,
  },

  materialShort: {
    marginTop: 5,
    lineHeight: 1.45,
    opacity: 0.92,
  },

  materialDetailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
    gap: 15,
    width: "100%",
    alignItems: "start",
  },

  materialDetailMain: {
    padding: 16,
    background: "#f7f5ef",
    borderRadius: 8,
    border: "1px solid #e3ded0",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  materialDetailTitle: {
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 8,
  },

  materialBehavior: {
    padding: 16,
    background: "#eef6f2",
    borderRadius: 8,
    borderLeft: "4px solid #0b6b43",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
    overflowWrap: "anywhere",
  },

  interpretationBadge: {
    display: "inline-block",
    marginTop: 13,
    padding: "8px 11px",
    background: "#eef2f0",
    borderRadius: 6,
    fontSize: 13,
  },

  simpleBox: {
    marginTop: 18,
    padding: 17,
    borderRadius: 9,
    background:
      "rgba(255,255,255,.08)",
    lineHeight: 1.55,
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: 18,
    marginBottom: 18,
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 18,
    boxShadow:
      "0 4px 18px rgba(0,0,0,.06)",
    lineHeight: 1.55,
  },

  sectionLabel: {
    color: "#0b6b43",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.5,
  },

  note: {
    marginTop: 14,
    background: "#eef6f2",
    borderLeft:
      "4px solid #0b6b43",
    padding: 12,
    borderRadius: 4,
  },

  bodyCard: {
    border: "1px solid #d7e2de",
    background: "#f9fbfa",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },

  diagramWrap: {
    overflow: "hidden",
    borderRadius: 9,
    border: "1px solid #d8ddd9",
    background: "#faf8f2",
  },

  explainBox: {
    marginTop: 10,
    padding: 12,
    background: "#f0f7f4",
    borderLeft: "4px solid #18805d",
    borderRadius: 6,
    fontSize: 14,
    lineHeight: 1.55,
  },

  bodyMeaning: {
    marginTop: 10,
    padding: 11,
    background: "#fff9e9",
    borderLeft: "4px solid #c38b19",
    borderRadius: 6,
    lineHeight: 1.5,
  },

  diagramSurface: {
    padding: "16px 20px",
    background: "#4f7045",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
  },

  diagramGround: {
    position: "relative",
    minHeight: 150,
    padding: "24px 150px 24px 24px",
    background:
      "linear-gradient(180deg,#d8c69e,#cbb58a)",
    borderTop: "7px solid #374332",
  },

  diagramTitle: {
    fontSize: 24,
    fontWeight: 800,
  },

  diagramText: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 1.5,
  },

  drillLine: {
    position: "absolute",
    right: 35,
    top: 15,
    width: 80,
    textAlign: "center",
  },

  drillHead: {
    fontSize: 12,
    fontWeight: 900,
    background: "#333",
    color: "#fff",
    padding: 6,
    borderRadius: 4,
  },

  drillPipe: {
    fontSize: 28,
    lineHeight: 0.95,
    color: "#333",
    fontWeight: 900,
  },

  aquiferStack: {
    padding: 18,
    background: "#e5ddd0",
  },

  aquiferLayer: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 9,
    background:
      "linear-gradient(90deg,#b8dfea,#8fc9db)",
    border: "1px solid #78b7ca",
  },

  aquiferNumber: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.5,
    color: "#14566b",
    marginBottom: 3,
  },

  aquiferType: {
    marginTop: 5,
    fontWeight: 800,
  },

  aquiferExplanation: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 1.45,
    maxWidth: 900,
  },

  monitoringDiagram: {
    display: "flex",
    gap: 18,
    alignItems: "center",
    padding: 18,
    background: "#edf4ff",
    borderTop: "1px solid #cad8eb",
  },

  monitoringIcon: {
    minWidth: 42,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 0.9,
    color: "#2867a2",
    fontWeight: 900,
  },

  diagramFlow: {
    padding: 16,
    background: "#f8faf9",
    borderTop: "1px solid #d8ddd9",
    lineHeight: 1.5,
  },

  measureRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    margin: "12px 0",
  },

  measureYear: {
    display: "block",
    fontSize: 11,
    color: "#65736d",
    marginBottom: 2,
  },

  bodyGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: 12,
  },

  bodyNumber: {
    fontSize: 11,
    fontWeight: 900,
    color: "#247f96",
    letterSpacing: 1,
    marginBottom: 3,
  },

  bodyName: {
    margin: "4px 0 8px",
  },

  diagramBodyCode: {
    fontSize: 18,
    fontWeight: 800,
  },

  diagramLegend: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    padding: 15,
    background: "#f6f8f7",
    borderTop: "1px solid #d8ddd9",
    fontSize: 13,
  },

  recommendGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: 12,
  },

  recommendItem: {
    padding: 15,
    background: "#f5f8f6",
    border: "1px solid #dce5e0",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  warning: {
    marginTop: 12,
    fontSize: 13,
    background: "#fff6dc",
    borderLeft:
      "4px solid #c58a00",
    padding: 11,
  },

  footer: {
    textAlign: "center",
    color: "#66716c",
    fontSize: 12,
    padding: 12,
  },
};
