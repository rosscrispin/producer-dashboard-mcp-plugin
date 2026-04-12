---
name: producer-dashboard
description: Producer Dashboard MCP — 44 tools for managing songs, collaborators, tags, buckets, comments, todos, and share pages. Use when the user mentions music production, songs, tracks, stages, collaborators, or sharing.
---

# Producer Dashboard MCP

## Overview
The Producer Dashboard MCP connects Claude to a music production management app. It provides 44 tools across songs, collaborators, tags, buckets, comments, todos, sharing, and search. Use these to help producers manage their library, track progress, and collaborate.

## When to Use
When the user mentions songs, tracks, music production, stages, buckets, collaborators, comments, sharing, or any music workflow management task.

## Data Model

### Songs (Track Groups)
The core entity. Each song has:
- **Stage** — production maturity: `seed` → `sprout` → `sapling` → `plant` → `tree` → `finished`
- **Workflow states** — production phases: `needs_rework`, `needs_mix`, `needs_master`, `needs_vocals`, `needs_lyrics`, `needs_collaborator`, `ready_for_release`, `open_for_artists`
- **Excitement level** — 0-100 score
- **Bucket** — project folder assignment
- **Tags** — labels by category (Genre, Mood, Instrument, Status)
- **Collaborators** — people with roles and split percentages (master, publishing, writer)
- **Comments** — feedback with timecodes on specific audio files
- **Todos** — action items linked to songs

Songs are created/deleted via the file import system, NOT via the MCP.

### Relationships
```
Song → has many Collaborators (with splits)
Song → has many Tags
Song → has many Comments (on specific files)
Song → has many Todos
Song → belongs to one Bucket
Song → has share links (playlist shares)
Collaborator → has share status (shared, pending, accepted)
Collaborator → has optional Publisher
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
| "my latest album" | Find by bucket name or most recent songs | |
| "[person name]" | Use `list_collaborators` or `lookup_collaborator` to resolve | |

## Multi-Step Composition Guide

The power of this MCP is composing multiple tool calls to answer complex questions. Every producer question decomposes into: **find → filter → act → summarize**.

### Pattern 1: Information Queries
**"Have there been any new comments on my latest album in the past few days?"**
```
1. list_buckets → find the album bucket by name
2. list_songs(bucket_id=<id>, limit=50) → get song IDs in that bucket
3. search_comments(stages="...", since="<3 days ago>") OR
   list_comments(since="<3 days ago>", limit=50) → get recent comments
4. Cross-reference comment track_group_ids with song IDs from step 2
5. Summarize: "3 new comments on 2 songs in [album name] since Tuesday"
```

**"Did I send the export to [publisher] yet?"**
```
1. list_shares → check existing share links
2. Match share titles or track IDs to the publisher's songs
3. Summarize: "Found a share link for [title] created 3 days ago with 12 views"
   OR "No share link found for those tracks. Want me to create one?"
```

**"Were there any changes by [collaborator] on those songs?"**
```
1. lookup_collaborator(email=...) or list_collaborators → find collaborator
2. get_song_collaborators(track_group_ids=...) → find which songs they're on
3. get_share_status(track_group_id=...) → check if shared, accepted, import status
4. list_comments filtered by recent → check for their comments
5. Summarize sharing + activity status per song
```

### Pattern 2: Organize & Categorize
**"Put all the latest releases in a bucket for easy access"**
```
1. list_buckets → check if "Releases" bucket exists
2. If not: create_bucket(name="Releases")
3. list_songs(stages=finished, limit=50) → get finished song IDs
4. batch_update_songs(track_group_ids=[...], bucket_id=<releases_id>)
5. "Moved 7 finished tracks into the Releases bucket"
```

**"Tag all songs in [bucket] as Cinematic"**
```
1. list_tags → find the Cinematic tag ID
2. list_songs(bucket_id=<id>, limit=50) → get songs
3. For each song: assign_tags(track_group_id, [cinematic_tag_id])
4. "Tagged 12 songs as Cinematic"
```

### Pattern 3: Collaboration Management
**"Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"**
```
1. lookup_collaborator(email=joshuadcrispin@gmail.com) → confirm identity
2. list_songs(stages=tree, limit=50) → get song IDs
3. For each: add_collaborator_to_song(track_group_id, name="Joshua", email="...", master_split=50, publishing_split=50, writer_split=50)
4. "Added Joshua to 5 tree-stage songs with 50/50 splits"
```

**"Share my finished tracks with all collaborators"**
```
1. list_songs(stages=finished, limit=50)
2. For each song with collaborators: share_with_collaborators(track_group_id)
3. "Shared 4 of 7 finished songs (3 had no collaborators)"
```

### Pattern 4: Share Pages
**"Create a share page for my finished tracks with download enabled"**
```
create_share_page(stages="finished", title="Finished Tracks", download_bounces=true, download_stems=true)
```

**"Share everything in the test 4 bucket"**
```
create_share_page(bucket_id="<uuid>", title="Test 4 Collection")
```

### Pattern 5: Status Dashboard
**"Give me a full overview of my library"**
```
1. get_library_stats → stage breakdown counts
2. list_buckets → bucket summary
3. list_todos → incomplete tasks
4. list_comments(since="<7 days ago>", limit=10) → recent feedback
5. list_songs(workflow=needs_mix) → songs needing attention
6. Synthesize into a dashboard summary
```

## Tool Reference (44 tools)

### Songs (5)
- `list_songs` — filter by stages, workflow, tags, excitement, bucket, search. Default 20 results.
- `get_song` — full details for one song
- `update_song` — change name, display_name, artist, stage, workflow, due_date, bucket, excitement, favourite, bpm, key
- `batch_update_songs` — update multiple songs at once (up to 50)
- `get_library_stats` — total count + breakdown by stage

### Buckets (5)
- `list_buckets` — all buckets with track counts
- `get_bucket` — single bucket details
- `create_bucket` — new bucket with name, description, color
- `update_bucket` — change name, description, color, due_date
- `delete_bucket` — remove bucket (songs become unassigned)

### Tags (7)
- `list_tags` — all tags with categories
- `list_tag_categories` — all tag categories
- `get_song_tags` — tags on a specific song
- `assign_tags` — set tags on a song (replaces existing)
- `remove_tag` — remove one tag from a song
- `create_tag` — new tag with name, category, color
- `delete_tag` — remove tag from system

### Collaborators (11)
- `list_collaborators` — all global collaborators
- `lookup_collaborator` — find by email (includes publisher info)
- `get_song_collaborators` — collaborators on specific songs with splits
- `list_publishers` — all publishers
- `add_collaborator_to_song` — add with optional splits
- `remove_collaborator_from_song` — remove from song
- `create_collaborator` — new global collaborator
- `update_collaborator` — edit collaborator details
- `delete_collaborator` — remove from system
- `create_publisher` / `update_publisher` / `delete_publisher` — publisher CRUD

### Sharing (5)
- `create_share_page` — playlist share from IDs, bucket, or stage filter
- `list_shares` — existing share links with access counts
- `delete_share` — revoke a share link
- `share_with_collaborators` — share Dropbox folder with song's collaborators
- `get_share_status` — check per-collaborator share/invite/accept status

### Comments (4)
- `list_comments` — filter by song, date range, with pagination
- `create_comment` — new comment (requires track_id or file_path)
- `update_comment` — edit comment text
- `delete_comment` — remove comment

### Todos (4)
- `list_todos` — all todos
- `create_todo` — new todo, optionally linked to a song
- `update_todo` — edit text or mark complete
- `delete_todo` — remove todo

### Library (4)
- `list_saved_views` — saved filter views
- `get_recent_activity` — activity feed
- `list_workflow_definitions` — available workflow states
- `get_subscription_status` — subscription info

### Search (1)
- `search_comments` — cross-reference songs by stage with comments by date

## Response Formatting Rules
1. **Never dump raw JSON** — always summarize in natural language
2. **Group results logically** — by song, collaborator, or bucket as appropriate
3. **Use relative dates** — "3 days ago" not "2026-04-07T07:03:26Z"
4. **Include counts** — "Found 12 comments across 4 songs"
5. **Key fields only** — name, stage, excitement, last updated. Not UUIDs.
6. **Highlight actionable items** — "2 songs still need sharing", "3 incomplete todos"
7. **Offer next steps** — "Want me to share these with collaborators?" / "Should I create a bucket for these?"

## Authentication
When you first use the tools, Claude Code will prompt you to authenticate via your Producer Dashboard account in the browser. Tokens are stored securely and last 30 days.

## Permissions
Some operations require specific permissions enabled in PD Settings > AI Agent Access:
- `sharing` — required for share tools (default: OFF)
- `destructive_operations` — required for delete tools (default: OFF)
- `bulk_operations` — required for batch_update_songs (default: OFF)
- `edit_songs` — required for all write operations (default: ON)
- `read_library`, `read_collaborators`, `comments_todos` — read operations (default: ON)
