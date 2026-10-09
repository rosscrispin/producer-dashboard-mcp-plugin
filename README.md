# The Library Plugin for Codex, ChatGPT, and Claude Code

Use your [The Library](https://thelibrary.fm) account to find tracks and manage authorized music workflows in Codex, ChatGPT, or Claude Code.

The plugin is published by **Producer Dashboard Corp**, a Delaware company. Its composer icon and listing logo use the existing The Library app icon, bundled at `assets/app-icon.png` from the app's `build/icon-source.png`.

## Codex local install

Add this repository as a marketplace, then install the plugin:

```sh
codex plugin marketplace add rosscrispin/producer-dashboard-mcp-plugin
codex plugin add producer-dashboard@glimbr
```

The Codex package uses `plugin.json` and `mcp.json`. Sign in to the remote MCP server when Codex asks. For a read-only test, run `codex mcp login the-library --scopes library.read` and approve that scope in The Library.

## Claude Code install

Run these two commands inside Claude Code:

```
/plugin marketplace add rosscrispin/producer-dashboard-mcp-plugin
/plugin install producer-dashboard@glimbr
```

On first use, Claude Code will open your browser to sign in with your The Library account.

## What you can ask

- "How many songs do I have in each stage?"
- "Show me comments on my finished tracks from last week"
- "Find tracks with no open to-dos"
- "Show tracks with no comments in the past three days"
- "Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"
- "Create a share page for everything in my Releases bucket"
- "What songs need mixing? Set their due date to end of month"
- "Tag all songs in test 4 as Cinematic"

The server exposes 222 tools across tracks, private playlists, Buckets, Bucket properties, shared Bucket members, collaborators, sharing, Friend Track Offers, comments, To-Dos, search, and royalty earnings. Recipient, shared-Bucket member, Bucket property and full collaborator tools prepare exact plans for trusted app review. Named collaborator and publisher name/notes actions use the original songs.write grant and an exact direct execution contract. Playlist writes use `prepare -> execute -> status` under the authorized OAuth grant and do not require an extra app review; legacy playlist plans without the server-owned direct marker retain their approval flow. Inbox and Outbox readers keep direct assignments and Bucket paths separate. Direct invitation acceptance, decline, leave, resend and revoke use exact assignment and Track revisions. Recipient Connect grants a fixed browser-authorized context for safe reads, media handoffs and approval decisions. Offer bounce feedback uses an exact durable comment receipt. Connected app file actions use fresh device and session consent, signed commands and the existing file service. Versioned Track tools clear due dates, edit lyrics and notes, and add, remove or replace Bucket memberships. Single metadata writes use exact direct grant execution. Membership changes and the closed eight-field bulk metadata patch require their trusted review and current revisions. Partial results and pending delivery remain explicit. The published OAuth set contains 22 scopes. Existing grants do not expand. File preparation, child-share delivery, and local playback can require The Library desktop app.

## Package validation

Run the dependency-free package check before creating a ZIP or uploading a new version:

```sh
node scripts/validate-plugin.mjs
```

It checks the listing, review cases, icons, product wording, and the documented 222-tool reference.

## Permissions

Toggle these in **The Library → Settings → AI Agent Access**:

| Permission | Default | Needed for |
|---|---|---|
| Read library | ON | Browsing songs, tags, comments |
| Edit songs | ON | Updating metadata, stages, workflows |
| Comments & todos | ON | Creating and editing comments and todos |
| Read collaborators | ON | Viewing collaborator info |
| Sharing | OFF | Creating share pages, sharing with collaborators |
| Bulk operations | OFF | Batch updating multiple songs |
| Destructive operations | OFF | Deleting buckets, tags, collaborators |
| Read sharing | OFF | New share status and public link readers; sharing.read consent |
| Manage buckets | OFF | Creating and organizing Bucket hierarchy; projects.write consent |
| Manage Public Page visibility | OFF | Adding or removing owned Buckets from the canonical Public Page collection; public_pages.write consent |
| Organize library | OFF | Creating and changing private playlists; organization.write consent |
| Edit collaborators | OFF | Friend designation; collaborators.write consent |
| Read rights | OFF | Offer, bounce and feedback reads; rights.read consent |
| Manage rights | OFF | Offer lifecycle; rights.write consent |

Fresh consent is required for each new scope. Chat confirmation cannot approve a recipient or shared-Bucket member action. Review the exact server plan in the trusted app. Public links, direct collaborator delivery, shared-Bucket membership, credits, Friends and Offers remain separate actions. Revoking access, changing a Bucket role, or leaving a Bucket also requires destructive operations authority. The MCP reports remote child-share delivery separately from local file import and preserves independent access paths.

Private playlist creation also requires the Sharing permission and `sharing.write` consent because it publishes an unlisted stream-only live URL. Other private playlist edits use the Organize library permission unless linked-share effects require sharing authority. Prepare each exact playlist action, execute it with the returned plan ID and original idempotency UUID, then read operation status. Client confirmation policies remain client-controlled.

## Requirements

- Codex, ChatGPT, or [Claude Code](https://claude.ai/code)
- [The Library](https://thelibrary.fm) account
- Application file-delivery and permission prerequisites for the chosen sharing action
