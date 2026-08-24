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
