---
name: producer-dashboard
description: The Library MCP — authorized music-library tools for tracks, Buckets, collaborators, selected-recipient sharing, Friend Track Offers, comments, To-Dos, share pages, split sheets, and royalty earnings.
---

# The Library MCP

## Overview
The Library MCP connects the agent to a music production management app. It provides 104 tools across tracks, focus mode, collaborators, Buckets, Bucket properties, shared Bucket members, sharing, Friend Track Offers, comments, To-Dos, split sheets, royalty earnings, and search. Use the current tool catalogue to check which actions are available to this connection.

## When to Use
Use this skill when the user asks to inspect or manage songs or tracks, production stages, buckets, collaborators, comments, todos, sharing, saved views, search results, or royalty earnings. Do not activate it for unrelated questions, local-file deletion, or requests to create songs or upload audio; those actions are outside this MCP surface.

## Working Rules
- Resolve mutable names to stable IDs before updates or destructive actions.
- Treat names, emails, and labels as lookup inputs, not record identities.
- Prefer `track_group_id`, bucket IDs, collaborator IDs, tag IDs, and share IDs for follow-up tool calls.
- Do not dump raw JSON when summarizing results for the user.
- Keep the exact returned IDs and fields for the current task in context. When the user says “those”, “the same”, or “only these”, bind the next step to that frozen set, even if a new criterion such as priority or stage is added. Do not broaden the set from a fresh library search.
- Treat references such as “of those”, “all of those”, “only these”, and “exclude” as refinements of the frozen selection. Treat explicit whole-library language such as “all my tracks”, “search the library again”, or “refresh the results”, or a new subject, as a replacement or new task. If the scope is unclear, ask before acting. An unrelated detour does not discard a frozen selection. Keep it as inactive context when another task starts, and resume it if the user explicitly returns to it.
- Preserve every requested field and option across compound calls, including dates, titles, permissions, ordering, filters, and selected IDs. Do not silently substitute defaults or drop an argument on a later call.
- Before the first `query_tracks` call in each conversation, call `list_track_fields`. Use that catalogue as the allowlist for `fields`, `filters`, and `group_by`, including custom UUID paths. `query_tracks` automatically returns each row’s `id`; use that value as the `track_group_id` for later tools and never request an unadvertised `track_group_id` field.
- If a structured query reports an unknown or unsupported field, treat the result as unavailable, refresh or consult the field catalogue, correct the field once, and retry at most once with advertised paths. Never retry a guessed or unadvertised field. Transport, authentication, and permission failures remain unavailable; do not retry them or report them as zero results.
- Complete all required pages before claiming complete IDs or using a result set for a write. A successful `query_tracks` response may establish an exact `total_count` or grouped `groups` result without fetching every result page; fetch every page when individual IDs or the complete list are required. A failed or incomplete read is unknown, not an empty result. Before any write, refresh the exact target IDs, check current values and permissions, and require the client’s confirmation policy where applicable.
- Use only capabilities advertised by the current tool catalogue. Do not invent approval, native desktop actions, or successful mutations. `preview_track_group_join` is a review step; native Join execution remains outside this MCP release.
- New share, Friend and Offer tools need their exact additional consent and app permission groups. Existing grants stay unchanged. A denied action does not authorize a grant update.
- For recipient and access changes, use `prepare -> trusted app review -> execute -> status`. Only the app can issue approval. Chat confirmation, an `approved:true` value, and possession of a plan ID are insufficient. The idempotency key is a UUID. Use the returned plan ID, approval ID and original idempotency UUID. Cancel or refresh a stale plan. Read status after an unknown outcome before retrying.
- `add_collaborator_to_song` assigns one Track through the central roster rules. It persists splits but does not share files or send an invitation.
- `update_bucket(due_date=null)` clears the Bucket deadline. The current API does not clear inherited Track deadlines.
- Shared Bucket member changes always use `prepare -> trusted interactive app review -> execute_bucket_member_action -> status`. Chat text, an `approved:true` field, or a plan ID never substitutes for app approval.

## Continuous compound tasks

Plan compound requests as `discover -> constrain -> verify -> confirm -> act -> summarize`. Keep the IDs and scope from each successful read. Re-read before a mutation because another turn, user edit, or detour may have made the selection stale. If the user starts another task, retain the old selection as inactive context and resume it only when the user explicitly returns; revalidate it before any write.

The same task may be requested in one turn or over several turns:

```text
One turn: “Find finished tracks with no open To-Dos, keep only high-priority results, and after I confirm set their due date to 2026-10-31.”

Several turns:
1. “Find finished tracks with no open To-Dos.”
2. “Of those, keep only high-priority tracks.”
3. “Set their due date to 2026-10-31.”
```

In both forms, identify the finished-track IDs, use the activity query for the no-open-To-Do condition, apply the priority refinement to those IDs, and show the final frozen set before confirmation. On the third turn, refresh those IDs and their current due dates, then use the appropriate song update tool only after confirmation. If the user instead says “find all high-priority finished tracks again”, start a fresh scope. Never claim that a native action exists because a user’s multi-step request implies one.

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
- **Comments** — bounce feedback requires a canonical `file_path`; point/range timing and linked `todo_id` are optional
- **Todos** — action items linked to songs

Songs are created and deleted through the file import system, not this MCP surface.

### Relationships
```text
Song -> has many collaborators
Song -> has many tags
Song -> has many comments
Song -> has many todos
Song -> can belong to multiple buckets
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
Most requests to The Library break into:

`find -> filter -> act -> summarize`

Use multiple small tool calls instead of one large speculative action.

## Common Workflows

### Structured Track queries

Before the first `query_tracks` call in each conversation, use `list_track_fields` to discover standard fields, custom UUIDs, typed values, and stage names. Use only the returned field paths for compound filters, custom values, stored metadata, relation counts, and grouped counts. The query response includes `id` automatically; use it as the immutable Track ID for later actions. If a field is rejected, correct it from the catalogue and retry once at most. Use returned immutable IDs for later actions.

- `total_count` is exact only when the query succeeds. A scan limit or failed read is unavailable, never zero.
- `truncated` and `next_offset` describe result pages. Read the required pages before claiming a complete action scope.
- Collaborator fields, filters, and grouping also require `collaborators.read` and `read_collaborators`.
- Earnings fields are unavailable through this reader.
- Recorded file paths and file counts do not prove files exist on the device.

### Potential Track merges

1. Query owned Track IDs and titles to identify pairs for review.
2. Use `assess_potential_merges` for up to twenty explicit pairs. It sends current names to the external JEV classifier. It covers only those pairs and does not read the desktop button's cached candidate list.
3. Preserve uncertain results. A match is a candidate, not permission to merge.
4. Use `preview_track_group_join` with a chosen source ID and target ID to review record counts, blockers, warnings, and sharing effects.
5. Explain that execution requires the desktop Join flow with a fresh local preview and explicit approval. No remote execution tool or approved desktop bridge is available in this release. Do not claim a Join succeeded.

### Information Queries
Example: "Have there been any new comments on my latest album in the past few days?"

```text
1. list_buckets -> find the album bucket by name
2. list_songs(bucket_id=<id>, limit=50) -> get song IDs in that bucket
3. search_song_activity(candidate_track_group_ids=[...], comment_activity="has", comment_since="...", comment_before="...")
4. Summarize the returned song IDs and bounded activity summaries
```

Use `search_song_activity` for To-Do or comment presence and absence queries. Do not infer absence from `list_songs`, `list_todos`, `list_comments`, or other paginated list tools.

- `todo_state="no_open"` includes a song that has zero Track To-Dos.
- `todo_state="all_complete"` requires at least one Track To-Do and no open Track To-Dos.
- `todo_state="never"` means that the song has never had a Track To-Do.
- `comment_activity="none"` means that no comment matches the selected period and detail filters.
- `comment_activity="never"` means that the song has no comment history.
- Use exact UTC boundaries for a comment period. Use stable user IDs for a specific author.

### Organize And Categorize

`update_song.bucket_id` adds a membership and preserves existing memberships. `batch_update_songs` does not accept `bucket_id`. Never send an unsupported batch parameter. Bucket reads require `projects.read`; Bucket creation and membership adds require `songs.write` and the account edit permission. Report missing OAuth access before claiming an operation succeeded.
Example: "Put all the latest releases in a bucket for easy access"

```text
1. list_buckets -> check whether a Releases bucket exists
2. create_bucket(name="Releases") if needed
3. list_songs(stages=finished, limit=50) -> get song IDs
4. Freeze the complete Track IDs and refresh their current Bucket memberships
5. update_song(id=<track_id>, bucket_id=<bucket_id>) for each selected Track
6. query_tracks(track_ids=[...], fields=["title", "buckets"]) -> verify the new Bucket and all prior memberships
7. Summarize the additions and any failed IDs
```

### Bucket hierarchy

Use `get_bucket_hierarchy` to read the owned tree and current Bucket revisions. Keep the returned parent and child UUIDs. Resolve duplicate names by their parent path. Shared Buckets remain visible through `list_buckets`; the owned hierarchy does not grant write access to them.

- Use `create_bucket_v2` for a new root or child Bucket. Set `parent_id` to the resolved owned parent UUID for a child; omit it or use null for a root. Supply a fresh UUID `idempotency_key` for each logical creation.
- Use `set_bucket_parent` to nest, move, or unnest an existing Bucket. Supply the latest `expected_version` and a fresh idempotency UUID. Null moves it to the top level. This changes hierarchy only; Tracks retain their exact memberships.
- These writes require `projects.write` and the account's `manage_projects` permission. Existing grants do not gain this scope from a plugin update. If access is missing, report the required consent and account setting. Do not substitute a flat Bucket for a requested child.
- Verify the saved child `parent_id`, then add the selected Track with `update_song.bucket_id`. Read back all memberships to prove preservation. Parent changes do not share Tracks, send invitations, move files, or assign Tracks to ancestor Buckets.
- The retained `create_bucket` still creates top-level Buckets under its existing `songs.write` grant. It cannot accept a parent or idempotency parameter. Retained `update_bucket` edits its advertised properties; use `set_bucket_parent` for hierarchy changes.

### Bucket properties

- Use `get_bucket_property_status` to read one owned Bucket's category tag, ordinary tag, canonical Public Page membership/publication state, and Friends audience processing. Request only the sections needed; tags need `tags.read`, and Friends status needs `rights.read` plus `collaborators.read`. It returns IDs and counts without contact fields.
- Use `prepare_set_bucket_tags` for Bucket categories and ordinary tags. Supply `category_tag_ids` and/or `tag_ids`; omitted partitions stay unchanged and an empty supplied array clears only that partition. This does not alter Track tags. It requires `projects.write`, `tags.read`, `projects.read`, and `manage_projects`.
- Use `prepare_set_public_page_bucket_visibility` for canonical Public Page collection membership. The review freezes complete current source and visible Track IDs, publication state, and preserved sections and explains that future eligible direct Tracks can render under the persisted limits. It preserves other sections, ordering, and display settings and requires fresh `public_pages.write` consent plus `manage_public_pages`. A setup or sales/purchase handoff blocker is reported before any write. Disable remains available for a previously selected Bucket even if its current source set is empty or archived.
- Use `prepare_set_bucket_friends_audience` for Visible to Friends. The review shows complete current Friend and direct Track IDs, the current and future audience scope, and that enabling can queue Offers. It requires `rights.write`, `sharing.write`, `collaborators.read`, `projects.read`, and their account policies. It never grants ordinary access or sends an invitation. Disabling stops new audience Offer processing and retains existing Offers.
- Execute all three with `execute_bucket_property_action` only after trusted app approval. Read the operation and re-read the affected Bucket property after an unknown result.
- Reuse the exact idempotency key and arguments after an unknown response. A changed request needs a new key. After a stale-state error, read the hierarchy again and review the current target before a new operation.
Example: "Under finished tracks, create Ready for Release and add the matching Track."

```text
1. get_bucket_hierarchy -> resolve the finished tracks UUID and check for an existing matching child
2. Refresh the frozen Track IDs and resolve the Ready for Release workflow
3. create_bucket_v2(name="Ready for Release", parent_id=<parent_id>, idempotency_key=<fresh_uuid>) if needed
4. Verify the returned saved parent_id
5. update_song(id=<selected_track_id>, bucket_id=<child_id>)
6. get_bucket_hierarchy and query_tracks -> verify the child and preserved Track memberships
```

### Shared Bucket members

Use the member tools for Bucket recipients and their per-Track delivery state. These records are separate from direct Track collaborators and public share links.

- `list_bucket_members` reads one Bucket's member rows, pending/accepted/revoked status, editor/viewer role, coverage blockers, and child-share delivery state. Set `include_revoked` only when the owner needs audit history. Set `include_contact_details=true` only with an explicit collaborators.read grant; it defaults to false.
- `list_bucket_invitations` lists invitations visible to the authenticated actor. An owner sees the relevant roster; a pending recipient can discover only that recipient's own invitation.
- `get_bucket_sharing_status` reads the aggregate Bucket and optional exact member status. A failed read is unavailable, never an empty roster. Follow cursors and require complete coverage before claiming a full list.
- Resolve a Bucket and stable member, collaborator, Track, or child-share UUID before preparing a change. Preserve independent direct access, other-Bucket access, owner files, and existing Track records.

Prepare one of these exact actions, then stop for the trusted app review: `prepare_bucket_member_invite`, `prepare_bucket_member_role`, `prepare_bucket_member_revocation`, `prepare_bucket_invitation_acceptance`, `prepare_bucket_leave`, `prepare_bucket_member_coverage_repair`, or `prepare_bucket_share_import_retry`. Each write requires sharing.write and projects.read, uses a fresh UUID idempotency key, and uses the latest opaque membership revision. Role values are only `editor` and `viewer`.

- Invite accepts an explicit email and/or collaborator UUID, role, Track exclusions, and an optional missing-collaborator remedy. At least one recipient lookup is required. A pending member resend is a new reviewed plan. Collaborator directory authority is required for recipient lookup; creating Observer coverage additionally requires collaborators.write and songs.write.
- Role, revocation, and leave operations require sharing.write and destructive.write. The owner performs member role/revoke actions. Leave selects the authenticated actor and can decline that actor's pending invitation; it never accepts a supplied member identity or transfers ownership.
- Invitation acceptance selects the authenticated actor from the server subject and accepts no recipient or invitation identity supplied by chat.
- Coverage repair reviews exact eligible, excluded, and source-owner-blocked Track IDs. It does not silently create coverage or bypass source-owner requirements.
- Share import retry applies only to an existing authorized child share. It reports queued or failed remote delivery and never claims that local files were imported. Local confirmation remains a trusted app action.

Call `execute_bucket_member_action` only with the returned plan ID, trusted app approval ID, and original idempotency key. The executor rejects plans from every other action family. After execution, read the operation and the Bucket/member status before reporting persisted membership, queued delivery, partial delivery, or an unknown outcome. Reuse the original key after an unknown response; do not prepare or send a second invitation.

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

### One selected collaborator and existing shares

Resolve the exact Track UUID. Use `get_collaborator_share_status` to read its owner-scoped assignment IDs and current versions. `prepare_collaborator_share.recipient_id` is that Track assignment UUID. Prepare only the selected assignment and requested role. Open the returned trusted app review handoff. Use `execute_share_action` only after the app records approval for that exact plan. `share_with_collaborators` retains its all-collaborator behavior. Never use it for a one-recipient request.

Use `list_public_shares` and `get_public_share` for public link properties. Prepare supported patches with `prepare_public_share_update`. Omitted fields stay unchanged. Use separate revocation plans for public links and collaborator shares. They have different IDs and effects. Unsupported password or local file selection changes use the trusted app. Do not recreate a link to simulate an update.

### Friends and Track Offers

Friend designation, credits, public links, direct folder shares, and Track Offers are separate authorities. `prepare_friend_designation` changes the one-way roster designation. It does not authorize a send. Read the plan's existing audience-rule effects before review. A separate `prepare_track_offer` freezes the Track and resolved recipient account UUID for an audition-only Offer. The Offer recipient UUID is distinct from a Track collaborator assignment ID. The domain does not support an MCP message field.

Use `list_track_offers` with an explicit incoming or outgoing direction and follow every page. Use `get_track_offer_relationships` for the separate relationship projection. Prepare activation, decline, revocation or a sender block with the exact Offer/account UUID and current state. Activation also needs sharing authority. Revocation that ends accepted access needs destructive authority. Sender blocks affect Offers only. They do not revoke independent accepted sharing.

`get_track_offer_content` can read authorized bounce feedback. `get_track_offer_playback` returns the available trusted app playback/feedback handoff. A handoff does not mean playback started. Remote records and completed transfers do not prove local files exist. Recipient activation can require the native app or a healthy provider. Report the exact blocker and receipt state.

For a compound request such as "make Ari a Friend and offer Neon Arc", resolve each identity, prepare two separate plans, and return both app review handoffs. Do not use the first plan as approval for the second. On a later turn, refresh exact identities and plan state. Chat confirmation cannot replace either app approval.

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

### Structured reads and merge review
- `list_track_fields`
- `query_tracks`
- `assess_potential_merges`
- `preview_track_group_join`

### Songs and tracks
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
- `create_bucket_v2`
- `get_bucket_hierarchy`
- `set_bucket_parent`
- `update_bucket`
- `delete_bucket`
- `list_bucket_members`
- `list_bucket_invitations`
- `get_bucket_sharing_status`
- `get_bucket_property_status`
- `prepare_bucket_member_invite`
- `prepare_bucket_member_role`
- `prepare_bucket_member_revocation`
- `prepare_bucket_invitation_acceptance`
- `prepare_bucket_leave`
- `prepare_bucket_member_coverage_repair`
- `prepare_bucket_share_import_retry`
- `execute_bucket_member_action`
- `prepare_set_bucket_tags`
- `prepare_set_public_page_bucket_visibility`
- `prepare_set_bucket_friends_audience`
- `execute_bucket_property_action`

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
- `list_public_shares`
- `get_public_share`
- `get_collaborator_share_status`
- `prepare_collaborator_share`
- `prepare_collaborator_share_revocation`
- `prepare_public_share_update`
- `prepare_public_share_revocation`
- `execute_share_action`

### Friends, Track Offers and trusted operations
- `list_track_offers`
- `get_track_offer_relationships`
- `get_track_offer_content`
- `get_track_offer_playback`
- `prepare_friend_designation`
- `prepare_track_offer`
- `prepare_track_offer_activation`
- `prepare_track_offer_decline`
- `prepare_track_offer_revocation`
- `prepare_track_offer_sender_block`
- `execute_track_offer_action`
- `execute_friend_action`
- `get_mcp_action_plan`
- `get_mcp_operation`
- `cancel_mcp_action_plan`
- `cancel_mcp_operation`

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
- `search_song_activity`

## Response Formatting Rules
1. Summarize results in natural language instead of dumping raw JSON.
2. Group output by song, collaborator, bucket, or share as appropriate.
3. Use counts: "Found 12 comments across 4 songs."
4. Prefer relative dates when the exact timestamp is not important.
5. Surface actionable items such as missing sharing, overdue work, or incomplete todos.
6. Offer a concrete next action when the user is clearly mid-workflow.

## Authentication
On first use, the client will prompt the user to authenticate with The Library in the browser. Tokens are scoped and stored by the client and server OAuth flow.

## Permissions
Some operations require permissions enabled in The Library under `Settings > AI Agent Access`:
- `sharing`
- `destructive_operations`
- `bulk_operations`
- `export_data`
- `edit_songs`
- `read_library`
- `read_collaborators`
- `comments_todos`
- `read_sharing` with `sharing.read`
- `edit_collaborators` with `collaborators.write`
- `read_rights` with `rights.read`
- `manage_rights` with `rights.write`

The five new groups default to OFF. Enabling a group does not add its scope to an existing OAuth grant. The user must give fresh consent through the trusted authorization page. Do not change permissions or reconnect on the user's behalf.
