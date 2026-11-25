# SONDI.BG - National Evidence Categories

## Purpose and mandatory rule for future chats

Before integrating a new region, read this file and
`national_evidence_category_registry.json`.
Reuse national categories. Do not invent a new
`evidence_level` string for each region.
If a new evidence type is genuinely necessary, first
update the central registry and shared consumer contract.

## Current status

The shared national TypeScript category contract is ACTIVE.
The original evidence fields remain unchanged.
No existing data have been renamed or promoted.

## Proposed canonical evidence types

- `DOCUMENTED_BOREHOLE_INTERVAL`: actual documented
  lithological depth interval with material and source.
- `REGIONAL_GEOLOGICAL_CONTEXT`: regional descriptions,
  maps, cross-sections or spatial research context.
- `PREDICTED_INTERVAL`: conditional AI interpretation,
  never treated as an actual measured column.

The original `evidence_level` remains available as
provenance. Coordinate quality is stored separately.

## Existing values in the national borehole file

| Original evidence_level | Intervals | Proposed type | Review status |
|---|---:|---|---|
| `` | 33 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `ACTUAL_BOREHOLE_LITHOLOGY_REPORTED_IN_EIA_PROSE` | 4 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `ACTUAL_ENGINEERING_BOREHOLE_LOG` | 45 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `DOCUMENTED_ACTUAL_BOREHOLE_SECTION` | 23 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `OFFICIAL_ACTUAL_BOREHOLE_GEOLOGICAL_SECTION` | 34 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `OFFICIAL_ACTUAL_BOREHOLE_SECTION` | 20 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `PUBLISHED_ACTUAL_BOREHOLE_STRATIGRAPHIC_INTERVAL` | 5 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `PUBLISHED_BOREHOLE_LITHOSTRATIGRAPHIC_INTERVAL` | 2 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `borehole_exact` | 416 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `borehole_exact_partial_column` | 5 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `borehole_exact_source_overlap` | 2 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `borehole_exact_with_source_conflict` | 1 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `documented_borehole_interval_research_review` | 139 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `documented_borehole_log` | 283 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `documented_structural_zone` | 3 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `published_borehole_lithology` | 19 | `DOCUMENTED_BOREHOLE_INTERVAL` | PROPOSED_NOT_ACTIVE |
| `source_gap` | 1 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |
| `unresolved_no_core` | 1 | `REVIEW_REQUIRED` | REVIEW_REQUIRED |

## Data identity and interpretation safeguards

- Preserve original evidence_level, interval boundaries and source_ids.
- Do not promote regional or predicted intervals to measured observations.
- Coordinate status is independent from evidence type.
- Exact-client display and Luna evidence collection must use one shared validated contract.
- Unknown categories require review before canonical mapping.
- A canonical documented interval does not prove geological continuity at a nearby point.
- Luna independently interprets conditional dynamic depths; never hardcode forecast depths.

## Shared runtime implementation (NOT YET DONE)

1. Audit the proposed mappings against original sources
   and existing regional behavior.
2. Implement one shared interval eligibility/classification
   function in `lib/` instead of per-region allowlists.
3. Use it both in `app/depth-structure/page.tsx` and
   `lib/sondi-luna-geological-analyst.ts`.
4. Preserve documented EXACT columns at exact coordinates
   and independent dynamic Luna forecasts nearby.
5. Regression-check existing regions and Varna B1/B2.
6. Only then mark the mapping as active and record acceptance.

## Varna Step 6 regression coordinates

- Test A exact: `43.03174611, 27.85337417`
- Test B1 nearby: `43.03620, 27.85600`
- Test B2 nearby: `43.30750, 28.05500`
- Test E regional: `43.20500, 27.91000`

## For the next ChatGPT conversation

Start by reading this Markdown guide, the companion JSON,
and the current Step 6 acceptance state. Do not introduce
new region-specific evidence exceptions. Preserve Luna's
independent geological interpretation and conditional depths.


## ACTIVE NATIONAL CONTRACT - V1

The classification contract is ACTIVE:
`lib/sondi-national-evidence-categories.ts`

Its exported `isNationalDocumentedLithologyInterval` is the
single shared eligibility function for national borehole
intervals used by both the exact client column and Luna's
initial verified depth-observation collector.

The 11 active documented category names are:
- `ACTUAL_BOREHOLE_LITHOLOGY_REPORTED_IN_EIA_PROSE`
- `ACTUAL_ENGINEERING_BOREHOLE_LOG`
- `DOCUMENTED_ACTUAL_BOREHOLE_SECTION`
- `OFFICIAL_ACTUAL_BOREHOLE_GEOLOGICAL_SECTION`
- `OFFICIAL_ACTUAL_BOREHOLE_SECTION`
- `PUBLISHED_ACTUAL_BOREHOLE_STRATIGRAPHIC_INTERVAL`
- `PUBLISHED_BOREHOLE_LITHOSTRATIGRAPHIC_INTERVAL`
- `borehole_exact`
- `documented_borehole_interval_research_review`
- `documented_borehole_log`
- `published_borehole_lithology`

Do not invent a new `evidence_level` for a new region.
Reuse an existing documented category after source verification.
If a genuinely distinct category is needed, update the central
TypeScript contract and this registry, then run regression tests.

Excluded: empty category; partial, overlapping or conflicting
records; structural zones; source gaps; unresolved core.
Review such records separately. Do not discard source records.

Coordinate statuses stay independent. Exact client columns are
displayed only at recorded exact coordinates. Nearby Luna
interpretations remain conditional and dynamic. Regional
Stomana/Pernik client exception is retained separately.

For future chats: read this guide AND the JSON registry first.
Do not add per-region category allowlists in client or Luna.
