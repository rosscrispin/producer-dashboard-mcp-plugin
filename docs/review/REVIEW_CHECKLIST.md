# The Library MCP public review checklist

This checklist prepares a local review run for the remote The Library MCP server. It does not contain reviewer credentials, tokens, private account data, or a demo recording URL.

## Before the review

1. Confirm that the MCP endpoint is publicly reachable over HTTPS at `https://mcp.thelibrary.fm/mcp`.
2. Complete the OpenAI domain-verification challenge before submission. In the OpenAI submission dashboard, obtain the exact challenge token and publish it at `https://mcp.thelibrary.fm/.well-known/openai-apps-challenge` as required by the [OpenAI submission requirements](https://developers.openai.com/plugins/deploy/submission). Verify the challenge from the dashboard before continuing. Do not commit the token to this repository.
3. Use a dedicated live The Library reviewer account. It must be accessible without MFA, email or SMS verification, magic-link sign-in, or a private-network connection. Do not use a personal account or an account containing private customer material. These access conditions follow the [OpenAI remote MCP review requirements](https://developers.openai.com/plugins/deploy/app-review).
4. Confirm that the account has a small, disposable library with at least:
   - one track in the `tree` stage;
   - one finished track;
   - one bucket named `Releases`;
   - one collaborator, comment, and to-do if those workflows are being demonstrated.
5. Enable only the permissions needed for the case being run. The read cases need `read_library`. The stage update needs `edit_songs`. The share-page case needs `sharing`. The split-sheet case needs `export_data`.
6. Connect Dropbox for the share-page case. The share-page workflow requires both the connection and the `sharing` permission.
7. Confirm that the OAuth consent page identifies The Library and that the authorization dialog uses the same product styling as the normal sign-in dialog.
8. Reconnect after server metadata or authentication changes. A client refresh is required before checking updated tool names, descriptions, schemas, annotations, or auth behavior.

## Review run

Run the five positive and three negative prompts in `plugin.json` from a new conversation with the plugin enabled. Record the tool calls and the user-visible result for each case.

| Case | Capability | Expected tool path | Account state |
| --- | --- | --- | --- |
| P1 | Stage filter | `list_songs` | `read_library` enabled |
| P2 | No-open-to-do search | `list_songs` then `search_song_activity` | `read_library` enabled |
| P3 | Stage update | `list_songs` then `update_song` | `edit_songs` enabled |
| P4 | Share page | `create_share_page` | `sharing` enabled |
| P5 | Split sheet | `list_buckets` then `export_split_sheet` | `export_data` enabled |
| N1 | Unrelated weather request | No tool | Any |
| N2 | Local file deletion | No tool | Any |
| N3 | Song creation and audio upload | No tool | Any |

For each positive case, confirm that the result is scoped to the authenticated account, uses stable record IDs for follow-up actions, and gives a clear permission error when the relevant permission is disabled. Do not treat an HTTP 200 response or a tool list as proof that account isolation or write authorization works.

For each negative case, confirm that the plugin does not call a tool and explains the supported boundary in plain language.

## Compound and conversational assessment

The review cases above do not prove that a client can maintain a multi-turn compound task. Add a matched read-only assessment before making that claim:

1. Run one compound request that finds a bounded set, applies a second criterion, and reports the exact stable IDs.
2. Run the same logical task over several turns: find the set, refine it with “of those”, then ask for a further calculation or read.
3. Insert an unrelated question between turns, then resume the task. Confirm that the frozen IDs and requested fields survive the detour.
4. Check that a request to refresh or find all records explicitly replaces the frozen scope, while a criterion such as “only high priority” refines it.
5. Before any write test, re-read the exact target IDs, confirm current values and pagination completeness, obtain the required confirmation, and record before/after results.

Record the model, client, tool calls, turn boundaries, fixture or account type, and failures. A skill update or scripted tool sequence is guidance and contract evidence; it is not proof of continuous conversation, autonomous planning, hosted account isolation, or successful customer writes.

## Access and recovery checks

- Revoke the app grant in The Library Settings, reconnect, and confirm that the MCP server requires authorization again before reading or writing account data.
- Use a second reviewer account and confirm that the first account's tracks, collaborators, comments, shares, and earnings are not returned.
- Disable `edit_songs`, `sharing`, and `export_data` one at a time and rerun P3, P4, and P5. Each action must fail closed and must not partially change data.
- Exercise an expired access token and confirm the client can complete the OAuth refresh or sign-in flow without exposing a token in the response.
- Run the OAuth error cases for a missing or unknown client parameter and confirm a controlled OAuth error response rather than HTTP 500.

## Submission dependencies

The following items require access outside this repository:

- verified OpenAI developer identity for Producer Dashboard Corp;
- a live reviewer account and secure reviewer access entry in the submission dashboard;
- a reviewer-accessible recording URL after the recording is made;
- final confirmation that the deployed MCP server advertises the intended tool metadata and auth behavior.

Before submitting, record the immutable deployment or release revision serving `https://mcp.thelibrary.fm/mcp`. From a fresh client connection, reconnect and verify that the live endpoint exposes the intended tool names, descriptions, schemas, and per-tool safety annotations. Then verify the live OAuth flow: consent, token refresh, grant revocation, permission-denied failures, and controlled missing or unknown-client errors. Resolve any scan or connection failure in the submission dashboard before submission, as required by the [OpenAI remote MCP review requirements](https://developers.openai.com/plugins/deploy/app-review).
