# Data Model

## Table: `files`
| Field | Type | Notes |
|------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid | nullable — owner-scoping added at lock-down |
| file_ref | text | e.g. "PT-2024-0137" |
| property_address | text | required |
| status | text | `open` (default) or `closed` |
| notes | text | optional, free text |
| created_at | timestamptz | default now() |

**RLS**: enabled. v1 permissive read/write (demo-first). Lock-down: `auth.uid() = user_id`.

## Table: `purchasers`
| Field | Type | Notes |
|------|------|-------|
| id | uuid PK | `gen_random_uuid()` |
| user_id | uuid | nullable — owner-scoping added at lock-down |
| file_id | uuid | references files(id) — not FK-enforced yet (demo-first); enforced at lock-down |
| name | text | required, purchaser full name |
| signing_status | text | `pending` (default) or `signed` |
| signing_date | date | nullable, set when status → signed |
| follow_up_needed | bool | default false |
| follow_up_notes | text | optional, nullable |
| created_at | timestamptz | default now() |

**RLS**: enabled. v1 permissive read/write. Lock-down: `auth.uid() = user_id`.

## Relationships
- One file → many purchasers (file_id on purchasers).
- Deleting a file should cascade-delete its purchasers (handled in app logic for v1; DB cascade added at lock-down).

## AI fields
- **None in v1.** Later: `suggested_purchasers` extraction will store `value` + `source` ("ai-suggest") + `confidence` (numeric 0–1) + `review_status` (default `'unreviewed'`) on a separate `ai_suggestions` table.

## Constraints (enforced at DB level where possible)
- `files.status` CHECK in (`open`, `closed`).
- `purchasers.signing_status` CHECK in (`pending`, `signed`).
- `files.file_ref` NOT NULL.
- `files.property_address` NOT NULL.
- `purchasers.name` NOT NULL.