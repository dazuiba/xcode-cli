# Changelog

## [Unreleased]

### Added
- `run` command: build and run the active scheme via AppleScript (like Cmd+R in Xcode)
- `run-without-build` command: run without building via AppleScript (like Ctrl+Cmd+R in Xcode)
- `call` command: invoke any MCP tool directly with JSON args (replaces the old `run` command)
- `triggerXcodeKeystroke` helper using `osascript` for AppleScript-based Xcode control
- Skill installation now uses a symlink instead of a file copy, so upgrades are reflected automatically
- Install script now links SKILL.md to `~/.claude2/skills/xcode-cli` in addition to Claude and Codex dirs

### Changed
- Regenerated `mcpbridge.ts` from `xcode-mcp@1.0.0` (node/rolldown) to `xcode-cli@1.0.5` (bun)
- SKILL.md: `--tab <tabIdentifier>` is now mandatory; instruct users to run `windows` first to obtain it
- SKILL.md: added `run` and `run-without-build` to the command table with AppleScript notes
- SKILL.md: fixed `call` command reference (was incorrectly documented as `run`)
- Skill install uses `lstat` (works for symlinks) instead of `access` for existence checks

---

## [0636a79] – 2026-03-09 – fix: compress SKILL.md from 3000 to 776 token

- Rewrote SKILL.md as a compact reference table (776 tokens vs. 3000 before)

## [3463333] – 2026-03-07 – update readme

- Updated README with current usage and command reference

## [59fba10] – 2026-03-06 – new command arch

- Introduced new command architecture for xcode-cli CLI

## [784d6df] – 2026-03-04 – Translate SKILL.md from Chinese to English

- Translated SKILL.md documentation from Chinese to English
