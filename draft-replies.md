# Draft Replies for Promotion

## 1. openai/codex#10741 — "Xcode MCP"

I built [**xcode-cli**](https://github.com/dazuiba/xcode-cli-skill) to solve exactly this problem. It wraps all 20 Xcode MCP tools as a single CLI behind a persistent `mcp-proxy`, so macOS only asks for TCC permission **once**.

**How it works:**
```
Agent ──bash──▶ xcode-cli ──HTTP──▶ mcp-proxy (single PID) ──stdio──▶ xcrun mcpbridge ──▶ Xcode
```

The proxy holds a long-lived connection to `xcrun mcpbridge`. No more new PIDs, no more popups.

**Quick setup:**
```bash
uv tool install mcp-proxy && npm install -g pm2
git clone https://github.com/dazuiba/xcode-cli-skill.git && cd xcode-cli-skill
npm link
pm2 start xcode-mcp-proxy.config.cjs && pm2 save
# Click "Allow" once — done forever
```

**Works with any agent** — Codex, Claude Code, Cursor, Gemini CLI. For Codex:
```bash
codex mcp add --url http://localhost:9876/mcp xcode-proxy
```

**Bonus for Claude Code users:** includes a Skill file that saves ~5K tokens per conversation (20 MCP tool definitions load on-demand instead of every chat).

Built on top of the `mcp-proxy` approach that @tabletcorry and @llk23r suggested, but packaged as a drop-in CLI with pm2 for auto-restart.

---

## 2. anthropics/claude-code#27557 — "Xcode MCP Server shows permissions request too often"

The TCC popup spam happens because each new process gets a new PID, and macOS treats it as a fresh permission request.

I packaged a fix as [**xcode-cli**](https://github.com/dazuiba/xcode-cli-skill) — a persistent `mcp-proxy` sits between your agent and `xcrun mcpbridge`, so macOS only prompts **once**.

```bash
git clone https://github.com/dazuiba/xcode-cli-skill.git && cd xcode-cli-skill
npm link && npm install -g pm2
pm2 start xcode-mcp-proxy.config.cjs && pm2 save
```

For Claude Code, it also includes a **Skill** (`/xcode-cli`) that loads the 20 Xcode tool definitions on-demand — saving ~5K tokens from every conversation context.

```bash
mkdir -p ~/.claude/skills/xcode-cli
cp skills/xcode-cli/SKILL.md ~/.claude/skills/xcode-cli/
```

---

## 3. anthropics/claude-code#23550 — "Xcode MCP tools hang indefinitely for CLI clients"

This issue is caused by macOS TCC not persisting Automation permission for CLI tools without a stable bundle identifier.

Workaround: run `xcrun mcpbridge` behind a persistent proxy process, so TCC only sees one stable PID:

[**xcode-cli**](https://github.com/dazuiba/xcode-cli-skill) packages this as a drop-in solution:

```bash
git clone https://github.com/dazuiba/xcode-cli-skill.git && cd xcode-cli-skill
npm link && npm install -g pm2
pm2 start xcode-mcp-proxy.config.cjs && pm2 save
# Approve TCC once, proxy stays alive via pm2
```

Then use `xcode-cli BuildProject --tab-identifier windowtab1` from Claude Code instead of going through MCP directly. No more hangs.

---

## 4. General / Reddit / Blog comment

**Tired of the "Allow X to access Xcode?" popup every 3 seconds?**

I built [xcode-cli](https://github.com/dazuiba/xcode-cli-skill) — a CLI that wraps all 20 Xcode MCP tools behind a persistent proxy. You approve once, it never asks again. Works with Claude Code, Codex, Cursor, Gemini CLI, or any agent that can run bash.

Setup takes 2 minutes:
```
git clone https://github.com/dazuiba/xcode-cli-skill.git
cd xcode-cli-skill && npm link
pm2 start xcode-mcp-proxy.config.cjs && pm2 save
```

Bonus: for Claude Code users, it includes a Skill file that keeps ~5K tokens of MCP tool definitions out of your context window — they load on-demand only when needed.

---

## 5. Reddit Post — r/iOSProgramming / r/swift

**Title:** I fixed the Xcode MCP + AI Agent TCC popup spam — open source CLI tool

**Body:**

If you've tried using Claude Code, Codex, Cursor, or Gemini CLI with Xcode 26.3's MCP tools, you've probably hit this:

> "Allow X to access Xcode?" — every 3 seconds, forever.

The root cause: each time an AI agent calls `xcrun mcpbridge`, macOS sees a new process (new PID) and triggers a fresh TCC dialog. There's no way to permanently allow it.

**The fix:** I built [xcode-cli](https://github.com/dazuiba/xcode-cli-skill) — it runs a persistent `mcp-proxy` between your agent and Xcode. macOS only sees one stable PID, so you approve **once** and it never asks again.

```
Agent ──bash──▶ xcode-cli ──HTTP──▶ mcp-proxy (single PID) ──stdio──▶ xcrun mcpbridge ──▶ Xcode
```

**Setup (~2 min):**
```bash
uv tool install mcp-proxy && npm install -g pm2
git clone https://github.com/dazuiba/xcode-cli-skill.git && cd xcode-cli-skill
npm link
pm2 start xcode-mcp-proxy.config.cjs && pm2 save
```

Click "Allow" once. Done.

**Works with any agent:**
- **Codex:** `codex mcp add --url http://localhost:9876/mcp xcode-proxy`
- **Claude Code:** includes a Skill file — saves ~5K tokens per conversation (20 tool definitions load on-demand)
- **Cursor / Gemini CLI / any MCP client:** point to `http://localhost:9876/mcp`

This is a known issue across multiple repos ([openai/codex#10741](https://github.com/openai/codex/issues/10741), [anthropics/claude-code#27557](https://github.com/anthropics/claude-code/issues/27557), [#23550](https://github.com/anthropics/claude-code/issues/23550)). pm2 keeps the proxy alive across reboots.

Happy to hear feedback. MIT licensed.

---

## 6. Reddit Post — r/ClaudeAI

**Title:** Claude Code + Xcode: fix TCC popup spam and save 5K tokens per conversation

**Body:**

Two problems when using Claude Code with Xcode 26.3's MCP tools:

1. **TCC popup hell** — macOS asks "Allow Claude to access Xcode?" on every single tool call because each invocation spawns a new PID
2. **5K wasted tokens** — 20 MCP tool definitions load into every conversation, whether you use them or not

I built [xcode-cli](https://github.com/dazuiba/xcode-cli-skill) to fix both:

**Problem 1:** A persistent `mcp-proxy` (managed by pm2) sits between Claude and `xcrun mcpbridge`. One stable PID = one TCC approval, forever.

**Problem 2:** A Claude Code Skill wraps all 20 tools — only a ~30-word description stays in context, full docs load on-demand when you invoke `/xcode-cli`.

**Setup:**
```bash
# Install
uv tool install mcp-proxy && npm install -g pm2
git clone https://github.com/dazuiba/xcode-cli-skill.git && cd xcode-cli-skill
npm link
pm2 start xcode-mcp-proxy.config.cjs && pm2 save

# Add skill to Claude Code
mkdir -p ~/.claude/skills/xcode-cli
cp skills/xcode-cli/SKILL.md ~/.claude/skills/xcode-cli/
```

Restart Claude Code, then use `/xcode-cli` to trigger the skill. It teaches Claude how to build, diagnose, test, and preview your Xcode project via bash commands.

Also works with Codex, Cursor, and Gemini CLI. [GitHub](https://github.com/dazuiba/xcode-cli-skill)
