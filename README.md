# The Library Plugin for Codex, ChatGPT, and Claude Code

Use your [The Library](https://thelibrary.fm) account to find tracks and manage approved music workflows in Codex, ChatGPT, or Claude Code.

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

The server exposes 104 tools across tracks, Buckets, Bucket properties, shared Bucket members, collaborators, sharing, Friend Track Offers, comments, To-Dos, search, and royalty earnings. Recipient, shared-Bucket member, and Bucket property tools prepare exact plans for trusted app review. Existing grants do not expand. File preparation, child-share delivery, and local playback can require The Library desktop app.

## Package validation

Run the dependency-free package check before creating a ZIP or uploading a new version:

```sh
node scripts/validate-plugin.mjs
```

It checks the listing, review cases, icons, product wording, and the documented 104-tool reference.

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
| Edit collaborators | OFF | Friend designation; collaborators.write consent |
| Read rights | OFF | Offer, bounce and feedback reads; rights.read consent |
| Manage rights | OFF | Offer lifecycle; rights.write consent |

Fresh consent is required for each new scope. Chat confirmation cannot approve a recipient or shared-Bucket member action. Review the exact server plan in the trusted app. Public links, direct collaborator delivery, shared-Bucket membership, credits, Friends and Offers remain separate actions. Revoking access, changing a Bucket role, or leaving a Bucket also requires destructive operations authority. The MCP reports remote child-share delivery separately from local file import and preserves independent access paths.

## Requirements

- Codex, ChatGPT, or [Claude Code](https://claude.ai/code)
- [The Library](https://thelibrary.fm) account
- Application file-delivery and permission prerequisites for the chosen sharing action
