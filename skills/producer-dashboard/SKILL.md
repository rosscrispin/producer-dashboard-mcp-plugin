---
name: producer-dashboard
description: Producer Dashboard MCP — manage songs, collaborators, tags, buckets, comments, todos, and share pages. Use when the user mentions music production, songs, tracks, stages, collaborators, or sharing.
---

# Producer Dashboard MCP

## Data Model

**Songs (Track Groups)** — the core entity. Each has:
- **Stage** — production maturity: `seed` → `sprout` → `sapling` → `plant` → `tree` → `finished`
- **Workflow state** — one of `needs_rework`, `needs_mix`, `needs_master`, `needs_vocals`, `needs_lyrics`, `needs_collaborator`, `ready_for_release`, `open_for_artists`
- **Excitement level** — 0–100
- **Bucket** — project folder
- **Tags** — by category (Genre, Mood, Instrument, Status)
- **Collaborators** — with master/publishing/writer split percentages
- **Comments** — feedback with timecodes on specific audio files
- **Todos** — action items linked to songs

Songs are created/deleted via the file import system in Producer Dashboard, NOT via the MCP.

## Terminology Mapping

| User says | Tool parameter |
|---|---|
| "finished" / "complete" | `stages=finished` |
| "new ideas" / "early ideas" | `stages=seed` |
| "in progress" | `stages=sprout,sapling,plant` |
| "mature" / "nearly done" | `stages=tree` |
| "needs mixing" | `workflow=needs_mix` |
| "ready to release" | `workflow=ready_for_release` |
| "high excitement" | `excitement_min=70` |
| "[person name]" | Resolve via `list_collaborators` or `lookup_collaborator` |

## Composition

Most producer questions decompose into **find → filter → act → summarize**. Compose multiple tool calls when needed — e.g. "comments on my latest album in the past few days" = `list_buckets` → `list_songs(bucket_id)` → `list_comments(since=…)` → cross-reference and summarize.

## Response Rules

1. Never dump raw JSON — summarize in natural language.
2. Use relative dates ("3 days ago" not ISO timestamps).
3. Show key fields only (name, stage, excitement) — not UUIDs.
4. Offer next steps when relevant ("Want me to share these with collaborators?").

## Permissions

Some operations require permissions enabled in **PD Settings → AI Agent Access**:
- `sharing` — share tools (default OFF)
- `destructive_operations` — delete tools (default OFF)
- `bulk_operations` — `batch_update_songs` (default OFF)
- `edit_songs` — all write operations (default ON)
- `read_library`, `read_collaborators`, `comments_todos` — read operations (default ON)
