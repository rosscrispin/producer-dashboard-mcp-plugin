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

Native commands bind the current owner, client, grant, authorization nonce, environment, device, root generation, session and handler version. Recheck that binding when consuming a file handle and when returning a saved receipt. An account switch, changed root, revoked grant or expired context requires a new valid plan or consent.

Use the advertised native chooser to select a location. The human selects it in the trusted app. `start_local_inventory` and `continue_local_inventory` return bounded local evidence and opaque handles. Complete the snapshot before claiming complete local contents. Database metadata and transfer delivery state do not prove local files.

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

Undo and redo retain the canonical receipt and expected current versions. Reject superseded or external effects that cannot be safely reversed. Diagnostics use the fixed redacted catalogue and exact reviewed hash. Paths, credentials and raw private logs stay out of chat results.

## JEV and native Track Join

A JEV candidate shortlist is evidence for review, not permission to merge. Keep the frozen scan IDs, exact source and target Track IDs, metadata conflicts and access state. Native Join needs its own current capability, local/server plan, trusted review and verified recovery backup.

Execute through the canonical lease and file journal. Report each source's committed or pending state. Read operation and recovery status after an interruption. Never delete or recreate owned files from a database row or classifier confidence.

## Account and provider handoffs

Use redacted readers for account, billing, usage, grants and referral state. Identity, security, payment, deletion and provider changes use the exact trusted handoff and provider page. The human completes authentication, security or financial steps. Do not mint credentials, impersonate completion or weaken the handoff.

Retain handoff expiry, state, original key and cancellation version. Only an authoritative provider or signed native receipt establishes completion. Account export status is separate from possession of an exported file.
