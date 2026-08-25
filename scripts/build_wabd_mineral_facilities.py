import json
from pathlib import Path
from copy import deepcopy

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "geology-map" / "data"

EXISTING_GEOJSON = DATA / "bd_wabd_mineral_water_facilities.geojson"
OUTPUT_GEOJSON = DATA / "bd_wabd_mineral_water_facilities.geojson"
MASTER_OUTPUT = DATA / "bd_wabd_mineral_water_facilities_master.json"


def norm(value):
    return (
        str(value or "")
        .lower()
        .replace("„", '"')
        .replace("“", '"')
        .replace("№ ", "№")
        .replace("хг", "hg")
        .replace("вкп", "vkp")
        .strip()
    )


def key_for(properties):
    return (
        norm(properties.get("mineral_deposit")),
        norm(properties.get("facility_name")),
    )


def feature(lon, lat, deposit, facility, settlement, municipality,
            district, coordinates_raw, source_document,
            coordinate_method="official_geographic_dms",
            source_status="listed_in_official_document",
            extra=None):

    props = {
        "source_file": source_document,
        "source_sheet": None,
        "source_excel_row": None,
        "registration_number_date": None,
        "exclusive_state_property_act": None,
        "public_state_property_facility_act": None,
        "mineral_deposit": deposit,
        "deposit_section": None,
        "facility_role_source": "водовземно",
        "facility_role_normalized": "abstraction",
        "facility_name": facility,
        "settlement": settlement,
        "municipality": municipality,
        "district": district,
        "property_number": None,
        "year_built": None,
        "coordinates_raw": coordinates_raw,
        "coordinate_method": coordinate_method,
        "bgs2005_coordinates_raw": None,
        "wellhead_elevation_m": None,
        "depth_m": None,
        "construction_characteristics": None,
        "pressure_or_water_level": None,
        "wellhead_equipment": None,
        "equipment_condition": None,
        "soz_coordinates_raw": None,
        "soz_properties_raw": None,
        "soz_order": None,
        "resource_approval_order": None,
        "certificate_or_balneological_assessment": None,
        "facility_condition": None,
        "source_status": source_status,
        "groundwater_body_linked": False,
        "groundwater_body_link_note":
            "No canonical groundwater-body code is available in the official source; no body linkage is inferred.",
    }

    if extra:
        props.update(extra)

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [lon, lat],
        },
        "properties": props,
    }


CURATED_OFFICIAL_COORDINATES = [
    feature(
        23.057194444444445,
        42.00608333333333,
        "„Благоевград – р. Струма” №11",
        "Сондаж 1ХГ",
        "Зелен дол",
        "Благоевград",
        "Благоевград",
        '42°00\'21.9" 23°03\'25.9"',
        "BDZBR HidrogeodokladZelendol.pdf",
        extra={
            "wellhead_elevation_m": 323.703,
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HidrogeodokladZelendol.pdf",
        },
    ),
    feature(
        23.05388888888889,
        42.004666666666665,
        "„Благоевград – р. Струма” №11",
        "Сондаж 14ХГ",
        "Зелен дол",
        "Благоевград",
        "Благоевград",
        '42°00\'16.8" 23°03\'14.0"',
        "BDZBR HidrogeodokladZelendol.pdf",
        extra={
            "wellhead_elevation_m": 322.629,
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HidrogeodokladZelendol.pdf",
        },
    ),

    feature(
        23.16713888888889,
        42.58611111111111,
        "„Рударци” №62",
        "Сондаж №7",
        "???????",
        "??????",
        "??????",
        '42?35\'10.0" 23?10\'01.7"',
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.167055555555555,
        42.58625,
        "„Рударци” №62",
        "Сондаж №8",
        "???????",
        "??????",
        "??????",
        '42?35\'10.5" 23?10\'01.4"',
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.166916666666666,
        42.58630555555556,
        "„Рударци” №62",
        "Сондаж №9",
        "???????",
        "??????",
        "??????",
        '42?35\'10.7" 23?10\'00.9"',
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16761111,
        42.58638889,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21161",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16750000,
        42.58652778,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21162",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16713889,
        42.58644444,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21163",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16722222,
        42.58638889,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21164",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16733333,
        42.58630556,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21165",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.16722222,
        42.58622222,
        "\u201e\u0420\u0443\u0434\u0430\u0440\u0446\u0438\u201d \u211662",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21166",
        "\u0420\u0443\u0434\u0430\u0440\u0446\u0438",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "\u041f\u0435\u0440\u043d\u0438\u043a",
        "official WGS84 table",
        "BDZBR HDRudarci.pdf",
        extra={
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/HDRudarci.pdf",
        },
    ),
    feature(
        23.11328333888889,
        41.893722225,
        "\u201e\u0421\u0438\u043c\u0438\u0442\u043b\u0438\u201d \u211670",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21162",
        "\u0421\u0438\u043c\u0438\u0442\u043b\u0438",
        "\u0421\u0438\u043c\u0438\u0442\u043b\u0438",
        "\u0411\u043b\u0430\u0433\u043e\u0435\u0432\u0433\u0440\u0430\u0434",
        "41\u00b053'37.40001\" 23\u00b006'47.82002\"",
        "BDZBR OcenkaresSimitli.pdf",
        extra={
            "facility_role_source": "\u043b\u0438\u043a\u0432\u0438\u0434\u0438\u0440\u0430\u043d\u043e",
            "facility_role_normalized": "inactive",
            "facility_condition": "\u043b\u0438\u043a\u0432\u0438\u0434\u0438\u0440\u0430\u043d/\u043d\u0435\u0430\u043a\u0442\u0438\u0432\u0435\u043d",
            "coordinate_source_url":
                "https://wabd.bg/docs/dokladi/MINERALNIVODI/OcenkaresSimitli.pdf",
        },
    ),
    feature(
        23.3235628,
        41.5115799,
        "\u201e\u0421\u043f\u0430\u0442\u043e\u0432\u043e\u201d",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21161\u0445\u0433",
        "\u0421\u043f\u0430\u0442\u043e\u0432\u043e",
        "\u0421\u0430\u043d\u0434\u0430\u043d\u0441\u043a\u0438",
        "\u0411\u043b\u0430\u0433\u043e\u0435\u0432\u0433\u0440\u0430\u0434",
        "BGS1970 K9 X=4471853.95 Y=8498461.46",
        "SOZ Spatovo",
        coordinate_method="official_bgs1970_k9_transformed_to_wgs84",
        extra={
            "bgs1970_coordinates_raw":
                "X=4471853.95; Y=8498461.46",
            "transformation_note":
                "BGS1970 K9 -> WGS84 geographic via GeoMapBG official transformation model",
        },
    ),
    feature(
        23.3246758,
        41.5122356,
        "\u201e\u0421\u043f\u0430\u0442\u043e\u0432\u043e\u201d",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u21163\u0445\u0433",
        "\u0421\u043f\u0430\u0442\u043e\u0432\u043e",
        "\u0421\u0430\u043d\u0434\u0430\u043d\u0441\u043a\u0438",
        "\u0411\u043b\u0430\u0433\u043e\u0435\u0432\u0433\u0440\u0430\u0434",
        "BGS1970 K9 X=4471926.68 Y=8498554.47",
        "SOZ Spatovo",
        coordinate_method="official_bgs1970_k9_transformed_to_wgs84",
        extra={
            "bgs1970_coordinates_raw":
                "X=4471926.68; Y=8498554.47",
            "transformation_note":
                "BGS1970 K9 -> WGS84 geographic via GeoMapBG official transformation model",
        },
    ),
    feature(
        23.3352885,
        41.4987580,
        "\u201e\u0425\u043e\u0442\u043e\u0432\u043e\u201d",
        "\u0421\u043e\u043d\u0434\u0430\u0436 \u0421\u043d-7",
        "\u0425\u043e\u0442\u043e\u0432\u043e",
        "\u0421\u0430\u043d\u0434\u0430\u043d\u0441\u043a\u0438",
        "\u0411\u043b\u0430\u0433\u043e\u0435\u0432\u0433\u0440\u0430\u0434",
        "BGS1970 K9 X=4470428.76 Y=8499439.02",
        "SOZ Hotovo",
        coordinate_method="official_bgs1970_k9_transformed_to_wgs84",
        extra={
            "bgs1970_coordinates_raw":
                "X=4470428.76; Y=8499439.02",
            "transformation_note":
                "BGS1970 K9 -> WGS84 geographic via GeoMapBG official transformation model",
        },
    )
]


def main():
    existing = json.loads(EXISTING_GEOJSON.read_text(encoding="utf-8"))
    features = deepcopy(existing.get("features", []))

    by_key = {
        key_for(f.get("properties", {})): f
        for f in features
    }

    added = []

    for f in CURATED_OFFICIAL_COORDINATES:
        k = key_for(f["properties"])

        if k in by_key:
            print("EXISTS:", f["properties"]["mineral_deposit"],
                  "|", f["properties"]["facility_name"])
            continue

        features.append(f)
        by_key[k] = f
        added.append(f)

    output = {
        "type": "FeatureCollection",
        "features": features,
    }

    OUTPUT_GEOJSON.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    master = {
        "schema_version": 1,
        "description":
            "Curated BDZBR mineral-water facility master. Only facilities with official point coordinates are emitted to GeoJSON.",
        "feature_count": len(features),
        "existing_feature_count": len(existing.get("features", [])),
        "new_curated_feature_count": len(added),
        "features": features,
    }

    MASTER_OUTPUT.write_text(
        json.dumps(master, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print("Existing:", len(existing.get("features", [])))
    print("Added:", len(added))
    print("Final:", len(features))
    print("GeoJSON:", OUTPUT_GEOJSON)
    print("Master:", MASTER_OUTPUT)


if __name__ == "__main__":
    main()

