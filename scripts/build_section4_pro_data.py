from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


def clean(value):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    if isinstance(value, str):
        value = value.strip()
        return None if value in {"", "-", "—", "nan"} else value
    if hasattr(value, "item"):
        value = value.item()
    return value


def number(value):
    value = clean(value)
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(" ", "").replace(",", "."))
    except ValueError:
        return None


def code(value):
    value = clean(value)
    return re.sub(r"\s+", "", str(value)).upper() if value else None


def canonical_code(value, known_codes):
    raw = code(value)
    if not raw:
        return None
    if raw in known_codes:
        return raw
    suffix = re.search(r"(\d{3})$", raw)
    if not suffix:
        return None
    candidates = [c for c in known_codes if c.endswith(suffix.group(1))]
    return candidates[0] if len(candidates) == 1 else None


def find_one(root: Path, pattern: str) -> Path:
    matches = list(root.rglob(pattern))
    if len(matches) != 1:
        raise RuntimeError(f"{pattern}: found {len(matches)}, expected 1")
    return matches[0]


def read_raw(path: Path, sheet=0):
    return pd.read_excel(path, sheet_name=sheet, header=None)


def parse_chemical(path: Path):
    df = read_raw(path)
    headers = [clean(x) for x in df.iloc[0].tolist()]
    result = {}
    for _, row in df.iloc[1:].iterrows():
        c = code(row.iloc[0])
        if not c:
            continue
        result[c] = {
            "code": c,
            "name": clean(row.iloc[1]),
            "tests": {
                "general": clean(row.iloc[2]),
                "saline_or_polluted_intrusion": clean(row.iloc[3]),
                "surface_water_impact": clean(row.iloc[4]),
                "groundwater_dependent_ecosystems": clean(row.iloc[5]),
                "drinking_water_deterioration": clean(row.iloc[6]),
            },
            "upward_trend": clean(row.iloc[7]),
            "chemical_status": clean(row.iloc[8]),
            "pollutants": clean(row.iloc[9]),
        }
    return result


def parse_comparison(path: Path):
    df = read_raw(path)
    result = {}
    for _, row in df.iloc[2:].iterrows():
        c = code(row.iloc[1])
        if not c:
            continue
        result[c] = {
            "risk_2016_2021": clean(row.iloc[3]),
            "status_2016_2021": clean(row.iloc[4]),
            "risk_2022_2027": clean(row.iloc[5]),
            "status_2022_2027": clean(row.iloc[6]),
        }
    return result


def parse_balance(path: Path):
    df = read_raw(path)
    result = {}
    for _, row in df.iloc[4:].iterrows():
        c = code(row.iloc[0])
        if not c:
            continue
        result[c] = {
            "available_resource_l_s": number(row.iloc[2]),
            "available_resource_m3_y": number(row.iloc[3]),
            "abstraction_by_directorates_m3_y": number(row.iloc[4]),
            "citizen_self_supply_m3_y": number(row.iloc[5]),
            "total_abstraction_m3_y": number(row.iloc[6]),
            "quantitative_status": clean(row.iloc[7]),
            "exploitation_index": number(row.iloc[8]),
        }
    return result


def parse_abstraction(path: Path):
    df = read_raw(path, "ЧВК,л")
    result = {}
    keys = [
        "public_water_supply_l_s", "agriculture_l_s", "industry_l_s",
        "other_l_s", "aquaculture_l_s", "household_self_supply_l_s",
        "tourism_recreation_l_s", "total_l_s", "available_resource_l_s",
        "exploitation_index",
    ]
    for _, row in df.iloc[7:].iterrows():
        c = code(row.iloc[0])
        if not c:
            continue
        result[c] = {k: number(row.iloc[i + 2]) for i, k in enumerate(keys)}
    return result


def parse_thresholds(path: Path, known_codes):
    result = defaultdict(dict)
    for sheet in ["Drugi GWB_ORIGINAL", "7-11-28-34-48"]:
        df = read_raw(path, sheet)
        codes = df.iloc[1].tolist()
        for col, raw_code in enumerate(codes):
            c = canonical_code(raw_code, known_codes)
            if not c or col + 2 >= df.shape[1]:
                continue
            for _, row in df.iloc[2:].iterrows():
                indicator = clean(row.iloc[0])
                if not indicator:
                    continue
                result[c][str(indicator)] = {
                    "unit": clean(row.iloc[1]),
                    "quality_standard": number(row.iloc[2]),
                    "background_value": number(row.iloc[col]),
                    "threshold_value": number(row.iloc[col + 1]),
                    "baseline_value": number(row.iloc[col + 2]),
                }
    return {c: list(values.values()) if False else [
        {"indicator": indicator, **details}
        for indicator, details in values.items()
    ] for c, values in result.items()}


def trend_indicator(header):
    text = str(clean(header) or "")
    if "NO3" in text: return "NO3"
    if "SO4" in text: return "SO4"
    if "NH4" in text: return "NH4"
    if "PO4" in text: return "PO4"
    if re.search(r"\bFe\b", text, re.I): return "Fe"
    if re.search(r"\bMn\b", text, re.I): return "Mn"
    if "алфа" in text.lower(): return "total_alpha_activity"
    if "тетра" in text.lower(): return "tetrachloroethylene"
    return text


def parse_trends(folder: Path, known_codes):
    series = []
    anomalies = []
    for path in sorted(folder.glob("*.xlsx")):
        suffix = re.search(r"GWB_(\d+)", path.name, re.I)
        expected = None
        if suffix:
            candidates = [c for c in known_codes if c.endswith(suffix.group(1))]
            if len(candidates) == 1:
                expected = candidates[0]
        workbook = pd.ExcelFile(path)
        for sheet in workbook.sheet_names:
            df = read_raw(path, sheet)
            if df.shape[1] < 6 or df.empty:
                continue
            headers = [str(clean(x) or "") for x in df.iloc[0].tolist()]
            station_code_col = next((i for i, x in enumerate(headers) if "Код на пункт" in x), None)
            station_name_col = next((i for i, x in enumerate(headers) if "Име на пункт" in x), None)
            gwb_col = next((i for i, x in enumerate(headers) if "Код на ПВТ" in x), None)
            year_col = next((i for i, x in enumerate(headers) if x.strip() == "Година"), None)
            value_col = next((i for i, x in enumerate(headers) if "Средногодишно" in x), None)
            if None in {station_code_col, station_name_col, gwb_col, year_col, value_col}:
                continue
            rows = []
            source_codes = []
            for _, row in df.iloc[1:].iterrows():
                year = number(row.iloc[year_col])
                value = number(row.iloc[value_col])
                if year is None or value is None:
                    continue
                source_code = code(row.iloc[gwb_col])
                if source_code:
                    source_codes.append(source_code)
                rows.append({"year": int(year), "value": value})
            if not rows:
                continue
            dominant = Counter(source_codes).most_common(1)[0][0] if source_codes else None
            assigned = expected or dominant
            unique_source_codes = sorted(set(source_codes))
            if len(unique_source_codes) > 1 or (expected and dominant and expected != dominant):
                anomalies.append({
                    "file": path.name, "sheet": sheet,
                    "expected_code": expected, "source_codes": unique_source_codes,
                })
            first = df.iloc[1]
            series.append({
                "gwb_code": assigned,
                "station_code": clean(first.iloc[station_code_col]),
                "station_name": clean(first.iloc[station_name_col]),
                "indicator": trend_indicator(df.iloc[0, value_col]),
                "value_header": clean(df.iloc[0, value_col]),
                "points": rows,
                "source_file": path.name,
                "source_sheet": sheet,
            })
    return series, anomalies


def zone_to_gwb(zone_code, known_codes):
    z = code(zone_code)
    if not z:
        return None
    return canonical_code(z, known_codes)


def parse_drinking(path: Path, known_codes):
    df = read_raw(path, "Ozenka_him. s-nie_DGW")
    top = df.iloc[0].tolist()
    current = None
    groups = {}
    for col in range(3, df.shape[1]):
        if clean(top[col]):
            current = str(clean(top[col])).replace("Замърсяващо вещество -", "").strip()
        groups[col] = current
    records = []
    unmatched = []
    for _, row in df.iloc[2:].iterrows():
        station_code = clean(row.iloc[1])
        if not station_code:
            continue
        gwb = zone_to_gwb(row.iloc[0], known_codes)
        if not gwb:
            unmatched.append(clean(row.iloc[0]))
        indicators = []
        for col in range(3, df.shape[1], 4):
            value = number(row.iloc[col])
            standard = number(row.iloc[col + 1]) if col + 1 < df.shape[1] else None
            baseline = number(row.iloc[col + 2]) if col + 2 < df.shape[1] else None
            threshold = number(row.iloc[col + 3]) if col + 3 < df.shape[1] else None
            if all(v is None for v in [value, standard, baseline, threshold]):
                continue
            indicators.append({
                "indicator": groups.get(col), "mean_value": value,
                "quality_standard": standard, "baseline_value": baseline,
                "threshold_value": threshold,
                "exceeds_standard": bool(value is not None and standard is not None and value > standard),
            })
        records.append({
            "gwb_code": gwb, "drinking_zone_code": clean(row.iloc[0]),
            "station_code": station_code, "station_name": clean(row.iloc[2]),
            "indicators": indicators,
        })
    return records, sorted(set(x for x in unmatched if x))


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generator.py SOURCE_DIR OUTPUT_JSON")
    root = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2]).resolve()
    chemical = parse_chemical(find_one(root, "*Obshta_ocenka_him_status_GW.xls"))
    known = set(chemical)
    comparison = parse_comparison(find_one(root, "*Sravnenie_Ocenki_Status*.xlsx"))
    balance = parse_balance(find_one(root, "*Test voden balans*.xlsx"))
    abstraction = parse_abstraction(find_one(root, "*Ocenka vodovzemane GW*.xlsx"))
    thresholds = parse_thresholds(find_one(root, "*Fonovi_pragovi_stoynosti_bazovi_niva_GW.xls"), known)
    trend_folder = find_one(root, "*\u0413\u0440\u0430\u0444\u0438\u043a\u0438 \u0442\u0435\u043d\u0434\u0435\u043d\u0446\u0438\u0438")
    trends, trend_anomalies = parse_trends(trend_folder, known)
    drinking, unmatched_zones = parse_drinking(find_one(root, "*Ocenka_him status_DGW.xlsx"), known)
    profiles = []
    for c in sorted(known):
        profiles.append({
            **chemical[c],
            "comparison": comparison.get(c),
            "water_balance": balance.get(c),
            "abstraction_by_use": abstraction.get(c),
            "thresholds": thresholds.get(c, []),
            "trend_series": [s for s in trends if s["gwb_code"] == c],
            "drinking_monitoring": [r for r in drinking if r["gwb_code"] == c],
        })
    payload = {
        "metadata": {
            "title": "BD IBR Section 4 PRO profiles",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "groundwater_body_count": len(profiles),
            "threshold_record_count": sum(len(p["thresholds"]) for p in profiles),
            "trend_series_count": len(trends),
            "drinking_monitoring_count": len(drinking),
            "scope": "East Aegean River Basin District, RBMP 2022-2027",
        },
        "profiles": profiles,
        "quality_report": {
            "missing_comparison": sorted(known - set(comparison)),
            "missing_balance": sorted(known - set(balance)),
            "missing_abstraction": sorted(known - set(abstraction)),
            "missing_thresholds": sorted(known - set(thresholds)),
            "trend_anomalies": trend_anomalies,
            "unmatched_drinking_zone_codes": unmatched_zones,
        },
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["metadata"], ensure_ascii=False, indent=2))
    print(json.dumps(payload["quality_report"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
