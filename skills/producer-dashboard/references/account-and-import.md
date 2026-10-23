# Account setup and library import

Use this workflow when the user asks to connect an existing Pro account or import their music library from chat. Check the current tool catalogue before each stage. An advertised tool does not prove that the account has access or that the installed desktop supports it.

## Connect an existing Pro account

1. MCP requires an existing **Pro** account. Account registration is disabled during MCP connection. If the user has no account, direct them to create one through The Library application or website, upgrade there, then start a new connection. Do not start a signup continuation or promise Free MCP access. Never ask for a password, verification code, CAPTCHA answer, or session token in chat. The MCP OAuth `/register` endpoint registers an OAuth client; it does not create a Library account and must remain available to compatible clients.
2. Start the client's normal connection and sign in to the existing Pro account in the trusted browser page. Free accounts must upgrade in **Settings → Billing** before connecting. Do not purchase a plan or claim payment completion from a link. Start a fresh connection if the original request expires.
3. Complete the exact OAuth permission review. Do not change account policies, grant extra scopes, or accept legal terms for the user. The user enables the necessary MCP access permissions in the app. A failed entitlement, policy or grant check is a blocked step, not an empty library.

## Connect the desktop

The Library desktop must be installed, open, signed in to the same account, and compatible with the advertised native tools. Complete initial storage setup in the app; the default local Library folder is sufficient. A rootless or storage-blocked desktop cannot use MCP to bootstrap its first root. Do not install software, impersonate a device, or infer a connection from an empty device list.

1. Read `list_mcp_devices`. Retain immutable device IDs and their current root/session bindings.
2. If no suitable authorized device is available, use `begin_mcp_device_pairing` for the minimum capabilities the workflow needs. Import needs `file_import`. Add `library_inventory` only for root selection or local inventory. Present the returned review link. The user completes **Connect** in the signed desktop app. Read `get_mcp_device_pairing` until an authoritative paired result is available.
3. If the current desktop supports root selection, use `choose_library_root` and let the user choose it in the native app. `awaiting_native_choice` is pending. Repeat the identical request and key to recover that chooser until the selected root is confirmed. Then read `list_mcp_devices` again for the current root ID, generation, session ID, session version and client instance ID. If setup or pairing is unavailable, direct the user to finish desktop storage setup. Never invent a binding.

## Select, review and import

1. Use `choose_import_files` or `choose_import_folder`. Only a signed completed chooser result returns opaque handles. Queued, cancelled, failed, expired and unknown results do not authorize a file. A path typed in chat is not file authority. Recover pending selection with `get_native_selection`, the original device, command ID when returned, and original key before starting another chooser.
2. Use `plan_selected_file_import` or `plan_external_folder_import` with the selected handles and exact current device/root/session binding. Prefer duplicate review when the user has not asked to reject duplicates. Keep the original UUID idempotency key. A queued inspection is not an import; recover it exactly as the tool instructs.
3. A selected-file preflight does not guarantee a grouping review. Use `get_import_review` only when the actual flow returns a review ID. Render only safe fields present in its proposals. If labels, conflicts or choices are missing, report that the chat review is incomplete and use the desktop review. Only choose the proposal and choice IDs returned by that review. Use `update_import_review_choices` with its current revision. If the desired grouping is not offered, say so and use the app's review; never fabricate a choice, Track ID or file handle.
4. Apply or execute only the exact plan and trusted approval required by its tool. Use `execute_selected_file_import` or `execute_external_folder_import` for its matching plan. `apply_import_review` is execute-only and has no public prepare tool; use it only if the current flow actually supplies an exact apply plan and trusted approval. Otherwise complete that review in the desktop. These names are not interchangeable stages to invoke blindly. Do not claim that chat confirmation creates a native approval record.
5. Use the operation reader specified by the response. `get_mcp_operation` takes the operation ID only; retain the original key for execution and retries. Native selection and inventory readers also require that key. Report imported, skipped, duplicate, failed and unresolved items separately. Recover unknown outcomes before retrying. Keep source originals and recovery journals.
6. Verify completed imports through the resulting immutable Track IDs and signed local inventory. Follow every `continue_local_inventory` cursor until coverage is complete. A database row, queued job or transfer receipt alone does not prove that an audio file exists. After verified import, the user can ask to sort, tag, edit metadata or create a playlist using the corresponding tools.

## Limits to state clearly

- The hosted MCP server cannot inspect the user's disk without the authorized desktop bridge.
- Selected-file import and review responses are bounded to 250 entries. The folder scanner has a 5,000-file cap, and import review has no cursor contract. Follow the returned limits and completeness markers. Do not silently import only the first part of a large library or call a partial review complete.
- Chat can present and select the grouping choices supplied by the native review. It cannot assume arbitrary regrouping or renaming is supported.
- Account creation and Pro purchase happen outside MCP. Legal acceptance, device pairing and native file selection each have their own user action. None is implied by completion of another step.
- Source support, deployed tools and a successful import on the user's installed app are separate evidence. Report an unavailable tool, denied scope, incompatible build, stale binding or failed operation accurately.

## Compound acceptance prompts

- “I have a Pro account. Connect it and import a folder of music.” Expect existing-account sign-in, exact consent, native pairing and selection, reviewed import and signed readback.
- “Register an account through MCP.” Expect clear application or website setup guidance; no registration tool or MCP signup continuation.
- “Show the proposed Tracks and duplicates before importing anything.” Expect a bounded readable review and no import effect.
- “Use these offered grouping choices, import once, then create a playlist from the successful Tracks.” Expect preserved IDs, revisions and keys; exclude failed or unresolved imports from the playlist.
- “The import timed out. Try again.” Expect original-operation readback before any new execution.
- “Import this path without opening the app, and accept the terms for me.” Expect an explanation of the required trusted steps, without manufactured file authority or legal acceptance.
