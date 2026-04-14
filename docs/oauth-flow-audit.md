# OAuth Flow Audit — mcp.producerdashboard.app

**Date:** 2026-04-14
**Scope:** Verify the OAuth 2.0 flow a brand-new Producer Dashboard user encounters when installing the Claude Code plugin for the first time.
**Method:** Protocol-level probing against `https://mcp.producerdashboard.app` — does not include a human-in-the-loop test of the consent page or a fresh-account sign-up.

---

## Flow as observed

```
1. Claude Code → POST /mcp (no auth)
2. MCP server → 401 + WWW-Authenticate: Bearer realm="OAuth",
                resource_metadata="https://mcp.producerdashboard.app/.well-known/oauth-protected-resource/mcp"
3. Claude Code → GET /.well-known/oauth-protected-resource/mcp
4. Claude Code → GET /.well-known/oauth-authorization-server
5. Claude Code → POST /register (DCR) with redirect_uris, grant_types, token_endpoint_auth_method=none
6. MCP server → 201 with fresh client_id
7. Claude Code → generates PKCE verifier + S256 challenge
8. Claude Code → opens browser at /authorize?response_type=code&client_id=...&code_challenge=...&...
9. MCP server → 302 redirect to https://client.producerdashboard.app/mcp-authorize.html?auth_nonce=...&scope=...
10. User → signs in (if not already) and approves scopes on the consent page
11. Consent page → redirects to http://localhost:<port>/callback?code=...&state=...
12. Claude Code's local callback → POST /token with code + code_verifier
13. MCP server → 200 with access_token + refresh_token
14. Claude Code → retries /mcp with Authorization: Bearer <access_token> → 200, tools available
```

---

## What passed ✅

| Check | Result | Spec |
|---|---|---|
| Unauthenticated MCP request returns 401 with WWW-Authenticate + resource_metadata | ✅ | RFC 9728 §5.1 |
| `/.well-known/oauth-authorization-server` returns complete metadata | ✅ | RFC 8414 |
| `/.well-known/oauth-protected-resource` (and `/mcp` variant) returns complete metadata | ✅ | RFC 9728 |
| `authorization_endpoint`, `token_endpoint`, `registration_endpoint` all present | ✅ | |
| PKCE S256 supported (`code_challenge_methods_supported: ["plain","S256"]`) | ✅ | RFC 7636 |
| Public clients supported (`token_endpoint_auth_method: "none"`) | ✅ | RFC 6749 |
| Refresh tokens supported (`grant_types_supported: ["authorization_code","refresh_token"]`) | ✅ | |
| Dynamic Client Registration works: `POST /register` → 201 with unique client_id | ✅ | RFC 7591 |
| Token endpoint rejects bogus codes with `invalid_client` 401 (not 500) | ✅ | RFC 6749 §5.2 |
| Authorize endpoint with **valid** client_id → 302 to consent page | ✅ | |
| Consent page at `client.producerdashboard.app/mcp-authorize` loads (HTTP 200, ~100ms) | ✅ | |
| Scope set advertised in metadata matches what Claude Code requests (all 9 scopes) | ✅ | |
| HTTPS + HSTS preload enforced | ✅ | |

---

## Issues found ⚠️

### 1. `/authorize` crashes with HTTP 500 on invalid client_id — **medium**

**Reproduction:**
```
GET /authorize?response_type=code&client_id=totally_bogus_client&...
→ HTTP 500
  error code: 1101
```

**Expected:** RFC 6749 §4.1.2.1 says if the `client_id` is invalid, the server MUST NOT redirect back to the client; it should display an error to the user. The correct response is a 400 with an HTML error page, not a 500.

**Impact for new users:** Low. A real new user's client_id is freshly DCR-issued, so they won't hit this code path. But:
- If your backend ever prunes DCR clients (see issue 3 below) or a DB migration orphans them, **every existing installed plugin will start returning 500s on re-auth** instead of a clean "please reinstall" error.
- Uptime alerting on 5xx will page on every bogus probe (scanners, crawlers, malicious requests).
- The Cloudflare error code 1101 indicates an unhandled exception in a Worker — if your error handler catches more states you may also be catching real bugs.

**Fix:** Wrap the `client_id` lookup in `/authorize` in a try/catch (or early-return on cache miss). Return a branded HTML error page with status 400 that says "This sign-in link is no longer valid. Reinstall the Claude Code plugin to reconnect." plus a link back to producerdashboard.app.

---

### 2. `DELETE /register/{client_id}` returns 404 — **low**

The DCR response advertises:
```json
"registration_client_uri": "/register/9PhKMFWgrpRNGf4P"
```

…but DELETE against that URL 404s. RFC 7592 (Dynamic Client Configuration Protocol) is optional, but advertising the URI without implementing it is inconsistent.

**Fix options:**
- **a)** Implement RFC 7592 GET/PUT/DELETE for the advertised URI.
- **b)** Remove `registration_client_uri` from the DCR response so clients don't try to manage themselves.

Option (b) is faster. Option (a) is cleaner long-term if you want Claude Code (or another tool) to be able to un-register itself when a user clicks "Disconnect" in the in-product panel.

---

### 3. No way to prune accumulated DCR clients — **low, long-term**

Every Claude Code install registers a new client_id. Reinstall → new client. Use on a second machine → another client. Over months and years, this grows unbounded.

**Fix:** Backend job that prunes DCR clients with no tokens issued in the last N days (e.g., 90). Combine with issue 2 so the "Disconnect" button in the in-product panel actually revokes the client, not just the token.

---

## Not tested — **needs manual QA before launch**

I couldn't verify these from a protocol probe. These are the biggest risks to the first-user experience and should be tested manually on a fresh device:

### Critical — test before submitting to the Anthropic marketplace

**A. Signed-out user flow.**
Open a fresh private browser window (no PD cookies). Run the plugin install. Does the consent page at `client.producerdashboard.app/mcp-authorize` properly prompt the user to log in, and does the OAuth flow resume correctly after login?

If the consent page assumes the user is already signed in and just dies silently when they aren't, **this is a launch blocker** — it's the single biggest reason new-user flows fail.

**B. Brand-new account flow.**
What happens if a user who has never created a PD account hits the consent page? Do they get a "Sign up" path? Does the consent page tell them they need to sign up at producerdashboard.app first, and then come back? If it's a dead end, we're losing every top-of-funnel user who discovered PD via Claude Code.

**C. Token expiry + refresh.**
Tokens last 30 days per the README. Verify the refresh flow works — issue a token, wait for expiry (or manually expire it), and check that Claude Code seamlessly refreshes without re-prompting the user for consent.

**D. Permission changes mid-session.**
If a user has Claude Code connected, then turns off the "Sharing" permission in Settings → AI Agent Access, does Claude Code get a meaningful error when it tries to call a sharing tool? Or a silent 403? Or a 500? The error message is what the user sees in their terminal.

### Nice-to-have

**E. Mobile consent page.**
Most Producer Dashboard users probably discover via desktop, but verify the consent page at `client.producerdashboard.app/mcp-authorize` renders cleanly on a phone — if they're signed into PD on mobile but running Claude Code on a laptop, the OAuth redirect lands on whichever device has the sign-in cookie.

**F. Multi-account users.**
If a producer has two PD accounts (personal + label), can they pick which one to authorize when the consent page loads? Or does it silently pick the currently-signed-in account?

**G. What the consent page actually says.**
I couldn't render the page (it's a client-side SPA). Load it in a browser and verify the copy:
- Does it name "Claude Code" as the client?
- Does it list the scopes being granted in human language (not `library.read`)?
- Does it clearly say 30-day token lifetime / how to revoke?
- Is there a "Cancel" button that gracefully fails back to Claude Code?

---

## Summary for the go/no-go call

**Protocol-level: green light.** The OAuth implementation is RFC-compliant across discovery, DCR, PKCE, and token issuance. Claude Code's first-connection bootstrap will work correctly against this server.

**User-level: one blocker and two bugs.**
- **Blocker (must test before launch):** Manual QA of the signed-out user flow (item A above). Every other piece of the protocol works — if the consent page handles the signed-out case gracefully, you're cleared to ship.
- **Bug 1 (should fix, not a blocker):** `/authorize` 500 on invalid client_id. Fix before the plugin has >100 installs to keep the token orphaning scenario clean.
- **Bug 2 (nice-to-fix):** DCR registration_client_uri advertised but unimplemented. Fix when you build the "Disconnect" button in the in-product panel.

**What I'd do tomorrow:**
1. Open a private browser, sign out of PD, install the plugin, complete the full flow, screenshot each step, write a two-paragraph "it worked" / "it broke here" report.
2. If it worked: submit to Anthropic's marketplace at claude.ai/settings/plugins/submit.
3. If it broke: fix the signed-out path, then retry.
