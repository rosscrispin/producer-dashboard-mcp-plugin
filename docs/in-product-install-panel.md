# In-Product Install Panel — Frontend Handoff

Copy and spec for a new section inside **Producer Dashboard → Settings → AI Agent Access**, positioned above the existing permission toggles. Goal: help users install the Claude Code plugin in under a minute without leaving the app.

---

## Section Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Headline] Control Producer Dashboard with Claude          │
│  [Subhead]  Ask Claude to organize your catalog, update     │
│             stages, manage collaborators, and create share  │
│             pages — in plain English.                       │
│                                                             │
│  [Step 1]   Install Claude Code   [→ Install button]        │
│  [Step 2]   Paste these commands into Claude Code           │
│             ┌─────────────────────────────────┐ [Copy]      │
│             │ /plugin marketplace add         │             │
│             │   glimbr/producer-dashboard-    │             │
│             │   mcp-plugin                    │             │
│             └─────────────────────────────────┘             │
│             ┌─────────────────────────────────┐ [Copy]      │
│             │ /plugin install                 │             │
│             │   producer-dashboard@glimbr     │             │
│             └─────────────────────────────────┘             │
│  [Step 3]   Sign in when Claude Code opens your browser     │
│                                                             │
│  [Status indicator]  ● Connected as ross@...                │
│                      ○ Not yet connected                    │
│  [Reconnect button]  [Disconnect button]                    │
│                                                             │
│  [Expander] ▸ Try these questions                           │
│  [Expander] ▸ Use with Claude Desktop or other AI tools     │
│  [Expander] ▸ Troubleshooting                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Copy

### Headline
**Control Producer Dashboard with Claude**

### Subheadline
Ask Claude to organize your catalog, update stages, manage collaborators, and create share pages — in plain English.

### Step 1
**Install Claude Code** if you haven't already.
[Button label]: `Install Claude Code` → opens `https://claude.com/claude-code` in a new tab

### Step 2
**Paste these commands into Claude Code:**

Command 1 (copy button):
```
/plugin marketplace add rosscrispin/producer-dashboard-mcp-plugin
```

Command 2 (copy button):
```
/plugin install producer-dashboard@glimbr
```

### Step 3
**Sign in** when Claude Code opens your browser. You'll be back in a few seconds, and the 44 Producer Dashboard tools will become available automatically.

### Connection status (dynamic)
- **Not connected:** "No connection yet. Complete the steps above, then come back and reload this page."
- **Connected:** "● Connected as {{user_email}} — last active {{relative_time}}"
- **Expired:** "⚠ Your token expired. Run the install commands again to reconnect."

### Reconnect button
Label: `Reconnect`
Action: Revoke the current OAuth token for this user so the next tool call triggers a fresh browser auth flow. Shows a toast: "Token cleared. Run any Claude Code command to sign in again."

### Disconnect button
Label: `Disconnect`
Action: Same as Reconnect but doesn't prompt a new auth flow. Shows a confirmation modal first: "Disconnect Claude Code? Your AI assistant will lose access to Producer Dashboard until you reconnect."

---

## Expandable sections

### ▸ Try these questions

Once installed, ask Claude things like:

- *"How many songs do I have in each stage?"*
- *"Show me comments on my finished tracks from last week."*
- *"Add Joshua as a collaborator on all my tree-stage songs with 50/50 splits."*
- *"Create a share page for everything in my Releases bucket."*
- *"What songs need mixing? Set their due date to end of month."*
- *"Tag all songs in my test 4 bucket as Cinematic."*

Claude knows your stages, workflow states, buckets, and tags — so you can describe what you want in the words you already use.

### ▸ Use with Claude Desktop or other AI tools

Prefer a desktop app over a CLI? Producer Dashboard works with any [Model Context Protocol](https://modelcontextprotocol.io) client.

**MCP server URL:**
```
https://mcp.producerdashboard.app/mcp
```

**Transport:** HTTP
**Authentication:** OAuth 2.0 (PKCE)

Works with Claude Desktop, Cursor, Continue, and any other MCP-compatible tool. Add it to your client's MCP settings and sign in when prompted.

### ▸ Troubleshooting

**"Claude Code says 'authentication failed' or '401 Unauthorized'"**
Your token may have expired — they last 30 days. Click **Reconnect** above, then run any command in Claude Code to trigger a fresh sign-in.

**"Sharing tools don't work"**
Enable the **Sharing** permission below. You'll also need Dropbox connected in Settings → Integrations — share pages and collaborator sharing both depend on it.

**"Claude can't batch update songs"**
Enable **Bulk Operations** below. It's off by default to keep accidental mass-edits in check.

**"Claude can't delete things"**
Enable **Destructive Operations** below. Off by default for safety.

**"I installed the plugin but Claude doesn't know about my songs"**
Restart Claude Code after installing. If that doesn't work, check that `Read Library` is enabled below.

[Link text]: **Full documentation** → `https://github.com/rosscrispin/producer-dashboard-mcp-plugin`

---

## Permission callout

Below the install block, add a one-line context note above the existing permission toggles:

> **These permissions apply to Claude and any other AI assistant you connect.** Claude will respect what's turned on here — grant only what you're comfortable with.

This anchors the existing toggles to the new install flow so users understand why they're there.

---

## Implementation notes for frontend

### Components needed
- `<CopyableCommand>` — code block with a copy-to-clipboard button. Two instances.
- `<ConnectionStatus>` — polls `/api/mcp/status` (or similar) for current user's token state. Three states: not-connected, connected, expired.
- `<Reconnect>` / `<Disconnect>` buttons — hit an endpoint that revokes the user's OAuth token.
- `<Expander>` — standard disclosure widget. Three instances.

### Analytics events to track
- `ai_panel_viewed` — section was rendered on screen
- `ai_install_cmd_copied` — user clicked a copy button (pass which command)
- `ai_install_link_clicked` — user clicked "Install Claude Code"
- `ai_connected` — OAuth flow completed successfully (fires from the callback, not this panel)
- `ai_reconnect_clicked` / `ai_disconnect_clicked`
- `ai_troubleshoot_expanded` — user opened the troubleshooting section (signal that something's wrong)

### A/B test ideas
- **Headline:** "Control Producer Dashboard with Claude" vs. "Your AI production assistant"
- **Example queries:** show 3 vs. 6 (does fewer convert better?)
- **Step count:** collapsed 3-step wizard vs. always-open list

### Content not to ship yet
- Claude Desktop / Cursor setup instructions for the "Other AI tools" section assume the MCP server works with any OAuth-capable MCP client. Verify before claiming "Works with Cursor, Continue" — those clients' MCP support is evolving. Safe baseline: claim Claude Code + Claude Desktop only, mention "other MCP clients" without naming them.
- If the repo later moves under a `glimbr` GitHub org, update the "Full documentation" link and the install command in the copy-button block.

### Copy principles
- **Imperative voice** for steps ("Install", "Paste", "Sign in"), descriptive voice for context.
- **Producer vocabulary, not developer vocabulary** — "songs", "buckets", "stages", not "records", "collections", "statuses".
- **Never say "plugin"** in the main flow unless necessary — users care about the capability, not the packaging. Say "Claude Code integration" or "AI assistant".
- **No fear copy.** Don't warn users about what could go wrong upfront; put that in Troubleshooting.
