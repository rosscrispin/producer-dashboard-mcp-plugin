---
name: producer-dashboard
description: The Library MCP — authorized music-library tools for tracks, private playlists, Buckets, collaborators, selected-recipient sharing, Friend Track Offers, comments, To-Dos, share pages, automation, account handoffs, royalty work, and connected desktop file workflows.
---

# The Library MCP

## Overview
The Library MCP connects the agent to a music production management app. It provides tools for Tracks, playlists, Buckets, collaboration, sharing, To-Dos, automations, definitions, Public Pages, royalties, account handoffs and connected desktop workflows. Use the current tool catalogue to check which actions are available to this connection.

## When to Use
Use this skill for authorized Library data and connected desktop operations. This includes native file import, metadata, backup, playback and Track Join when the current connection advertises those tools. Use repository engineering guidance for product implementation. Do not use library tools as arbitrary filesystem access.

## Working Rules
- Resolve mutable names to stable IDs before updates or destructive actions.
- Treat names, emails, and labels as lookup inputs, not record identities.
- Carry the immutable Track UUID across follow-up calls. Map it to each tool's exact input field: `id`, `track_id`, or `track_group_id`. Bucket, collaborator, tag and share UUIDs are separate identities.
- Do not dump raw JSON when summarizing results for the user.
- Keep the exact returned IDs and fields for the current task in context. When the user says “those”, “the same”, or “only these”, bind the next step to that frozen set, even if a new criterion such as priority or stage is added. Do not broaden the set from a fresh library search.
- Treat references such as “of those”, “all of those”, “only these”, and “exclude” as refinements of the frozen selection. Treat explicit whole-library language such as “all my tracks”, “search the library again”, or “refresh the results”, or a new subject, as a replacement or new task. If the scope is unclear, ask before acting. An unrelated detour does not discard a frozen selection. Keep it as inactive context when another task starts, and resume it if the user explicitly returns to it.
- Preserve every requested field and option across compound calls, including dates, titles, permissions, ordering, filters, and selected IDs. Do not silently substitute defaults or drop an argument on a later call.
- Before the first `query_tracks` call in each conversation, call `list_track_fields`. Use that catalogue as the allowlist for `fields`, `filters`, and `group_by`, including custom UUID paths. `query_tracks` automatically returns each row’s `id`; keep that immutable Track UUID and use each later tool's exact parameter name. Never request an unadvertised `track_group_id` field.
- If a structured query reports an unknown or unsupported field, treat the result as unavailable, refresh or consult the field catalogue, correct the field once, and retry at most once with advertised paths. Never retry a guessed or unadvertised field. Transport, authentication, and permission failures remain unavailable; do not retry them or report them as zero results.
- Complete all required pages before claiming complete IDs or using a result set for a write. A successful `query_tracks` response may establish an exact `total_count` or grouped `groups` result without fetching every result page; fetch every page when individual IDs or the complete list are required. A failed or incomplete read is unknown, not an empty result. Before any write, refresh the exact target IDs, check current values and permissions, and require the client’s confirmation policy where applicable.
- Use only capabilities advertised by the current tool catalogue. Do not invent approval, native desktop actions, or successful mutations. `preview_track_group_join` is a hosted review step. Full native Join requires the separately advertised native plan, trusted review, execution and recovery tools.
- New share, Friend and Offer tools need their exact additional consent and app permission groups. Existing grants stay unchanged. A denied action does not authorize a grant update.
- For recipient and access changes, use `prepare -> trusted app review -> execute -> status`. Only the app can issue approval. Chat confirmation, an `approved:true` value, and possession of a plan ID are insufficient. The idempotency key is a UUID. Use the returned plan ID, approval ID and original idempotency UUID. Cancel or refresh a stale plan. Read status after an unknown outcome before retrying.
- `add_collaborator_to_song` assigns one Track through the central roster rules. It persists splits but does not share files or send an invitation.
- `update_bucket(due_date=null)` clears the Bucket deadline. The current API does not clear inherited Track deadlines.
- Shared Bucket member changes always use `prepare -> trusted interactive app review -> execute_bucket_member_action -> status`. Chat text, an `approved:true` field, or a plan ID never substitutes for app approval.
- Private playlist writes use `prepare_playlist_* -> execute_playlist_action -> get_mcp_operation`. Fresh plans in this family execute directly under the authorized OAuth grant; they do not need an extra trusted app review or `approval_id`. Keep the ordered Track UUID set, opaque playlist version, linked-share effects, and original idempotency UUID from the returned plan. The server-owned direct marker decides whether a plan is fresh and direct. Legacy plans without that marker still require their returned `approval_id`; never forge or add an approval reference to a direct plan. Client confirmation policies remain controlled by the connected client.
- `list_playlists` and `get_playlist` read internal playlist records. A playlist is separate from a public share link. Follow item cursors before claiming complete membership, and treat unavailable items as remote state without claiming local files.
- `get_playlist_file_options` reads one owned playlist Track's safe opaque file choices. It requires both `sharing.read`/Read sharing and `library.read`/Read library consent and returns only choice IDs, revisions, kinds, names, sizes, downloadability, and the default marker; it never returns paths or credentials.
- `get_playlist_share_file_options` reads safe opaque choices by owned share UUID and member Track UUID. Use it for unlinked share pages. Keep the returned share revision and each file kind and revision for updates. Artwork readback distinguishes bucket artwork from custom share artwork. Unknown stored filters are preserved by updates.
- Private playlist create, membership changes, layout changes, and deletion require fresh `organization.write` consent and the `organize_library` permission. Creation also publishes an unlisted stream-only live URL, so it requires `sharing.write` and the `sharing` permission. Requests containing more than one Track also require `bulk.write` and `bulk_operations`; deletion adds destructive authority.
- Use `prepare_playlist_share_create`, `prepare_playlist_share_update`, and `prepare_playlist_share_revoke` for playlist links. Share operations require `sharing.write`; linked playlist mutations are checked again by the application. Password input is transient and never report it back.
- Playlist-share inputs use the closed action contract. Create is `{playlist_id, expected_version, parameters, idempotency_key}`; update is `{share_id, expected_version, patch, idempotency_key}`; revoke is `{share_id, expected_version, idempotency_key}`. Create `parameters` and update `patch` allow only `title`, `page_description`, `view_mode`, `expiration_days`, `artwork`, `background`, `column_visibility`, `track_information`, `download_permissions`, `track_files`, `metadata_receipts`, `track_order`, `approval_settings`, `password`, and `visualizer`. Do not send `private_binding`, owner identity, raw URLs or paths as file selectors, or other internal fields. File selectors use opaque `{id, revision, kind}` handles and metadata receipts remain server-protected.

## Continuous compound tasks

Plan compound requests as `discover -> constrain -> verify -> act -> summarize`. Apply the connected client's confirmation policy and any trusted app review required by the specific action. Keep the IDs and scope from each successful read. Re-read before a mutation because another turn, user edit, or detour may have made the selection stale. If the user starts another task, retain the old selection as inactive context and resume it only when the user explicitly returns; revalidate it before any write.

The same task may be requested in one turn or over several turns:

```text
One turn: “Find finished tracks with no open To-Dos, keep only high-priority results, and after I confirm set their due date to 2026-10-31.”

Several turns:
1. “Find finished tracks with no open To-Dos.”
2. “Of those, keep only high-priority tracks.”
3. “Set their due date to 2026-10-31.”
```

In both forms, identify the finished-track IDs. Use `search_song_activity(candidate_track_group_ids=[...], todo_state="no_open")` for the no-open-To-Do condition. Refine those returned IDs with `query_tracks(track_ids=[...], filters=[{field:"priority",operator:"eq",value:"high"}])`. Keep the final frozen set and refresh its current revisions before the write. Apply the client's confirmation policy and wait when the user requests confirmation. Use the versioned batch action for a supported shared patch across the selected set. Complete its required trusted review before execution. If the user instead says “find all high-priority finished tracks again”, start a fresh scope. Never claim that a native action exists because a user’s multi-step request implies one.

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

Owned Tracks are created or removed through the canonical native import and removal services. A database row alone does not establish or remove an owned file. Use the exact native plan and receipt; preserve archived-state and owner requirements.

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
5. Use the advertised native Join flow: complete the current-device scan, prepare and inspect the exact Join plan, open the trusted desktop review, execute only after app approval, then read the operation and recovery state. A hosted preview or preparation result is not a completed Join. The paired desktop must remain the authority for local files; do not treat this as arbitrary filesystem or remote execution.

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
5. get_track_bucket_memberships(track_id=<track_id>) for each selected Track
6. add_track_bucket_membership(track_id=<track_id>, bucket_id=<bucket_id>, expected_membership_version=<current>, idempotency_key=<new UUID>)
7. Complete each required trusted review and execute_track_bucket_membership_action with the original key
8. get_track_bucket_memberships and get_track_edit_action_operation -> verify saved memberships and delivery state separately
9. Summarize the additions and any failed or pending IDs
```

### Versioned Track edits

Use these tools only when the current connection advertises them. A plugin update does not expand an existing OAuth grant.

- Use `get_track_metadata_state` with the immutable Track UUID. Keep the exact returned `version`. A `legacy:null` revision is valid. Due dates can be timestamp values. Preserve lyrics and notes exactly, including whitespace.
- `clear_track_due_date` uses `{id, expected_version, idempotency_key}`. `update_track_lyrics` and `update_track_notes` use `{track_id, expected_version, lyrics|notes, idempotency_key}`. Null clears the selected value. Lyrics are limited to 40,000 characters and notes to 10,000. NUL is invalid. Send exact text without trimming, truncation or line-ending changes. Report a validation limit if the requested text cannot be submitted. These plans use `songs.write` and `edit_songs`. Execute with `execute_track_metadata_action({plan_id,idempotency_key})`. Fresh direct plans require no extra app review or approval reference.
- Use `get_track_bucket_memberships` to read the complete Bucket UUID set, current `membership_version`, and locked memberships. It needs `library.read`, `projects.read`, and `read_library`.
- Use `add_track_bucket_membership` for an additive membership. Use `remove_track_bucket_membership` with exactly one `bucket_id` or `clear_all:true`. Use `set_track_bucket_memberships` only for an explicit replacement request. Each write needs the current `expected_membership_version` and one new UUID key. Read membership state again after a committed relation change before the next edit to that Track. Multiple Bucket memberships are preserved by addition. Locked memberships cannot be removed by a replacement or clear.
- Membership preparation needs `songs.write` and `projects.read`, with `edit_songs` and `read_library`. The plan can also require sharing authority when delivery changes. Open the exact trusted app review. Execute with `execute_track_bucket_membership_action({plan_id,approval_id,idempotency_key})` using the app-issued approval and original key. Report saved memberships separately from pending, failed or unknown propagation. A saved relation does not prove a collaborator received files.
- Use `prepare_track_metadata_batch` for 1–50 unique Track UUIDs and one supported patch. Supply `expected_versions` with exactly one current revision per selected UUID. It adds `bulk.write` and `bulk_operations` to song edit authority. Keep all requested fields and the full selection. Do not silently drop stale or inaccessible Tracks. Use the returned per-Track results to report each outcome.
- The retained `batch_update_songs` needs `songs.write` and `bulk.write` scopes plus the `edit_songs` and `bulk_operations` permissions. Report its actual `committed_track_ids`, `uncommitted_track_ids`, and counts. A partial or empty result is not full success. An invalid receipt leaves the outcome unknown; inspect the selected Tracks before retrying.
- Execute a batch with `execute_track_metadata_batch({plan_id,approval_id,idempotency_key})` after its exact trusted review. A stale unexecuted plan must be replaced: re-read the same selected IDs and authority, then prepare a new plan with a new logical key and exact revisions. If scope must change, make that decision explicit before preparing it. If execution returned per-Track results, report committed, stale and denied IDs separately. Do not retry committed IDs or the whole batch. Do not split a reviewed batch into individual writes to avoid its required authority.
- Read plans with `get_track_edit_action_plan`. After a lost execute response, read that original plan to obtain its `operation_id`. Then use `get_track_edit_action_operation({operation_id,idempotency_key})` with the original key. Inspect operation status and any before/after results. If no operation is available, keep the outcome unresolved and use only the same plan and key for an allowed retry. Do not retry when the authority or plan state is unavailable. Never generate a second key to resolve a timeout. `cancel_track_edit_action_plan` cancels a pending plan and does not undo a committed edit.
- These are database metadata and relation operations. They do not create, move, import or delete owned files. Office-dependent device pairing, real-file transfer and audible playback acceptance remain separate checks.

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
- The prepared invitation freezes the resolved recipient UUID and account binding. If either binding changes, refresh the exact plan before any membership, Observer, notification or delivery effect. Do not use a matching display name as replacement authority.
- Role, revocation, and leave operations require sharing.write and destructive.write. The owner performs member role/revoke actions. Leave selects the authenticated actor and can decline that actor's pending invitation; it never accepts a supplied member identity or transfers ownership.
- Invitation acceptance selects the authenticated actor from the server subject and accepts no recipient or invitation identity supplied by chat.
- Coverage repair reviews exact eligible, excluded, and source-owner-blocked Track IDs. It does not silently create coverage or bypass source-owner requirements.
- Share import retry applies only to an existing authorized child share. It reports queued or failed remote delivery and never claims that local files were imported. Local confirmation remains a trusted app action.

Call `execute_bucket_member_action` only with the returned plan ID, trusted app approval ID, and original idempotency key. The executor rejects plans from every other action family. After execution, read the operation and the Bucket/member status before reporting persisted membership, queued delivery, partial delivery, or an unknown outcome. Reuse the original key after an unknown response; do not prepare or send a second invitation.

A terminal source-owner entitlement stop remains stopped after an upgrade. Delivery requires a new entitled owner action. Keep saved access, notification handoff, provider acceptance, and local files as separate results. A delivery receipt does not prove notification inbox or settings management.

### Collaboration
Example: "Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"

```text
1. lookup_collaborator(email=...) or list_collaborators -> resolve collaborator
2. list_songs(stages=tree, limit=50) -> get song IDs
3. add_collaborator_to_song(...) for each target song
4. Summarize songs changed and any skips
```

### Exact collaborator and publisher properties

Read canonical fields and the saved revision with `get_collaborator_record` or `get_publisher_record`. Read the complete assignment set and aggregate revision with `get_track_collaborator_state`. It works for a Track with no assignments. Use `get_track_collaborator_properties` for one exact association. Credit role is separate from viewer/editor file access.

- Name and notes use `prepare_update_collaborator_metadata` or `prepare_update_publisher_metadata`, then `execute_collaborator_metadata_action`. Fresh direct plans need `songs.write` and `edit_songs`. They accept no approval reference and cannot change identity, rights, splits, Friend state or access.
- Full records use `prepare_create_collaborator_record`, `prepare_update_collaborator_record`, `prepare_create_publisher_record` or `prepare_update_publisher_record`. These use trusted review and `execute_collaborator_action`. Updates need the current revision. `ipi_number` is the publisher field; `ipi` is not an alias.
- Exact Track actions use `prepare_add_track_collaborator`, `prepare_update_track_collaborator`, `prepare_update_track_collaborator_splits` and `prepare_set_collaborator_export_permission`. Resolve the central collaborator UUID before addition and the Track association UUID before an update. Additions create no invitation or file grant.
- Splits are finite percentages from 0 to 100. Omission preserves values and zero is valid. Observer splits stay zero. A role change to Observer shows the split effects and needs rights authority. Export permission reconciles the existing member permission and sends no invitation.
- After an unknown response, read `get_mcp_operation` and the exact domain receipt with the original operation ID and idempotency key. Do not create a second plan for an uncertain write. A missing receipt does not prove that an in-flight request failed.

### Share Pages
Example: "Create a share page for my finished tracks with downloads enabled"

```text
create_share_page(stages="finished", title="Finished Tracks", download_bounces=true, download_stems=true)
```

For advanced shares, `create_share_page` also supports password, expiry, view mode, `download_split_sheet`, per-track permissions, explicit `track_files`, `track_order`, filter snapshots, column visibility, bucket artwork, and custom share images. Use `list_shares` to inspect those advanced fields after creation. The tool supports at most 250 distinct Track UUIDs. A larger selection fails without truncation. Bucket or stage selection requires Library read consent and permission and must resolve complete stable membership before creation. An unavailable page or changed selection is a failure; never publish a partial collection.

### Artists, labels and account PRO memberships

Use `list_artists`, `list_labels` and `list_pro_memberships` for the owned roster. Follow every cursor before reporting a full list. Restart a read if its saved roster revision changes. These readers require rights read authority. A Track display string is not an artist roster identity.

- Artist and label create/update actions use exact prepared plans and their OAuth grant. Execute with the original idempotency UUID. Do not supply an approval reference. Artist creation accepts a name only; profile fields use a separate update with `expected_updated_at`.
- Artist profile name changes show affected Tracks and preserve association IDs. Use the canonical social link fields and nullable profile fields. Global artist deletion is unavailable in the current UI.
- Read `get_track_artist_state` before adding or removing an artist credit. Select the exact artist or association UUID and returned relationship revision. Use a trusted reviewed plan for the association change. Removal also needs destructive authority. The last association removal clears the Track artist display.
- Label deletion uses the exact current version and trusted review. Active references block deletion. Preserve the label before-state in the operation receipt. Do not detach references to force deletion.
- PRO memberships belong to the account. They do not represent a publisher or external PRO verification. Create/update/delete use trusted reviewed plans and the current membership version. The primary switch is atomic. Deletion needs destructive authority and preserves the before-state receipt.

### AI provenance and collaborator merge

AI services remain central `ai_tool` records with no human account, email, Friend, share, access or split binding. Resolve that central UUID first. Read the current Track, assignment and provenance revisions before a mutation. Add and update accept only the closed provenance fields. Removal preserves the central AI record. All three use `execute_ai_collaborator_action` after trusted review.

Use `list_track_ai_collaborators`, `list_tracks_with_ai_collaborators` and `export_ai_provenance_for_tracks` for bounded owner-scoped evidence. Follow cursors and require complete coverage before a full answer. Export requires exact selected Track IDs and export authority. Failed or incomplete reads cannot become zero results.

Use `get_collaborator_merge_preview` with two exact owned central UUIDs. It returns current identity versions, complete reference fingerprints, counts and blockers. `prepare_merge_collaborators` refreshes and binds this evidence to one reviewed plan. Conflicting identity, owner credits, active access, Friends, Offers, Agreements, deals or other external references block the merge. Do not remove those references to force it. A merge does not send an invitation or modify files. Read the operation and exact receipt after a response loss. Reuse the original idempotency UUID.

### One selected collaborator and existing shares

Resolve the exact Track UUID. Use `get_collaborator_share_status` to read its owner-scoped assignment IDs and current versions. `prepare_collaborator_share.recipient_id` is that Track assignment UUID. Prepare only the selected assignment and requested role. Open the returned trusted app review handoff. Use `execute_share_action` only after the app records approval for that exact plan. `share_with_collaborators` retains its all-collaborator behavior. Never use it for a one-recipient request.

Use `list_public_shares` and `get_public_share` for public link properties. The retained `prepare_public_share_update` supports its published property allowlist. The modern `prepare_playlist_share_update` adds password, filters, layout, artwork, attribution and opaque file choices. Use each tool's current schema. Omitted fields stay unchanged. Use separate revocation plans for public links and collaborator shares. They have different IDs and effects. Local file preparation requires the trusted app. Do not recreate a link to simulate an update.

### Direct invitation lifecycle and Inbox/Outbox

Use `list_share_inbox` for incoming assignments and `list_share_outbox` for outgoing assignments. Continue through every returned cursor before reporting a complete list. Keep the cursor's filters, contact option and limit unchanged. A stale or incomplete result requires a fresh read. Do not turn a failed read into an empty Inbox.

Each item has a source kind. A direct Track assignment, Bucket child path and Bucket membership have different immutable IDs. Use `get_share_inbox_item` or `get_share_outbox_item` with its closed `share_reference` to refresh the exact item. Set the source kind and only the IDs required by that branch. Direct invitation actions reject Bucket items. Contact details require the optional collaborator read permission. Do not infer a recipient from a display name or copy an email into an execute target.

For direct assignments, use `prepare_accept_track_invitation`, `prepare_decline_track_invitation`, `prepare_leave_direct_share`, `prepare_resend_collaborator_invitation` or `prepare_revoke_collaborator_share`. Bind the assignment UUID, Track UUID and current revisions from the reader to one new UUID idempotency key. The older `prepare_collaborator_share_revocation` is a compatible alias for the same revoke action; its `recipient_id` is the assignment UUID.

Acceptance, decline and direct leave act as the receiver. Resend and revoke act as the Track owner. Direct leave preserves independent Bucket access. Owner revoke closes the selected recipient's direct, membership and Bucket-child paths to that same Track. Show the exact affected path IDs from the prepared plan. It preserves Bucket membership, other recipients, other Tracks and owner files. Revoke also requires destructive authority.

Open the exact trusted review when preparation requires it. Use `execute_share_action` with the original plan and key after the app records approval. Read `get_mcp_operation` after execution and `get_direct_share_delivery_status` for current delivery. Reuse the original operation/key after a response loss. An unknown resend outcome cannot authorize another send. Accepted access, provider delivery and local file readiness are separate results.

A compound request can be one turn or several turns: list incoming pending invitations, select one exact direct assignment, refresh its detail, prepare acceptance, complete the trusted review and read the operation result. Keep the selection fixed by UUID. Revalidate it after a detour or user edit. Report server acceptance without claiming local import or playback.

### Friends and Track Offers

Friend designation, credits, public links, direct folder shares, and Track Offers are separate authorities. `prepare_friend_designation` changes the one-way roster designation. It does not authorize a send. Read the plan's existing audience-rule effects before review. A separate `prepare_track_offer` freezes the Track and resolved recipient account UUID for an audition-only Offer. The Offer recipient UUID is distinct from a Track collaborator assignment ID. The domain does not support an MCP message field.

Use `list_track_offers` with an explicit incoming or outgoing direction and follow every page. Use `get_track_offer_relationships` for the separate relationship projection. Prepare activation, decline, revocation or a sender block with the exact Offer/account UUID and current state. Activation also needs sharing authority. Revocation that ends accepted access needs destructive authority. Sender blocks affect Offers only. They do not revoke independent accepted sharing.

`get_track_offer_content` can read authorized Bounce feedback. Include the exact `bounce_id` for comments. Keep the same filters and limit while following `next_cursor` until both `coverage.complete` and `feedback_coverage.complete` are true. A changed or malformed cursor requires a fresh read. `get_track_offer_playback` returns the available trusted app playback/feedback handoff. A handoff does not mean playback started. Remote records and completed transfers do not prove local files exist. Recipient activation can require the native app or a healthy provider. Report the exact blocker and receipt state.

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

### Public share activity and approval management

Use `get_share_activity` for an owned share. Its six public event types, time range and page size are closed and bounded. Follow `next_cursor` until coverage is complete. Restart after a stale cursor. Approval events and decisions are available through `get_share_approval_state`. Recipient contacts require collaborator read authority.

Recipient management and approval emails use exact prepared plans and trusted app review. Resolve share, recipient and approval item UUIDs. An approval item is selected with its Track UUID. Do not supply a path, bounce ID or recipient bearer token. Recipient management does not send mail or grant file access. A send targets one exact recipient. Read the returned operation and delivery receipt using both the operation ID and original idempotency UUID. A delivery reported as unknown must not be resent automatically. Native-only shares require the returned native handoff.

## Tool Reference

Use the connection's current discovery result for callable tools and exact input schemas. The packaged [catalogue snapshot](references/tool-catalogue.json) records the matching source contract. It does not prove deployment, permission consent, an installed handler or a successful account action.

For new hosted and native families, read [parity workflows](references/parity-workflows.md) for the relevant lifecycle. Keep exact stable IDs, versions and the original idempotency key. An unavailable handler is an unfinished operation, not a completed action.

### Recipient review and media

- Use `prepare_public_recipient_connect` for an exact public share UUID and fixed audience. Open its returned Library link. The recipient unlocks the page and selects Connect. Owner OAuth alone does not authorize recipient review.
- Read `get_public_recipient_context` with exactly one intent or context identifier. Follow every cursor from `list_public_recipient_tracks` before claiming a complete selection. Use `get_public_recipient_track` for exact files and review item revisions.
- Use `get_public_share_media` or `download_public_share_file` for the selected permitted file. Open the trusted Library handoff. A returned handle or link does not prove that playback started or a download completed.
- `submit_public_recipient_approval` uses the browser-granted review context, exact item/response revisions and the original UUID key. It needs no second owner review. After a lost response, read `get_public_recipient_operation`; do not submit a different key.

### Offer feedback

Use `submit_track_offer_feedback` for one authorized Offer bounce with current Offer and bounce revisions. Feedback requires `rights.read` and `comments.write`. A timecode is a point or a strictly increasing range. It does not activate access or import files. Recover a lost response with `get_track_offer_feedback_operation` and the original key.

### Connected app file services

Native actions require fresh `files.read`, `files.write`, `device.pair` or `session.control` consent as stated by the tool and the matching enabled account policies. Existing grants do not expand. Use `list_mcp_devices`, `begin_mcp_device_pairing` and `get_mcp_device_pairing`. The human completes exact capability consent in the Library app. Use the exact pairing review for `revoke_mcp_device_pairing`.

Read `get_native_file_sync_status` with a new UUID key. Recover its original command with `get_native_file_sync_operation`. Status comes from the selected app; server delivery does not establish local file existence.

Prepare pause, resume or retry with the exact project revision. Owner file preparation also requires the exact share revision. Recipient import takes an accepted direct assignment, accepted Bucket child or activated Offer identity and current access revision. The connected app uses its configured root. Never pass an arbitrary path or invent a local binding. Use an advertised native chooser handoff when selection is required; the human selects the location in the trusted app. Use `execute_native_file_sync_action` only with the saved reviewed plan and original key. Read the signed receipt before any retry. Project pause is not exact transfer cancellation. Do not report local files from an access or queued receipt.

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
Some operations require permissions enabled in The Library under `Settings > MCP access`:
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
- `organize_library` with `organization.write`

- `read_local_files` with `files.read`
- `manage_local_files` with `files.write`
- `pair_devices` with `device.pair`
- `control_session` with `session.control`

The additional groups default to OFF. Enabling a group does not add its scope to an existing OAuth grant. The user must give fresh consent through the trusted authorization page. Explain the exact missing scopes and app permissions. The human completes OAuth or native consent; the agent never fabricates approval.
