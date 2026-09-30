# Agentic Layer

## v1: No automated actions
All actions in v1 are human-initiated (click a button, fill a form).

## Later: Draftable actions (low risk — auto)
| Action | Trigger | Tool | Risk |
|-------|---------|------|------|
| Suggest purchaser names from pasted text | user pastes notes | `suggest_purchasers` | low (auto) |
| Tag file as "needs follow-up" | follow_up_needed toggled true | `flag_follow_up` | low (auto) |

## Later: Executable-after-approval (medium risk — light approval)
| Action | Trigger | Tool | Risk |
|-------|---------|------|------|
| Create purchaser rows from AI suggestions | user clicks "Accept" | `accept_suggestion` | medium |
| Update file status to `closed` when all purchasers signed | user confirms | `auto_close_file` | medium |

## Human-only (high risk)
| Action | Tool | Risk |
|--------|------|------|
| Delete a file (cascades purchasers) | `delete_file` | high — always confirm |
| Delete a purchaser | `delete_purchaser` | high — always confirm |
| Send follow-up reminder email | `send_reminder` | high — always confirm (later) |

## Named tools only
No raw run-any tools. Approved tools: `suggest_purchasers`, `flag_follow_up`, `accept_suggestion`, `auto_close_file`, `delete_file`, `delete_purchaser`, `send_reminder`.

## Audit log fields (later)
`id, user_id, action, entity_type, entity_id, old_value (jsonb), new_value (jsonb), created_at`.

## v1 vs later
- v1: all human, no automation, no audit log.
- Later: AI suggestion + auto-flag + auto-close + audit log + reminder drafts.