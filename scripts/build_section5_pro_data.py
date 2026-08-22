from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd


def clean_value(value: Any) -> Any:
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, float) and value.is_integer():
        return int(value)

    if isinstance(value, str):
        value = value.strip()
        return value or None

    return value


def normalize_code(value: Any) -> str:
    text = str(clean_value(value) or "").upper()
    return re.sub(r"[^A-Z0-9]", "", text)


def groundwater_code_from_drinking_zone(value: Any) -> str:
    text = str(clean_value(value) or "").upper()
    text = text.replace("BG3DGW", "BG3G", 1)
    return normalize_code(text)


def find_exactly_one(
    source_root: Path,
    pattern: str,
) -> Path:
    matches = sorted(
        path
        for path in source_root.rglob(pattern)
        if path.is_file()
    )

    if len(matches) != 1:
        raise RuntimeError(
            f"{pattern}: found {len(matches)}, expected 1"
        )

    return matches[0]


def row_values(row: pd.Series) -> list[Any]:
    return [clean_value(value) for value in row.tolist()]


def classify_goal(
    chemical_status: Any,
    exception_text: Any,
    target_year: Any,
) -> str:
    status = str(chemical_status or "").lower()
    exception = str(exception_text or "").lower()
    year = str(target_year or "").lower()

    if "постигната цел" in exception:
        return "goal_achieved"

    if "4(5)" in exception or "по-малко строга" in exception:
        return "less_strict_goal"

    if "4(4)" in exception or "след 2027" in year:
        return "extended_after_2027"

    if status == "добро":
        return "maintain_good_status"

    return "other"


def goal_label_bg(category: str) -> str:
    labels = {
        "goal_achieved":
            "Целта е постигната",
        "less_strict_goal":
            "Определена е по-малко строга цел",
        "extended_after_2027":
            "Срокът за постигане на целта е след 2027 г.",
        "maintain_good_status":
            "Целта е запазване на доброто състояние",
        "other":
            "Налична е официална екологична цел",
    }

    return labels[category]


def build_profiles(source_root: Path) -> dict[str, Any]:
    objectives_path = find_exactly_one(
        source_root,
        "*5.2.1.1*Objectives_GWB_updated.xlsx",
    )

    exceptions_path = find_exactly_one(
        source_root,
        "*5.2.2.1.1*Exepmtions_GWB_updated.xlsx",
    )

    drinking_path = find_exactly_one(
        source_root,
        "*5.3.1.2*.xlsx",
    )

    objectives = pd.read_excel(
        objectives_path,
        sheet_name=0,
    )

    exceptions = pd.read_excel(
        exceptions_path,
        sheet_name=0,
    )

    drinking = pd.read_excel(
        drinking_path,
        sheet_name=0,
    )

    if len(objectives) != 41:
        raise RuntimeError(
            f"Objectives rows: {len(objectives)}, expected 41"
        )

    if len(exceptions) != 10:
        raise RuntimeError(
            f"Exceptions rows: {len(exceptions)}, expected 10"
        )

    if len(drinking) != 41:
        raise RuntimeError(
            f"Drinking rows: {len(drinking)}, expected 41"
        )

    exception_by_code: dict[str, list[Any]] = {}

    for _, row in exceptions.iterrows():
        values = row_values(row)
        code_key = normalize_code(values[0])

        if not code_key:
            continue

        if code_key in exception_by_code:
            raise RuntimeError(
                f"Duplicate exception code: {values[0]}"
            )

        exception_by_code[code_key] = values

    drinking_by_code: dict[str, list[Any]] = {}

    for _, row in drinking.iterrows():
        values = row_values(row)
        code_key = groundwater_code_from_drinking_zone(
            values[0]
        )

        if not code_key:
            continue

        if code_key in drinking_by_code:
            raise RuntimeError(
                f"Duplicate drinking-zone code: {values[0]}"
            )

        drinking_by_code[code_key] = values

    profiles: list[dict[str, Any]] = []
    objective_code_keys: set[str] = set()

    for _, row in objectives.iterrows():
        values = row_values(row)

        gwb_code = values[0]
        gwb_name = values[1]
        code_key = normalize_code(gwb_code)

        if not code_key:
            raise RuntimeError(
                "Objective row without groundwater-body code"
            )

        if code_key in objective_code_keys:
            raise RuntimeError(
                f"Duplicate objective code: {gwb_code}"
            )

        objective_code_keys.add(code_key)

        exception_values = exception_by_code.get(code_key)
        drinking_values = drinking_by_code.get(code_key)

        purb2 = {
            "chemical_status": values[2],
            "objective": values[3],
            "target_year": values[4],
            "exception": values[5],
        }

        purb3 = {
            "chemical_status": values[6],
            "parameters_outside_standard": values[7],
            "objective": values[8],
            "target_year": values[9],
            "exception": values[10],
        }

        category = classify_goal(
            purb3["chemical_status"],
            purb3["exception"],
            purb3["target_year"],
        )

        exception_detail = None

        if exception_values is not None:
            exception_detail = {
                "chemical_status": exception_values[2],
                "parameters_outside_standard":
                    exception_values[3],
                "objective": exception_values[4],
                "legal_basis": exception_values[5],
                "target_year_or_type": exception_values[6],
                "justification": exception_values[7],
            }

        drinking_water_objective = None

        if drinking_values is not None:
            drinking_water_objective = {
                "zone_code": drinking_values[0],
                "zone_name": drinking_values[1],
                "objective": drinking_values[2],
            }

        profiles.append({
            "gwb_code": gwb_code,
            "gwb_name": gwb_name,
            "goal_category": category,
            "goal_label_bg": goal_label_bg(category),
            "purb2": purb2,
            "purb3": purb3,
            "exception_detail": exception_detail,
            "drinking_water_objective":
                drinking_water_objective,
        })

    unmatched_exception_codes = sorted(
        set(exception_by_code) - objective_code_keys
    )

    unmatched_drinking_codes = sorted(
        set(drinking_by_code) - objective_code_keys
    )

    missing_exception_details = sorted(
        profile["gwb_code"]
        for profile in profiles
        if (
            profile["goal_category"]
            in {
                "extended_after_2027",
                "less_strict_goal",
            }
            and profile["exception_detail"] is None
        )
    )

    missing_drinking_objectives = sorted(
        profile["gwb_code"]
        for profile in profiles
        if profile["drinking_water_objective"] is None
    )

    category_counts: dict[str, int] = {}

    for profile in profiles:
        category = profile["goal_category"]
        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

    purb3_good_count = sum(
        1
        for profile in profiles
        if str(
            profile["purb3"]["chemical_status"]
        ).lower() == "добро"
    )

    purb3_bad_count = sum(
        1
        for profile in profiles
        if str(
            profile["purb3"]["chemical_status"]
        ).lower() == "лошо"
    )

    return {
        "metadata": {
            "title":
                "BD IBR Section 5 environmental objectives",
            "generated_at":
                datetime.now(timezone.utc).isoformat(),
            "scope":
                "East Aegean River Basin District, RBMP 2022-2027",
            "groundwater_body_count": len(profiles),
            "exception_record_count": len(exceptions),
            "drinking_objective_count": len(drinking),
            "purb3_good_status_count": purb3_good_count,
            "purb3_bad_status_count": purb3_bad_count,
            "goal_category_counts": category_counts,
            "source_files": [
                objectives_path.name,
                exceptions_path.name,
                drinking_path.name,
            ],
        },
        "profiles": profiles,
        "quality_report": {
            "unmatched_exception_codes":
                unmatched_exception_codes,
            "unmatched_drinking_codes":
                unmatched_drinking_codes,
            "missing_exception_details":
                missing_exception_details,
            "missing_drinking_objectives":
                missing_drinking_objectives,
        },
    }


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "Usage: build_section5_pro_data.py "
            "<source-directory> <output-json>"
        )

    source_root = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()

    if not source_root.is_dir():
        raise RuntimeError(
            f"Source directory does not exist: {source_root}"
        )

    result = build_profiles(source_root)

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