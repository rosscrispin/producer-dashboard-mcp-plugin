# The Library Plugin for Codex, ChatGPT, and Claude Code

Use your [The Library](https://thelibrary.fm) account to find tracks and manage approved music workflows in Codex, ChatGPT, or Claude Code.

The plugin is published by **Producer Dashboard Corp**, a Delaware company. Its composer icon and listing logo use the existing The Library app icon, bundled at `assets/app-icon.png` from the app's `build/icon-source.png`.

The current source package is version 1.2.0. Publication and installed-client refresh require the release checks and authenticated acceptance for the matching MCP server.

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

The server exposes 107 tools across tracks, Buckets, collaborators, sharing, Friend Track Offers, comments, To-Dos, search, royalty earnings, and paired desktop candidate-scan and reviewed Track Group Join workflows. Existing grants do not expand. Automatic Join and pairing revocation require fresh device pairing and confirmation in the desktop app; the MCP client cannot approve a plan or revocation, supply native paths, or fabricate a receipt. File preparation and local playback can require The Library desktop app.

## Package validation

Run the dependency-free package check before creating a ZIP or uploading a new version:

```sh
node scripts/validate-plugin.mjs
```

It checks the listing, review cases, icons, product wording, and the documented 107-tool reference.

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
| Edit collaborators | OFF | Friend designation; collaborators.write consent |
| Read rights | OFF | Offer, bounce and feedback reads; rights.read consent |
| Manage rights | OFF | Offer lifecycle; rights.write consent |
| Read local files | OFF | Reading paired desktop catalogue evidence for candidate scans and Join planning |
| Manage local files | OFF | Reconciled native Join execution after trusted approval |
| Pair devices | OFF | Pairing an exact desktop for local candidate scans and Join status |
| Control session | OFF | Opening a validated native recovery or Join folder handle |

Fresh consent is required for each new scope. Chat confirmation cannot approve a recipient action, Join, or pairing revocation. Review the exact server plan in the trusted app. Public links, collaborator folder delivery, credits, Friends, Offers, and desktop Joins remain separate actions.

## Requirements

- Codex, ChatGPT, or [Claude Code](https://claude.ai/code)
- [The Library](https://thelibrary.fm) account
- Application file-delivery and permission prerequisites for the chosen sharing action
