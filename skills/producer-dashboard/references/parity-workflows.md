# Library hosted and desktop workflows

Use the current connection's tool schema. This guide describes source contracts. It does not establish deployment or account acceptance.

## Shared action lifecycle

For a common action family, prepare the exact targets and versions first. Read the returned plan. Complete trusted app review when that plan requires it. Execute the saved plan with its original UUID idempotency key. Read its original operation after a pending or unknown result. Do not start the same effect with a second key.

Preparation must not require an approval that can only be created after the plan exists. The accepted common approval binds the exact reviewed effect. Never put a fabricated approval or arbitrary action allowlist into business arguments. Fresh direct playlist and supported direct metadata plans retain their existing direct execution contract.

A successful preparation, queued command or provider handoff is not a completed effect. Report partial results and the remaining work.

## Reads and definitions

Use structured Track fields, shared-reader scope and bounded native inventory according to the current tool schema. Keep `complete`, truncation and cursors separate from empty results. Never treat foreign or unavailable IDs as zero activity. `todo_state="no_open"` differs from `todo_state="never"`; complete and linked feedback states have their own filters.

Definition, taxonomy, saved-view and artwork actions use stable IDs and expected versions. Deleting or replacing a referenced definition must follow the returned dependency plan. Selected artwork uses a verified opaque asset handle and its allowed type and size. Do not substitute a URL or local path.

## Native setup and inventory

Use `list_mcp_devices` and `begin_mcp_device_pairing` for one exact capability set. Keep the original pairing key. The human completes consent in The Library. Read `get_mcp_device_pairing` before proceeding. Expired or unavailable pairing does not authorize a command.

Initial account authentication remains a browser OAuth flow. For the current desktop connection flow, open **The Library desktop app → Settings → MCP access → Connect MCP**, select the exact pending request for this client, and complete the trusted native Connect review. Only the paired result returned by that review authorizes native commands. A chat confirmation, `approved` value, pairing ID, or empty device list is not consent. Desktop versions without the Connect MCP entry continue through the advertised `review_url` or `desktop_handoff_url` returned by `begin_mcp_device_pairing` and the same exact pairing checks.

Native commands bind the current owner, client, grant, authorization nonce, environment, device, root generation, session and handler version. The device and pairing readers publish the server-owned `client_instance_id`, `root_id`, `root_generation`, `session_id`, and `session_version` tuple. Preserve it exactly. A missing field is unavailable, and a null client instance cannot authorize a paired command. Recheck that binding when consuming a file handle and when returning a saved receipt. An account switch, changed root, revoked grant or expired context requires a new valid plan or consent.

Use the advertised native chooser to select a location. The human selects it in the trusted app. `start_local_inventory` and `continue_local_inventory` return bounded local evidence and opaque handles. A queued inventory result is recovered with `get_local_inventory_operation({ operation_id, idempotency_key })` using the exact original operation ID and UUID key. This reader does not start another scan or replay the command. It checks the original account, grant, device, root, session, action and current authority binding. A missing, stale or mismatched receipt remains unresolved. Complete the snapshot before claiming complete local contents. Database metadata and transfer delivery state do not prove local files.

## Import, assignment, open and voice memos

Native import uses the existing import coordinator. Choose files with the native selector or a current inventory handle. Plan selected-file, external-folder or assignment work, then execute its exact reviewed plan. Carry each selection, grouping choice, destination and collision decision across the steps. Preserve originals and recovery journals.

Import review choices update the native review with a compare-and-set version. Applying the review is a separate effect. A canonical owned Track needs a locally verified bounce or project. Removing an owned Track must use the canonical archive/removal flow and an exact journal receipt.

Open and reveal accept verified handles, not arbitrary filesystem paths. Voice-memo listing is owner scoped and paginated. Memo edits require the current memo version. Voice metadata edits do not upload or create local audio.

## Embedded metadata and measured analysis

Read embedded file metadata only through a current native handle. Audio analysis returns measured values with local file identity, revision, handler and provenance. Do not substitute guessed BPM, key or duration for measured output.

Plan, run and apply are separate steps. Applying metadata needs the action's Track write authority. Batch actions also need bulk authority. Keep every batch item result and recover the original batch or operation after cancellation, interruption or response loss. A measured analysis does not mean its values were applied to the Track.

## Backup and restore

Use the canonical Library Backup service and trusted native folder selection. A backup is complete only after independent decoding, positive byte evidence and receipt checks. Retain its opaque artifact handle and exact binding.

Preview restore against current inventory and versions. Keep the exact restore plan, choices and hash. Execute only after required review. Preserve originals and recovery evidence. Schedule reads and updates use their own current backup authority; changing a schedule does not prove a later backup ran.

`get_local_backup_schedule` returns either the signed schedule or the original pending operation. If it returns an operation ID, read it with `get_library_backup_operation({ operation_id, idempotency_key })` using the original UUID key. If the schedule read has no operation ID, repeat that same schedule read with the original `device_id` and key to recover the existing command. Neither recovery path sends another native command. Report the signed state and receipt separately from the schedule effect.

Use the updated native app with a bounded backup schedule read. An overdue read returns `expired`, `needs_attention`, `command_expired` and no schedule result. A signed result-free expiry failure records failure only. Completed receipts remain available for recovery. Backup mutations keep their existing unknown-outcome rules; read expiry is not permission to repeat a backup write. A native timeout cannot establish the current schedule. The folder chooser, completed signed receipt and physical backup checks remain required for later effects.

## Automations

Read the automation catalogue before choosing triggers or effects. Work through draft, version, publish and activation. Keep draft versions and the frozen effect selection. Dry tests and live tests are distinct; a dry result does not establish delivery or a file effect.

Cancel an action plan with its current `expected_version`. Read the original run and operation before a retry. Report pending, failed, paused and partial states accurately. Financial, access and native effects retain their domain confirmation and authority.

## Public Pages, profile and preferences

Edit private drafts with exact versions. Publication uses the canonical publishing validator and a verified published projection. Verify the public result separately from the draft save. Do not expose private or unpublished content through a public handoff.

Profile, Public Page and licensing actions have different scope tuples. The saved action selects the applicable tuple at execution. Destructive settings need their additional destructive authority. Device preview and clipboard actions require the paired UI capability.

## Licensing, credits and royalties

Preserve contributor roles, split percentages, recipients, terms and source IDs. A roster assignment is separate from file access and an invitation. Provider handoffs do not establish payment, acceptance or delivery.

Royalty reads keep currencies and exact decimal values separate. Read the deletion preview before preparing report deletion. Corrections and accepted insight proposals use the canonical financial service and durable audit receipt. The human supplies the required trusted financial review. Never infer a financial approval from a chat message or a prepared plan.

## Paired UI and player

Use the current paired renderer and client instance. Player changes require the current player revision. Selection, saved-view application, playlist opening, clipboard and diagnostics use closed application commands. They are not arbitrary scripts or navigation URLs.

Local playback and local queue entries require verified local-file authority. Public-share and Track Offer playback use their separate current recipient context and media handoff. Do not fall back to local audio if remote authority fails. A returned media handle is not audible playback; verify the player start receipt and let the human confirm sound when needed.

`get_library_player_state` queues a signed read for the exact paired binding. Retain its `operation_id` and original UUID key, then call `get_paired_ui_session_operation` with both until the read completes. The reader can recover the native receipt and, only when the native reader reports not found, the matching generic operation ledger; it validates the original key and never sends the player read again. Treat queued, accepted, claimed and running states as pending. Report player fields only from the completed signed result, and keep audible confirmation as a separate human check.

The native player read is bounded by the current desktop client. Use an updated native app that implements this deadline; the hosted tool and plugin documentation do not add the deadline to an older app, and this guide does not claim live account acceptance. A read that reaches its deadline returns `command_expired` with no fresh player result. Preserve the original `operation_id` and UUID `idempotency_key`, and recover that same operation rather than enqueueing a replacement. Do not prepare play, pause, seek, volume, or queue controls until the read returns a completed signed result with the current `player_revision`. If an operation response includes `complete: false`, treat it as incomplete. Older responses may omit this optional flag; omission is backward-compatible and does not make a pending or missing result complete.

Undo and redo retain the canonical receipt and expected current versions. Reject superseded or external effects that cannot be safely reversed. Diagnostics use the fixed redacted catalogue and exact reviewed hash. Paths, credentials and raw private logs stay out of chat results.

## JEV and native Track Join

A JEV candidate shortlist is evidence for review, not permission to merge. Keep the frozen scan IDs, exact source and target Track IDs, metadata conflicts and access state. Native Join needs its own current capability, local/server plan, trusted review and verified recovery backup.

Execute through the canonical lease and file journal. Report each source's committed or pending state. Read operation and recovery status after an interruption. Never delete or recreate owned files from a database row or classifier confidence.

## Account and provider handoffs

Use redacted readers for account, billing, usage, grants and referral state. Identity, security, payment, deletion and provider changes use the exact trusted handoff and provider page. The human completes authentication, security or financial steps. Do not mint credentials, impersonate completion or weaken the handoff.

Retain handoff expiry, state, original key and cancellation version. Only an authoritative provider or signed native receipt establishes completion. Account export status is separate from possession of an exported file.
