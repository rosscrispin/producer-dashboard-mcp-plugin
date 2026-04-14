# Producer Dashboard Plugin for Claude Code

Ask Claude to manage your [Producer Dashboard](https://producerdashboard.app) catalog — update stages, organize collaborators, create share pages, and more.

## Install

Run these two commands inside Claude Code:

```
/plugin marketplace add rosscrispin/producer-dashboard-mcp-plugin
/plugin install producer-dashboard@glimbr
```

On first use, Claude Code will open your browser to sign in with your Producer Dashboard account.

## What you can ask

- "How many songs do I have in each stage?"
- "Show me comments on my finished tracks from last week"
- "Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"
- "Create a share page for everything in my Releases bucket"
- "What songs need mixing? Set their due date to end of month"
- "Tag all songs in test 4 as Cinematic"

## Permissions

Toggle these in **Producer Dashboard → Settings → AI Agent Access**:

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

- [Claude Code](https://claude.ai/code)
- [Producer Dashboard](https://producerdashboard.app) account
- Dropbox connected (for sharing features)
