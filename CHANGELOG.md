# Changelog

## 1.0.8 – 2026-03-10 – fix: add timestamps to stderr logs

### Fixed
- All stderr log lines now include ISO 8601 timestamps (e.g. `[2026-03-10T12:00:00.000Z] MCP bridge listening on …`)

---

## [e7b2bef] – 2026-03-10 – fix: resolve "No tab identifier found"

### Fixed
- `--tab <tabIdentifier>` is now mandatory for all commands; SKILL.md instructs users to run `windows` first to obtain the identifier

### Added
- `run` command: build and run the active scheme via AppleScript (like Cmd+R in Xcode)
- `run-without-build` command: run without building via AppleScript (like Ctrl+Cmd+R in Xcode)
- `call` command: invoke any MCP tool directly with JSON args (replaces the old ambiguous `run <toolName>`)

### Changed
- SKILL.md: added `run`, `run-without-build`, corrected `call` command reference, added Accessibility grant note

---

## [db14b86] – 2026-03-10 – feat: upgrade bridge to xcode-cli@1.0.5, symlink skill install

### Added
- Skill installation now uses a symlink so upgrades are reflected automatically without reinstalling
- Install script links SKILL.md to `~/.claude2/skills/xcode-cli` in addition to Claude and Codex dirs

### Changed
- Regenerated `mcpbridge.ts` from `xcode-mcp@1.0.0` (node/rolldown) to `xcode-cli@1.0.5` (bun)
- Skill install uses `lstat` instead of `access` to correctly detect existing symlinks

---

## [0636a79] – 2026-03-09 – fix: compress SKILL.md from 3000 to 776 token

- Rewrote SKILL.md as a compact reference table (776 tokens vs. 3000 before)

## [3463333] – 2026-03-07 – update readme

- Updated README with current usage and command reference

## [59fba10] – 2026-03-06 – new command arch

- Introduced new command architecture for xcode-cli CLI

## [784d6df] – 2026-03-04 – Translate SKILL.md from Chinese to English

- Translated SKILL.md documentation from Chinese to English
