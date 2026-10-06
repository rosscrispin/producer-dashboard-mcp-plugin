# The Library MCP review recording guide

Create the recording locally only after the live reviewer account and deployed MCP server are ready. Do not place account passwords, OAuth codes, access tokens, private track names, private email addresses, or private audio in the recording.

## Local capture setup

1. Create a disposable reviewer account and seed only the small library required by `REVIEW_CHECKLIST.md`.
2. Use a clean browser profile or a separate macOS user session.
3. Set the browser zoom to 100% and close unrelated applications and notifications.
4. Open The Library sign-in page and the MCP authorization flow in the same browser profile.
5. Start a screen recording with QuickTime Player, the macOS Screenshot toolbar, or another local recorder. Save the source file outside Git, for example `artifacts/plugin-review/the-library-mcp-review.mov`.

## Shot list

Keep the recording short and continuous. Show the product and the observable result for each item.

1. Sign in to the disposable The Library account.
2. Open the MCP authorization dialog and show the product name, requested scopes, and the synchronized styling with the normal sign-in and authorization dialog. Do not show credentials or one-time codes.
3. Run P1 and show a stage-filtered track result.
4. Run P2 and show a no-open-to-do result.
5. Run P3 and show the stable track selection, the authorized stage update, and the saved result.
6. Run P4 and show the created share page link and its selected scope.
7. Run P5 and show the split-sheet export result without showing private collaborator contact details.
8. Run N1, N2, and N3 and show that the plugin declines to call a The Library tool for each unsupported request.
9. Disable one permission, repeat its matching positive case, and show the clear fail-closed response.

## Finalize the local asset

After recording, review the file for private data and trim dead time. Export an H.264 MP4 with readable text, for example `artifacts/plugin-review/the-library-mcp-review.mp4`. Keep the source and exported files outside the plugin package until they are reviewed and approved for sharing.

Before submission, upload the approved recording to a reviewer-accessible location and place that URL in the OpenAI submission dashboard or the supported `extensions.com.openai.review.demo_recording_url` field. Do not add a placeholder URL to `plugin.json`.
