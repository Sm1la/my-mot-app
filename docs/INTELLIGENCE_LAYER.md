# Intelligence Layer

## v1: None
No AI in v1. All data is entered manually and deterministically.

## Later: Purchaser name suggestion
**Messy input**: Staff paste a block of free text (e.g. from an email or file note) into a file.

**Auto-structure schema** (JSON passed to model):
```json
{
  "raw_text": "John Smith and Mary Smith are the purchasers; also Jane Doe as trustee.",
  "extract": [
    {"name": "string", "role": "purchaser|trustee|guarantor"}
  ]
```

**Output stored** on `ai_suggestions` table:
```json
{
  "file_id": "uuid",
  "suggestion_type": "purchaser_name",
  "value": "John Smith",
  "source": "ai-suggest",
  "confidence": 0.92,
  "review_status": "unreviewed"
}
```

Staff see suggested names as a checklist; clicking accepts → creates a purchaser row and marks suggestion `review_status = 'accepted'`.

## Events to track (later)
- `purchaser.added` (manual vs accepted-from-suggestion)
- `signing_status.changed`
- `follow_up.toggled`

## Scoring (later, rule-based)
- File completion score: `signed_purchasers / total_purchasers` × 100.
- Follow-up urgency: files with `follow_up_needed = true` AND no signing in 7 days → high.

## What gets ranked (later)
- Files by completion % ascending (least-complete first).
- Files by follow-up urgency.

## v1 vs later
- v1: manual entry, no scoring, no ranking.
- Later: AI purchaser suggestion, completion scoring, follow-up urgency ranking.