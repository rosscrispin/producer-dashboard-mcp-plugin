# Producer Dashboard Plugin for Claude Code

Connect Claude Code to your [Producer Dashboard](https://producerdashboard.app) account. Manage your song library, collaborators, tags, comments, todos, and share pages — all from the command line.

## What You Get

- **44 MCP tools** — full CRUD for songs, collaborators, buckets, tags, comments, todos, sharing
- **Domain knowledge** — Claude understands production stages, workflow states, split percentages, and music terminology
- **Multi-step workflows** — ask complex questions like "show me comments on my finished tracks from last week" and Claude composes the right tool calls automatically

## Install

Run these two commands inside Claude Code:

```
/plugin marketplace add rosscrispin/producer-dashboard-mcp-plugin
/plugin install producer-dashboard@glimbr
```

Or pre-configure it for a project by adding this to `.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "producer-dashboard@glimbr": true
  },
  "extraKnownMarketplaces": {
    "glimbr": {
      "source": {
        "source": "github",
        "repo": "rosscrispin/producer-dashboard-mcp-plugin"
      }
    }
  }
}
```

## Setup

1. Install the plugin
2. Start Claude Code — it will connect to `mcp.producerdashboard.app`
3. Authenticate with your Producer Dashboard account in the browser
4. Start asking questions about your music library

## Example Queries

```
"How many songs do I have in each stage?"
"Show me comments on my finished tracks from last week"
"Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits"
"Create a share page for everything in my Releases bucket"
"What songs need mixing? Set their due date to end of month"
"Tag all songs in test 4 as Cinematic"
```

## Permissions

Some operations require permissions enabled in Producer Dashboard Settings > AI Agent Access:

| Permission | Default | Required For |
|---|---|---|
| Read library | ON | Browsing songs, tags, comments |
| Edit songs | ON | Updating metadata, stages, workflows |
| Comments & todos | ON | Creating/editing comments and todos |
| Read collaborators | ON | Viewing collaborator info |
| Sharing | OFF | Creating share pages, sharing with collaborators |
| Bulk operations | OFF | Batch updating multiple songs |
| Destructive operations | OFF | Deleting buckets, tags, collaborators |

## Requirements

- [Claude Code](https://claude.ai/code) CLI
- [Producer Dashboard](https://producerdashboard.app) account with active subscription
- Dropbox connected (required for share features)

## License

MIT
