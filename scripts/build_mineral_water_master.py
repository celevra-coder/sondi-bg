from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

CURRENT = ROOT / "public/geology-map/data/official_water_facilities.geojson"
RESEARCH = ROOT / "data/mineral-water/research/mh_mineral_gap_candidates.json"

MASTER = ROOT / "data/mineral-water/mineral_water_master.json"
FREE = ROOT / "public/geology-map/data/mineral_water_free.geojson"
REPORT = ROOT / "data/mineral-water/mineral_water_build_report.json"


def load(path: Path):
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)


def dump(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def text(v: Any) -> str:
    if v is None:
        return ""
    return str(v).strip()


def first_field(obj: dict, names: list[str]):
    if not isinstance(obj, dict):
        return None

    for name in names:
        if name in obj and text(obj.get(name)):
            return obj.get(name)

    return None


def norm(v: Any) -> str:
    s = text(v).lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))

    for ch in ['â„–','"',"'",'â€ž','â€œ','â€','-','_','/','\\']:
        s = s.replace(ch, " ")

    s = re.sub(r"\bÑÐ¾Ð½Ð´Ð°Ð¶\b", " ", s)
    s = re.sub(r"\bsondazh\b", " ", s)
    s = re.sub(r"\bÐºÐ°Ð¿Ñ‚Ð¸Ñ€Ð°Ð½\b", " ", s)
    s = re.sub(r"\bÐµÑÑ‚ÐµÑÑ‚Ð²ÐµÐ½\b", " ", s)

    s = re.sub(r"[^0-9a-zÐ°-Ñ]+", " ", s, flags=re.I)
    return " ".join(s.split())


def stable_id(seed: str) -> str:
    return "mw_" + hashlib.sha1(
        seed.encode("utf-8")
    ).hexdigest()[:16]


def number(v):
    if v is None or isinstance(v, bool):
        return None

    if isinstance(v, (int, float)):
        return v

    s = text(v).replace(",", ".")
    m = re.search(r"-?\d+(?:\.\d+)?", s)

    if not m:
        return None

    n = float(m.group(0))
    return int(n) if n.is_integer() else n


def valid_bg(lat, lon):
    try:
        lat = float(lat)
        lon = float(lon)
    except Exception:
        return False

    return 40.5 <= lat <= 44.7 and 21.5 <= lon <= 29.8


def classify_facility(name: str, raw_type: str = "") -> str:
    s = f"{name} {raw_type}".casefold()

    # Monitoring / observation boreholes
    if (
        "\u043c\u043e\u043d\u0438\u0442\u043e\u0440" in s
        or "\u043d\u0430\u0431\u043b\u044e\u0434" in s
    ):
        return "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043d\u0433\u043e\u0432 \u0441\u043e\u043d\u0434\u0430\u0436"

    # Closed / liquidated / conserved facilities
    if (
        "\u043b\u0438\u043a\u0432\u0438\u0434" in s
        or "\u0437\u0430\u043a\u0440\u0438\u0442" in s
        or "\u043a\u043e\u043d\u0441\u0435\u0440\u0432" in s
    ):
        return "\u0417\u0430\u043a\u0440\u0438\u0442\u043e \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"

    # Drainage galleries / drainage facilities
    if (
        "\u0433\u0430\u043b\u0435\u0440" in s
        or "\u0434\u0440\u0435\u043d\u0430\u0436" in s
    ):
        return "\u0414\u0440\u0435\u043d\u0430\u0436\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"

    # Captured / natural springs
    if (
        "\u0438\u0437\u0432\u043e\u0440" in s
        or "\u043a\u0435\u0438" in s
        or "\u043a\u0430\u043f\u0442\u0430\u0436" in s
        or "\u043a\u0430\u043f\u0442\u0438\u0440\u0430\u043d" in s
    ):
        return "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u043a\u0430\u043f\u0442\u0430\u0436/\u0438\u0437\u0432\u043e\u0440"

    # Boreholes / wells
    if (
        "\u0441\u043e\u043d\u0434\u0430\u0436" in s
        or "\u0441\u043a\u0432\u0430\u0436" in s
        or "\u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0435\u043d" in s
    ):
        return "\u041c\u0438\u043d\u0435\u0440\u0430\u043b\u0435\u043d \u0432\u043e\u0434\u043e\u0432\u0437\u0435\u043c\u0435\u043d \u0441\u043e\u043d\u0434\u0430\u0436"

    return "\u0414\u0440\u0443\u0433\u043e \u043c\u0438\u043d\u0435\u0440\u0430\u043b\u043d\u043e \u0441\u044a\u043e\u0440\u044a\u0436\u0435\u043d\u0438\u0435"


def canonical_temperature(e: dict, fallback=None):
    return number(
        first_field(
            e,
            [
                "sample_temperature_c",
                "technical_temperature_c",
                "documented_facility_temperature_c",
                "exploitation_resource_temperature_c",
                "composite_technical_temperature_c",
                "source_document_sample_temperature_c",
                "source_document_technical_temperature_c",
                "temperature_c",
            ],
        )
        or fallback
    )


def canonical_depth(e: dict, fallback=None):
    return number(
        first_field(
            e,
            [
                "depth_m",
                "capture_shaft_depth_m",
                "capture_drain_depth_m",
                "source_document_depth_m",
            ],
        )
        or fallback
    )


def coordinate_status_allows_mapping(status: str) -> bool:
    s = text(status).upper()

    if not s:
        return False

    if "TO_RESOLVE" in s or "TO_RESEARCH" in s:
        return False

    if "EXACT" in s or "RESOLVED" in s:
        return True

    return s in {
        "OFFICIAL",
        "OFFICIAL_COORDINATES",
        "CADASTRAL",
        "CADASTRAL_EXACT",
    }


def extract_coordinates(e: dict):
    status = text(e.get("coordinate_status"))

    if not coordinate_status_allows_mapping(status):
        return None

    pairs = [
        ("latitude", "longitude"),
        ("lat", "lon"),
        ("lat", "lng"),
        ("official_latitude", "official_longitude"),
        ("official_lat", "official_lon"),
        ("latitude_wgs84", "longitude_wgs84"),
        ("wgs84_lat", "wgs84_lon"),
        ("lat_wgs84", "lon_wgs84"),
        ("coordinate_lat", "coordinate_lon"),
        ("coordinate_latitude", "coordinate_longitude"),
        ("resolved_latitude", "resolved_longitude"),
        ("resolved_lat", "resolved_lon"),
    ]

    for lat_key, lon_key in pairs:
        lat = number(e.get(lat_key))
        lon = number(e.get(lon_key))

        if lat is not None and lon is not None and valid_bg(lat, lon):
            return {
                "lat": float(lat),
                "lon": float(lon),
                "status": status,
                "method": f"{lat_key}+{lon_key}",
            }

    return None


def research_name(row: dict, e: dict):
    return text(
        first_field(
            e,
            [
                "official_facility_name",
                "identity_verified_name",
            ],
        )
        or row.get("mh_facility")
    )


def research_deposit(row: dict, e: dict):
    return text(
        first_field(
            e,
            [
                "current_deposit_name",
                "official_deposit_name",
                "deposit_name",
                "deposit",
            ],
        )
        or row.get("mh_deposit")
    )


def research_settlement(row: dict, e: dict):
    return text(
        first_field(
            e,
            [
                "settlement",
                "settlement_name",
                "locality",
                "locality_name",
                "town",
                "village",
                "city",
            ],
        )
        or row.get("mh_settlement")
        or row.get("settlement")
    )


def clean_research_row(row: dict):
    """
    Keep useful MH/research information but NEVER propagate old
    fuzzy current_* matches into the canonical master.
    """
    out = {}

    for k, v in row.items():
        if k == "research_enrichment":
            continue

        if k.startswith("current_"):
            continue

        if k in {"score", "reason"}:
            continue

        out[k] = v

    return out


def document_sources(row: dict):
    result = []

    docs = row.get("mh_documents")

    if isinstance(docs, dict):
        docs = [docs]

    if isinstance(docs, list):
        for d in docs:
            if not isinstance(d, dict):
                continue

            result.append(
                {
                    "source_type": d.get("source_type"),
                    "title": d.get("title"),
                    "description": d.get("description"),
                    "published": d.get("published"),
                    "source_url": d.get("source_url"),
                }
            )

    e = row.get("research_enrichment") or {}

    if e.get("verified_source") or e.get("verified_source_url"):
        result.append(
            {
                "source_type": "verified_research",
                "title": e.get("verified_source"),
                "source_url": e.get("verified_source_url"),
                "assessment_no": e.get(
                    "mh_balneological_assessment_no"
                ),
                "assessment_date": e.get(
                    "mh_balneological_assessment_date"
                ),
            }
        )

    return result


def property_values(props: dict):
    values = set()

    for k, v in props.items():
        kl = k.lower()

        if (
            "property" not in kl
            and "cadas" not in kl
            and "parcel" not in kl
        ):
            continue

        if isinstance(v, (str, int, float)):
            if text(v):
                values.add(text(v))

    return values


current = load(CURRENT)
research = load(RESEARCH)

current_features = current.get("features", [])
rows = research.get("missing_candidates", [])

research_counts = Counter(
    text(r.get("research_status")) or "(BLANK)"
    for r in rows
)

# ============================================================
# EXACT BATCH-ROW INDEX
# ============================================================

batch_row_to_global_index = {}
batch_counter = defaultdict(int)

for global_index, row in enumerate(rows):
    batch = text(row.get("research_batch"))

    if not batch:
        continue

    batch_counter[batch] += 1
    batch_row_to_global_index[
        (batch, batch_counter[batch])
    ] = global_index


# ============================================================
# EXISTING MAP RECORDS
# ============================================================

master_records = []
id_seen = set()

current_property_index = defaultdict(list)
current_facility_index = defaultdict(list)
current_feature_index = {}

for index, feature in enumerate(current_features):
    geometry = feature.get("geometry") or {}

    if geometry.get("type") != "Point":
        continue

    coords = geometry.get("coordinates") or []

    if not isinstance(coords, list) or len(coords) < 2:
        continue

    lon = number(coords[0])
    lat = number(coords[1])

    if lon is None or lat is None or not valid_bg(lat, lon):
        continue

    p = feature.get("properties") or {}

    name = text(p.get("facility"))
    deposit = text(p.get("deposit"))
    settlement = text(p.get("settlement"))
    registry = text(p.get("registry_number"))

    seed = (
        f"current|{registry}"
        if registry
        else
        f"current|{norm(deposit)}|{norm(name)}|{norm(settlement)}"
    )

    mid = stable_id(seed)

    if mid in id_seen:
        mid = stable_id(f"{seed}|{index}")

    id_seen.add(mid)

    record = {
        "mineral_id": mid,
        "identity": {
            "name": name,
            "facility_type": classify_facility(
                name,
                text(p.get("display_category"))
                or text(p.get("facility_type")),
            ),
            "deposit": deposit,
            "settlement": settlement,
        },
        "location": {
            "lat": float(lat),
            "lon": float(lon),
            "status": (
                text(p.get("coordinate_accuracy"))
                or "EXISTING_MAP"
            ),
            "origin": "official_water_facilities.geojson",
        },
        "free": {
            "temperature_c": number(p.get("temperature_c")),
            "depth_m": number(p.get("depth_m")),
        },
        "pro": {
            "existing_properties": p,
            "research_enrichment": [],
            "duplicate_mh_records": [],
            "matched_existing_records": [],
        },
        "sources": document_sources({}) + [
            {
                "source_type": "existing_register",
                "title": p.get("source"),
                "source_url": p.get("source_url"),
                "published": p.get("source_date"),
                "registry_number": p.get("registry_number"),
            }
        ],
        "origin": "existing_map",
    }

    master_records.append(record)
    current_feature_index[index] = record

    current_facility_index[norm(name)].append(record)

    for pid in property_values(p):
        current_property_index[pid].append(record)


# ============================================================
# MATCHED_EXISTING -> ATTACH RESEARCH TO CURRENT FACILITY
# ============================================================

canonical_master_by_global_index = {}

matched_existing_total = 0
matched_existing_attached = 0
matched_existing_unlinked = []

for global_index, row in enumerate(rows):
    if text(row.get("research_status")) != "MATCHED_EXISTING":
        continue

    matched_existing_total += 1

    e = row.get("research_enrichment") or {}

    try:
        feature_index = int(e.get("existing_feature_index"))
    except Exception:
        feature_index = None

    target = current_feature_index.get(feature_index)

    if target is None:
        matched_existing_unlinked.append({
            "mh_facility": row.get("mh_facility"),
            "mh_deposit": row.get("mh_deposit"),
            "existing_feature_index": feature_index,
        })
        continue

    record_copy = clean_research_row(row)
    record_copy["research_enrichment"] = e

    target["pro"]["matched_existing_records"].append(
        record_copy
    )

    target["sources"].extend(
        document_sources(row)
    )

    # Enrich FREE only if current official record lacks value.
    if target["free"].get("temperature_c") is None:
        t = canonical_temperature(e)
        if t is not None:
            target["free"]["temperature_c"] = t

    if target["free"].get("depth_m") is None:
        d = canonical_depth(e)
        if d is not None:
            target["free"]["depth_m"] = d

    if not text(target["identity"].get("settlement")):
        s = (
            text(e.get("existing_settlement"))
            or research_settlement(row, e)
        )

        if s:
            target["identity"]["settlement"] = s

    matched_existing_attached += 1
    canonical_master_by_global_index[global_index] = target


if matched_existing_unlinked:
    raise RuntimeError(
        "Unlinked MATCHED_EXISTING records remain: "
        + json.dumps(
            matched_existing_unlinked,
            ensure_ascii=False,
        )
    )


# ============================================================
# CONFIRMED_MISSING -> NEW CANONICAL RECORDS
# ============================================================

confirmed_master_by_global_index = {}

new_mappable = 0
new_unmappable = 0

for global_index, row in enumerate(rows):
    if text(row.get("research_status")) != "CONFIRMED_MISSING":
        continue

    e = row.get("research_enrichment") or {}

    name = research_name(row, e)
    deposit = research_deposit(row, e)
    settlement = research_settlement(row, e)

    assessment = text(
        e.get("mh_balneological_assessment_no")
        or row.get("mh_balneological_assessment_no")
    )

    seed = (
        f"mh|{assessment}|{norm(deposit)}|{norm(name)}"
        if assessment
        else
        f"mh|{norm(deposit)}|{norm(name)}|{global_index}"
    )

    mid = stable_id(seed)

    if mid in id_seen:
        mid = stable_id(f"{seed}|{global_index}")

    id_seen.add(mid)

    coord = extract_coordinates(e)

    if coord:
        new_mappable += 1

        location = {
            "lat": coord["lat"],
            "lon": coord["lon"],
            "status": coord["status"],
            "origin": coord["method"],
        }

    else:
        new_unmappable += 1

        location = {
            "lat": None,
            "lon": None,
            "status": text(e.get("coordinate_status")),
            "origin": None,
        }

    record = {
        "mineral_id": mid,
        "identity": {
            "name": name,
            "facility_type": classify_facility(name),
            "deposit": deposit,
            "settlement": settlement,
        },
        "location": location,
        "free": {
            "temperature_c": canonical_temperature(e),
            "depth_m": canonical_depth(e),
        },
        "pro": {
            "research_status": "CONFIRMED_MISSING",
            "research_enrichment": e,
            "research_source_record": clean_research_row(row),
            "duplicate_mh_records": [],
        },
        "sources": document_sources(row),
        "origin": "mh_confirmed_missing",
    }

    master_records.append(record)
    confirmed_master_by_global_index[global_index] = record
    canonical_master_by_global_index[global_index] = record


# ============================================================
# DUPLICATE_MH EXPLICIT LINKS
# ============================================================

# These three links were explicitly established by the audited
# previous-research references. No fuzzy matching is used.
previous_research_targets = {
    ("7", norm('Сондаж № Р-113')): ("5", 3),
    ("9", norm('сондаж № 5 "Сярна баня')): ("8", 8),
    ("9", norm('Каптиран естествен извор "Трънска Банкя')): (
        "1",
        1,
    ),
}

duplicate_total = 0
duplicate_attached_confirmed = 0
duplicate_attached_existing = 0
duplicate_unlinked = []

settlements_filled_from_duplicate = 0
deposits_filled_from_duplicate = 0


def attach_duplicate(target, row, link_type):
    global settlements_filled_from_duplicate
    global deposits_filled_from_duplicate

    e = row.get("research_enrichment") or {}

    sanitized = clean_research_row(row)

    sanitized["canonical_link_type"] = link_type

    if e:
        sanitized["research_enrichment"] = e

    target["pro"]["duplicate_mh_records"].append(sanitized)
    target["sources"].extend(document_sources(row))

    dup_settlement = text(row.get("mh_settlement"))
    dup_deposit = text(row.get("mh_deposit"))

    if (
        not text(target["identity"].get("settlement"))
        and dup_settlement
    ):
        target["identity"]["settlement"] = dup_settlement
        settlements_filled_from_duplicate += 1

    if (
        not text(target["identity"].get("deposit"))
        and dup_deposit
    ):
        target["identity"]["deposit"] = dup_deposit
        deposits_filled_from_duplicate += 1

    # Only fill FREE values when the canonical record currently
    # lacks them. Never overwrite an existing value.
    if target["free"].get("temperature_c") is None:
        t = canonical_temperature(e)
        if t is not None:
            target["free"]["temperature_c"] = t

    if target["free"].get("depth_m") is None:
        d = canonical_depth(e)
        if d is not None:
            target["free"]["depth_m"] = d


for global_index, row in enumerate(rows):
    if text(row.get("research_status")) != "DUPLICATE_MH":
        continue

    duplicate_total += 1

    batch = text(row.get("research_batch"))
    raw_name = text(row.get("mh_facility"))
    e = row.get("research_enrichment") or {}

    target = None
    link_type = None

    # --------------------------------------------------------
    # SPECIAL S-5Bh -> EXISTING S-2Bh
    # --------------------------------------------------------

    if (
        e.get("identity_resolution_status")
        == "SOURCE_REGISTRY_LABEL_MISMATCH_RESOLVED_TO_EXISTING_FACILITY"
    ):
        property_id = text(e.get("resolved_property_id"))
        resolved_name = text(e.get("resolved_facility_name"))

        matches = []

        # 1. Normal indexed cadastral-property lookup
        if property_id:
            matches = current_property_index.get(
                property_id,
                [],
            )

        # 2. Strict deep property lookup.
        # Some legacy current-map records store the cadastral
        # identifier in a field not covered by the old index.
        if len(matches) != 1 and property_id:
            deep_property_matches = [
                r
                for r in master_records
                if (
                    r["origin"] == "existing_map"
                    and property_id
                    in json.dumps(
                        r["pro"].get(
                            "existing_properties",
                            {},
                        ),
                        ensure_ascii=False,
                    )
                )
            ]

            if len(deep_property_matches) == 1:
                matches = deep_property_matches

        # 3. Exact normalized facility-name lookup
        if len(matches) != 1 and resolved_name:
            matches = current_facility_index.get(
                norm(resolved_name),
                [],
            )

        # 4. Audited identity-resolution fallback.
        # Used only inside the already verified
        # SOURCE_REGISTRY_LABEL_MISMATCH case.
        if len(matches) != 1 and resolved_name:
            resolved_norm = norm(resolved_name)

            name_matches = []

            for r in master_records:
                if r["origin"] != "existing_map":
                    continue

                existing_norm = norm(
                    r["identity"].get("name")
                )

                if not existing_norm or not resolved_norm:
                    continue

                if (
                    existing_norm == resolved_norm
                    or existing_norm.startswith(
                        resolved_norm + " "
                    )
                    or resolved_norm.startswith(
                        existing_norm + " "
                    )
                ):
                    name_matches.append(r)

            if len(name_matches) == 1:
                matches = name_matches

        if len(matches) == 1:
            target = matches[0]
            link_type = "EXISTING_FACILITY_IDENTITY_RESOLUTION"

    # --------------------------------------------------------
    # SAME BATCH, EXPLICIT ROW
    # --------------------------------------------------------

    elif row.get("duplicate_of_batch_row") is not None:
        target_row = int(row["duplicate_of_batch_row"])

        target_global = batch_row_to_global_index.get(
            (batch, target_row)
        )

        if target_global is not None:
            candidate = canonical_master_by_global_index.get(
                target_global
            )

            if candidate is not None:
                target = candidate
                link_type = "EXPLICIT_SAME_BATCH_ROW"

    # --------------------------------------------------------
    # PREVIOUS RESEARCH â€” THREE EXPLICIT AUDITED LINKS
    # --------------------------------------------------------

    else:
        key = (batch, norm(raw_name))

        previous = previous_research_targets.get(key)

        if previous:
            target_global = batch_row_to_global_index.get(
                previous
            )

            if target_global is not None:
                candidate = canonical_master_by_global_index.get(
                    target_global
                )

                if candidate is not None:
                    target = candidate
                    link_type = "EXPLICIT_PREVIOUS_RESEARCH"

    # --------------------------------------------------------
    # ATTACH OR FAIL
    # --------------------------------------------------------

    if target is None:
        duplicate_unlinked.append(
            {
                "research_batch": batch,
                "mh_deposit": row.get("mh_deposit"),
                "mh_facility": row.get("mh_facility"),
                "duplicate_of_batch_row": row.get(
                    "duplicate_of_batch_row"
                ),
                "duplicate_of_previous_research": row.get(
                    "duplicate_of_previous_research"
                ),
                "identity_resolution_status": e.get(
                    "identity_resolution_status"
                ),
            }
        )

        continue

    attach_duplicate(target, row, link_type)

    if target["origin"] == "existing_map":
        duplicate_attached_existing += 1
    else:
        duplicate_attached_confirmed += 1


# ============================================================
# NON-POINT RESEARCH
# ============================================================

non_point_records = [
    clean_research_row(r)
    for r in rows
    if text(r.get("research_status"))
    not in {
        "CONFIRMED_MISSING",
        "DUPLICATE_MH",
        "MATCHED_EXISTING",
    }
]


# ============================================================
# FREE EXPORT â€” ONLY APPROVED FIELDS
# ============================================================

free_features = []

for r in master_records:
    loc = r["location"]

    if loc.get("lat") is None or loc.get("lon") is None:
        continue

    free_features.append(
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    loc["lon"],
                    loc["lat"],
                ],
            },
            "properties": {
                "mineral_id": r["mineral_id"],
                "name": r["identity"]["name"],
                "facility_type": r["identity"]["facility_type"],
                "settlement": r["identity"]["settlement"],
            },
        }
    )


# ============================================================
# QA
# ============================================================

allowed_free = {
    "mineral_id",
    "name",
    "facility_type",
    "settlement",
}

for feature in free_features:
    keys = set(feature["properties"].keys())

    if keys != allowed_free:
        raise RuntimeError(
            f"FREE privacy schema violation: {sorted(keys)}"
        )


free_missing = Counter()

for feature in free_features:
    p = feature["properties"]

    for key in [
        "name",
        "facility_type",
        "settlement",
    ]:
        if p.get(key) is None or text(p.get(key)) == "":
            free_missing[key] += 1


location_status = Counter()

for r in master_records:
    if r["origin"] == "mh_confirmed_missing":
        location_status[
            text(r["location"].get("status")) or "(BLANK)"
        ] += 1


existing_count = sum(
    1 for r in master_records
    if r["origin"] == "existing_map"
)

confirmed_count = sum(
    1 for r in master_records
    if r["origin"] == "mh_confirmed_missing"
)

total_attached = (
    duplicate_attached_confirmed
    + duplicate_attached_existing
)


report = {
    "baseline_existing_map_records": existing_count,
    "research_status_counts": dict(
        sorted(research_counts.items())
    ),
    "confirmed_missing_added_to_master": confirmed_count,
    "confirmed_missing_mappable_now": new_mappable,
    "confirmed_missing_without_safe_coordinates": new_unmappable,
    "matched_existing_total": matched_existing_total,
    "matched_existing_attached": matched_existing_attached,
    "matched_existing_unlinked": len(matched_existing_unlinked),
    "duplicate_mh_total": duplicate_total,
    "duplicate_mh_attached_to_confirmed": (
        duplicate_attached_confirmed
    ),
    "duplicate_mh_attached_to_existing": (
        duplicate_attached_existing
    ),
    "duplicate_mh_unlinked": len(duplicate_unlinked),
    "duplicate_mh_unlinked_records": duplicate_unlinked,
    "settlements_filled_from_duplicate": (
        settlements_filled_from_duplicate
    ),
    "deposits_filled_from_duplicate": (
        deposits_filled_from_duplicate
    ),
    "non_point_research_records": len(non_point_records),
    "master_facility_records": len(master_records),
    "free_feature_count": len(free_features),
    "free_missing_field_counts": dict(free_missing),
    "confirmed_location_status_counts": dict(
        sorted(location_status.items())
    ),
}


# HARD DUPLICATE QA
if total_attached + len(duplicate_unlinked) != duplicate_total:
    raise RuntimeError(
        "Duplicate accounting mismatch"
    )

if duplicate_unlinked:
    raise RuntimeError(
        "Unlinked DUPLICATE_MH records remain: "
        + json.dumps(
            duplicate_unlinked,
            ensure_ascii=False,
        )
    )


master = {
    "schema_version": 2,
    "description": (
        "Private canonical mineral-water facility master. "
        "Not intended for browser/public delivery."
    ),
    "facilities": master_records,
    "non_point_research_records": non_point_records,
    "qa": report,
}

free = {
    "type": "FeatureCollection",
    "metadata": {
        "schema_version": 2,
        "visibility": "FREE",
        "allowed_properties": sorted(allowed_free),
    },
    "features": free_features,
}


dump(MASTER, master)
dump(FREE, free)
dump(REPORT, report)


print("MINERAL MASTER DUPLICATE LINK PATCH: PASS")
print()
print("EXISTING MAP RECORDS:", existing_count)
print("CONFIRMED_MISSING:", confirmed_count)
print("MASTER FACILITIES:", len(master_records))
print()
print("MATCHED_EXISTING TOTAL:", matched_existing_total)
print("MATCHED_EXISTING ATTACHED:", matched_existing_attached)
print(
    "MATCHED_EXISTING UNLINKED:",
    len(matched_existing_unlinked),
)
print()
print("DUPLICATE_MH TOTAL:", duplicate_total)
print(
    "DUPLICATE -> CONFIRMED:",
    duplicate_attached_confirmed,
)
print(
    "DUPLICATE -> EXISTING:",
    duplicate_attached_existing,
)
print(
    "DUPLICATE UNLINKED:",
    len(duplicate_unlinked),
)
print()
print(
    "SETTLEMENTS FILLED FROM DUPLICATES:",
    settlements_filled_from_duplicate,
)
print(
    "DEPOSITS FILLED FROM DUPLICATES:",
    deposits_filled_from_duplicate,
)
print()
print("NEW MAPPABLE NOW:", new_mappable)
print(
    "NEW WITHOUT SAFE COORDINATES:",
    new_unmappable,
)
print("FREE FEATURES:", len(free_features))
print()
print("FREE MISSING FIELDS:")

for key in [
    "name",
    "facility_type",
    "settlement",
]:
    print(
        f"  {key}: "
        f"{free_missing.get(key, 0)}"
    )

print()
print("CONFIRMED LOCATION STATUS:")

for key, value in sorted(location_status.items()):
    print(f"  {key}: {value}")

print()
print("FREE PRIVACY SCHEMA: PASS")
print("LEGACY DUPLICATE current_* FIELDS: EXCLUDED")
