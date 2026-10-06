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

The server currently exposes 61 tools across tracks, buckets, tags, collaborators, sharing, comments, todos, search, library views, and royalty earnings. It includes structured Track queries, JEV pair assessment, and server Join preview. It does not execute a native Join, create songs, or upload local audio. Use The Library's desktop workflows for those actions.

## Package validation

Run the dependency-free package check before creating a ZIP or uploading a new version:

```sh
node scripts/validate-plugin.mjs
```

It checks the supported listing fields, URL shape, review case counts, bundled icon paths, stale product wording, and the documented 61-tool reference.

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

## Requirements

- Codex, ChatGPT, or [Claude Code](https://claude.ai/code)
- [The Library](https://thelibrary.fm) account
- Application file-delivery and permission prerequisites for the chosen sharing action
