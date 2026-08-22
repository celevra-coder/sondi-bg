from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd


def clean(value: Any) -> Any:
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    if isinstance(value, str):
        value = value.strip()
        return value or None

    if isinstance(value, float) and value.is_integer():
        return int(value)

    return value


def normalize_code(value: Any) -> str:
    return re.sub(
        r"[^A-Z0-9]",
        "",
        str(value or "").upper(),
    )


def find_one(root: Path, pattern: str) -> Path:
    matches = sorted(
        path
        for path in root.rglob(pattern)
        if path.is_file()
    )

    if len(matches) != 1:
        raise RuntimeError(
            f"{pattern}: found {len(matches)}, expected 1"
        )

    return matches[0]


def measure_category(code: str) -> tuple[str, str]:
    prefix = code.split("_")[0].upper()

    categories = {
        "NI": (
            "nitrates_agriculture",
            "Нитрати и земеделски дейности",
        ),
        "DP": (
            "diffuse_pollution",
            "Дифузно и промишлено замърсяване",
        ),
        "OS": (
            "investigation_monitoring",
            "Проучвания и мониторинг",
        ),
        "DW": (
            "drinking_water_protection",
            "Защита на питейните води",
        ),
        "CA": (
            "abstraction_control",
            "Контрол на водовземането",
        ),
        "GO": (
            "water_management",
            "Управление на водите",
        ),
        "IP": (
            "industrial_monitoring",
            "Промишлен натиск и мониторинг",
        ),
        "UW": (
            "wastewater",
            "Отпадъчни води",
        ),
        "PM": (
            "prevention",
            "Предотвратяване на влошаване",
        ),
    }

    return categories.get(
        prefix,
        ("other", "Други официални мерки"),
    )


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: build_section7_pro_data.py "
            "<source-directory> <section5-json> <output-json>"
        )

    source_root = Path(sys.argv[1]).resolve()
    section5_path = Path(sys.argv[2]).resolve()
    output_path = Path(sys.argv[3]).resolve()

    measures_path = find_one(
        source_root,
        "*7.2.1*PoM_EARBD.xlsx",
    )

    supplementary_path = find_one(
        source_root,
        "*7.2.2*merki.xlsx",
    )

    section5 = json.loads(
        section5_path.read_text(encoding="utf-8-sig")
    )

    base_profiles = section5.get("profiles", [])

    if len(base_profiles) != 41:
        raise RuntimeError(
            f"Section 5 profiles: {len(base_profiles)}, expected 41"
        )

    main_table = pd.read_excel(
        measures_path,
        header=3,
    )

    additional_table = pd.read_excel(
        supplementary_path,
        header=1,
    )

    kinds = (
        main_table.iloc[:, 4]
        .fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    groundwater_rows = main_table[
        kinds.eq("подземно")
    ].copy()

    basin_rows = main_table[
        kinds.eq("рбу")
    ].copy()

    if len(groundwater_rows) != 122:
        raise RuntimeError(
            f"Groundwater measures: {len(groundwater_rows)}, expected 122"
        )

    additional_by_code: dict[str, dict[str, Any]] = {}

    for _, row in additional_table.iterrows():
        values = [clean(value) for value in row.tolist()]
        code = str(values[0] or "").strip()

        if not code:
            continue

        additional_by_code[code] = {
            "measure_code": code,
            "catalogue_name": values[4],
            "catalogue_type": values[5],
            "implementing_authority": values[6],
            "catalogue_cost": values[7],
            "catalogue_funding": values[8],
        }

    measures_by_code: dict[str, list[dict[str, Any]]] = {}

    for _, row in groundwater_rows.iterrows():
        values = [clean(value) for value in row.tolist()]

        gwb_code = str(values[2] or "").strip()
        measure_code = str(values[17] or "").strip()

        category, category_label = measure_category(
            measure_code
        )

        measure_type_code = str(values[15] or "").strip()
        measure_kind_code = str(values[16] or "").strip()

        record = {
            "gwb_code": gwb_code,
            "gwb_name": values[3],
            "quantitative_status": values[8],
            "chemical_status": values[9],
            "official_objective": values[10],
            "driving_force": values[11],
            "significant_pressure": values[12],
            "ktm_code": values[13],
            "ktm_name": values[14],
            "measure_type_code": measure_type_code,
            "measure_type_label_bg":
                "Основна"
                if measure_type_code == "О"
                else "Допълваща"
                if measure_type_code == "Д"
                else measure_type_code,
            "measure_kind_code": measure_kind_code,
            "measure_kind_label_bg":
                "Административна"
                if measure_kind_code == "А"
                else "Инвестиционна"
                if measure_kind_code == "И"
                else measure_kind_code,
            "measure_code": measure_code,
            "measure_name": values[18],
            "action_code": values[19],
            "action_name": values[20],
            "action_description": values[21],
            "measure_origin": values[22],
            "environmental_contribution": values[23],
            "settlement": values[24],
            "municipality": values[25],
            "district": values[26],
            "responsible_authority": values[27],
            "partner_authority": values[28],
            "cost_bgn": values[29],
            "funding_source": values[30],
            "category": category,
            "category_label_bg": category_label,
            "supplementary_catalogue":
                additional_by_code.get(measure_code),
        }

        measures_by_code.setdefault(
            normalize_code(gwb_code),
            [],
        ).append(record)

    profiles: list[dict[str, Any]] = []

    for base in base_profiles:
        gwb_code = base["gwb_code"]
        code_key = normalize_code(gwb_code)

        measures = measures_by_code.get(
            code_key,
            [],
        )

        category_counts: dict[str, int] = {}

        for measure in measures:
            label = measure["category_label_bg"]
            category_counts[label] = (
                category_counts.get(label, 0) + 1
            )

        profiles.append({
            "gwb_code": gwb_code,
            "gwb_name": base.get("gwb_name"),
            "measure_count": len(measures),
            "has_individual_measures": bool(measures),
            "category_counts": category_counts,
            "measures": measures,
        })

    base_codes = {
        normalize_code(profile["gwb_code"])
        for profile in base_profiles
    }

    unknown_measure_codes = sorted(
        set(measures_by_code) - base_codes
    )

    bodies_with_measures = sum(
        1
        for profile in profiles
        if profile["has_individual_measures"]
    )

    bodies_without_measures = sum(
        1
        for profile in profiles
        if not profile["has_individual_measures"]
    )

    total_measure_count = sum(
        profile["measure_count"]
        for profile in profiles
    )

    result = {
        "metadata": {
            "title":
                "BD IBR Section 7 groundwater measures",
            "generated_at":
                datetime.now(timezone.utc).isoformat(),
            "groundwater_body_count": len(profiles),
            "individual_groundwater_measure_count":
                total_measure_count,
            "groundwater_bodies_with_measures":
                bodies_with_measures,
            "groundwater_bodies_without_measures":
                bodies_without_measures,
            "basin_wide_measure_count":
                len(basin_rows),
            "supplementary_catalogue_count":
                len(additional_table),
            "source_files": [
                measures_path.name,
                supplementary_path.name,
            ],
        },
        "profiles": profiles,
        "quality_report": {
            "unknown_groundwater_codes":
                unknown_measure_codes,
            "groundwater_measure_rows":
                len(groundwater_rows),
            "linked_groundwater_measure_rows":
                total_measure_count,
        },
    }

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path.write_text(
        json.dumps(
            result,
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(
        json.dumps(
            result["metadata"],
            ensure_ascii=False,
            indent=2,
        )
    )

    print(
        json.dumps(
            result["quality_report"],
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()