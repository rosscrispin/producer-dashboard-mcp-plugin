---
name: producer-dashboard
description: Producer Dashboard MCP — 56 tools for managing songs, focus mode, collaborators, collaborator deals, tags, buckets, comments, todos, library views, search, share pages, split sheets, and royalty earnings. Use when the user mentions music production, songs, tracks, stages, collaborators, royalties, or sharing.
---

# Producer Dashboard MCP

## Overview
The Producer Dashboard MCP connects the agent to a music production management app. It provides tools across songs, focus mode, collaborators, collaborator deals, tags, buckets, comments, todos, sharing, split-sheet export, royalty earnings import, search, and library views. Use these tools to help producers manage their library, track progress, earnings, and collaboration.

## When to Use
Use this skill when the user mentions songs, tracks, music production, stages, buckets, collaborators, comments, royalties, earnings, sharing, or any music workflow management task.

## Working Rules
- Resolve mutable names to stable IDs before updates or destructive actions.
- Treat names, emails, and labels as lookup inputs, not record identities.
- Prefer `track_group_id`, bucket IDs, collaborator IDs, tag IDs, and share IDs for follow-up tool calls.
- Do not dump raw JSON when summarizing results for the user.

## Data Model

### Songs (Track Groups)
The core entity. Each song has:
- **Stage** — production maturity: `seed` → `sprout` → `sapling` → `plant` → `tree` → `finished`
- **Workflow states** — production phases such as `needs_rework`, `needs_mix`, `needs_master`, `needs_vocals`, `needs_lyrics`, `needs_collaborator`, `ready_for_release`, `open_for_artists`
- **Excitement level** — 0-100 score
- **Priority** — `high`, `medium`, `low`, or unset
- **Focus metadata** — `focus_override`, `last_active_at`, `project_file_modified_at`, `is_focused`, and `focus_source`
- **Bucket** — project folder assignment
- **Tags** — labels by category
- **Collaborators** — people with roles, split percentages, publishers, and collaborator deals
- **Comments** — feedback with optional timecodes
- **Todos** — action items linked to songs

Songs are created and deleted through the file import system, not this MCP surface.

### Relationships
```text
Song -> has many collaborators
Song -> has many tags
Song -> has many comments
Song -> has many todos
Song -> belongs to one bucket
Song -> can appear in share pages
Collaborator -> can have share status
Collaborator -> can reference a publisher
Collaborator -> can have deal rows
```

## Terminology Mapping

| User says | Tool parameter | Value |
|---|---|---|
| "finished tracks" / "complete" | `stages=finished` | finished |
| "new ideas" / "early ideas" | `stages=seed` | seed |
| "in progress" | `stages=sprout,sapling,plant` | comma-separated |
| "mature" / "nearly done" | `stages=tree` | tree |
| "needs mixing" | `workflow=needs_mix` | needs_mix |
| "ready to release" | `workflow=ready_for_release` | ready_for_release |
| "high excitement" | `excitement_min=70` | 70-100 |
| "high priority" | `priority=high` | high |
| "what am I focused on?" | `list_focused_tracks` | |
| "latest album" | resolve by bucket name or recent songs | |
| collaborator name | resolve with `list_collaborators` or `lookup_collaborator` first | |

## Composition Pattern
Most Producer Dashboard requests break into:

`find -> filter -> act -> summarize`

Use multiple small tool calls instead of one large speculative action.

## Common Workflows

### Information Queries
Example: "Have there been any new comments on my latest album in the past few days?"

```text
1. list_buckets -> find the album bucket by name
2. list_songs(bucket_id=<id>, limit=50) -> get song IDs in that bucket
3. list_comments(since="<recent>", limit=50) or search_comments(...) -> get recent comments
4. Cross-reference recent comments with song IDs from step 2
5. Summarize by song and count
```

### Organize And Categorize
Example: "Put all the latest releases in a bucket for easy access"

```text
1. list_buckets -> check whether a Releases bucket exists
2. create_bucket(name="Releases") if needed
3. list_songs(stages=finished, limit=50) -> get song IDs
4. batch_update_songs(track_group_ids=[...], bucket_id=<bucket_id>)
5. Summarize what moved
```

### Collaboration
Example: "Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"

```text
1. lookup_collaborator(email=...) or list_collaborators -> resolve collaborator
2. list_songs(stages=tree, limit=50) -> get song IDs
3. add_collaborator_to_song(...) for each target song
4. Summarize songs changed and any skips
```

### Share Pages
Example: "Create a share page for my finished tracks with downloads enabled"

```text
create_share_page(stages="finished", title="Finished Tracks", download_bounces=true, download_stems=true)
```

For advanced shares, `create_share_page` also supports password, expiry, view mode, `download_split_sheet`, per-track permissions, explicit `track_files`, `track_order`, filter snapshots, column visibility, bucket artwork, and custom share images. Use `list_shares` to inspect those advanced fields after creation.

### Focus Mode
Example: "What am I working on right now?"

```text
list_focused_tracks
set_focus_override(track_group_id=<id>, override="pinned")
clear_focus_overrides
```

### Split Sheets
Example: "Export a split sheet for this bucket as CSV"

```text
export_split_sheet(bucket_id=<id>, format="generic", file_type="csv")
```

### Royalty Earnings
Example: "Import this MusicBed royalty statement"

```text
1. Parse the source statement yourself and reconcile source totals before import.
2. Use list_songs/search context to resolve source track names to stable track_group_id values.
3. Prepare one normalized rows array per source statement, retaining source_sheet_name and source_row_number on each row.
4. Call import_royalty_earnings(filename=<source>, source_provider=<provider>, rows=[...], expected_total_net_amount=<statement total>, source_file_text/source_file_base64=<optional source content>).
5. Treat duplicate responses as a successful no-op: no committed rows were created.
```

Do not use backend fuzzy matching or browser royalty import UI. The agent owns parsing, matching, and reconciliation before calling `import_royalty_earnings`.

### Status Dashboard
Example: "Give me a full overview of my library"

```text
1. get_library_stats
2. list_buckets
3. list_todos
4. list_comments(since="<recent>", limit=10)
5. list_songs(workflow=needs_mix)
6. Synthesize into a concise dashboard summary
```

## Tool Reference

### Songs
- `list_songs`
- `get_song`
- `update_song`
- `batch_update_songs`
- `list_focused_tracks`
- `set_focus_override`
- `clear_focus_overrides`

### Buckets
- `list_buckets`
- `get_bucket`
- `create_bucket`
- `update_bucket`
- `delete_bucket`

### Tags
- `list_tags`
- `list_tag_categories`
- `get_song_tags`
- `assign_tags`
- `remove_tag`
- `create_tag`
- `delete_tag`

### Collaborators And Publishers
- `list_collaborators`
- `lookup_collaborator`
- `get_song_collaborators`
- `list_publishers`
- `add_collaborator_to_song`
- `remove_collaborator_from_song`
- `share_with_collaborators`
- `get_share_status`
- `create_collaborator`
- `update_collaborator`
- `delete_collaborator`
- `list_collaborator_deals`
- `create_collaborator_deal`
- `update_collaborator_deal`
- `delete_collaborator_deal`
- `create_publisher`
- `update_publisher`
- `delete_publisher`

### Sharing
- `create_share_page`
- `list_shares`
- `delete_share`
- `export_split_sheet`

### Earnings
- `import_royalty_earnings`

### Comments
- `list_comments`
- `create_comment`
- `update_comment`
- `delete_comment`

### Todos
- `list_todos`
- `create_todo`
- `update_todo`
- `delete_todo`

### Library
- `list_saved_views`
- `get_recent_activity`
- `list_workflow_definitions`
- `get_subscription_status`
- `get_library_stats`

### Search
- `search_comments`

## Response Formatting Rules
1. Summarize results in natural language instead of dumping raw JSON.
2. Group output by song, collaborator, bucket, or share as appropriate.
3. Use counts: "Found 12 comments across 4 songs."
4. Prefer relative dates when the exact timestamp is not important.
5. Surface actionable items such as missing sharing, overdue work, or incomplete todos.
6. Offer a concrete next action when the user is clearly mid-workflow.

## Authentication
On first use, the client will prompt the user to authenticate with Producer Dashboard in the browser. Tokens are scoped and stored by the client and server OAuth flow.

## Permissions
Some operations require permissions enabled in Producer Dashboard under `Settings > AI Agent Access`:
- `sharing`
- `destructive_operations`
- `bulk_operations`
- `export_data`
- `edit_songs`
- `read_library`
- `read_collaborators`
- `comments_todos`
