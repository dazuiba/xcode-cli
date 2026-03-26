# Plan: 基于工作目录自动匹配 tab

## 背景

目前每个命令都需要 `--tab <tabIdentifier>`，须先运行 `xcode-cli windows` 获取 ID。实际上 `XcodeListWindows` 返回的每个 tab 都携带 `workspacePath`，可以和当前工作目录（`process.cwd()`）自动匹配，让 `--tab` 在大多数场景下变为可选。

```bash
# 以前
xcode-cli windows                    # 先查 tab ID
xcode-cli --tab windowtab1 build     # 再用

# 现在：在项目目录下直接用
cd ~/iting/iOS/Apps
xcode-cli build                      # 自动匹配 workspacePath 在当前目录下的 tab
```

## 解析优先级（新）

1. `--tab <id>` / `XCODE_TAB_ID` → 直接使用，无 MCP 调用（不变）
2. **cwd 匹配** → 调用 `XcodeListWindows`，找 workspacePath 在当前目录下的 tab
3. 自动发现 → 仅一个 tab 时自动选中（不变）
4. 报错

## cwd 匹配规则

```
cwd = process.cwd()                          # /Users/sam/iting/iOS/Apps
workspacePath = .../iting/iOS/Apps/GoodMap.xcworkspace
workspaceDir  = path.dirname(workspacePath)  # /Users/sam/iting/iOS/Apps
```

**判定：cwd 在 workspaceDir 内（含相等）**

```typescript
const cwdNorm = path.resolve(cwd);
const wsDirNorm = path.resolve(path.dirname(workspacePath));
const match = cwdNorm === wsDirNorm || cwdNorm.startsWith(wsDirNorm + '/');
```

匹配场景：
- `cwd = /Users/sam/iting/iOS/Apps/` → workspaceDir 相同 ✓
- `cwd = /Users/sam/iting/iOS/Apps/GoodMap/Sources/` → 在 workspaceDir 内 ✓
- `cwd = /Users/sam/iting/iOS/` → 不在 workspaceDir 内 ✗（太宽泛）

结果处理：
- **1 个工作区匹配**（可能多个 tab）→ 返回第一个 tab 的 ID
- **0 个匹配** → 继续走 auto-discover（步骤 3）
- **多个不同工作区匹配** → 继续走 auto-discover（步骤 3）

## 改动

### 1. `src/xcode.ts` — 仅此一个文件

**a) 新增 `listTabWorkspacePairs()`**（`listTabIdentifiers` 后 ~line 683）：
- 复用同样的 BFS 遍历模式
- 从对象中提取 `{tabIdentifier, workspacePath}` 对
- 同时解析文本中 `tabIdentifier: X, workspacePath: Y` 模式

**b) 新增 `matchTabByCwd(pairs, cwd)` → string | undefined**：
- 实现上述 cwd 匹配规则
- 按 workspacePath 去重后，如果恰好 1 个工作区匹配，返回第一个 tab ID
- 否则返回 undefined（交给后续逻辑）

**c) 修改 `resolveTabIdentifier()`**（line 623）：
```typescript
async function resolveTabIdentifier(ctx, autoDiscover, windowsResult?) {
  // 1. 精确 tab（不变）
  if (ctx.tabOverride) return ctx.tabOverride;

  if (autoDiscover) {
    const windows = windowsResult ?? await ctx.call('XcodeListWindows');
    const data = unwrapResult(windows);

    // 2. NEW: cwd 匹配
    const pairs = listTabWorkspacePairs(data);
    const cwdMatch = matchTabByCwd(pairs, process.cwd());
    if (cwdMatch) return cwdMatch;

    // 3. 唯一 tab 自动选中（不变）
    const tabIds = listTabIdentifiers(data);
    if (tabIds.length === 1) return tabIds[0];
  }

  throw new Error('No tab identifier found. ...');
}
```

注意：步骤 2 和 3 复用同一次 `XcodeListWindows` 调用，无额外开销。

**d) 添加 `import path from 'node:path'`**（文件头）

**e) 更新帮助文本**（line 32-51）：
- 说明在项目目录下 tab 会自动匹配

### 2. `skills/xcode-cli/SKILL.md` — 更新文档

line 22 改为：
> 在项目目录下运行时，自动匹配对应的 tab。也可用 `--tab <tabIdentifier>` 指定。运行 `xcode-cli windows` 查看可用 tab。

## 需要修改的文件

| 文件 | 改动 |
|------|------|
| `src/xcode.ts` | `listTabWorkspacePairs()`、`matchTabByCwd()`、修改 `resolveTabIdentifier()`、帮助文本、import |
| `skills/xcode-cli/SKILL.md` | 更新文档 |

无需修改 `xcode-types.ts`——不新增 CLI 选项或 context 字段。

## 验证

1. `npm test` — 现有测试通过
2. `cd ~/iting/iOS/Apps && xcode-cli build` — 自动匹配
3. `cd ~/iting/iOS/Apps/SomeSubdir && xcode-cli build` — 子目录也匹配
4. `cd ~ && xcode-cli build` — 不匹配，回退到 auto-discover 或报错
5. `xcode-cli --tab windowtab1 build` — 向后兼容
