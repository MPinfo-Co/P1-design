# PG Orchestrator

PG issue 全端自動實作工具。自動偵測 TDD 工作範圍，依序呼叫後端與前端 orchestrator。

## 使用方式

在 Claude Code 中以此 skill 執行，並提供 issue 編號（例如：66）。
分支名稱可選填；未提供時自動偵測。

```
/pg-orchestrator issue=66
/pg-orchestrator issue=66 sd_branch=issue-66-xxx pg_branch=issue-66-yyy
```

## 執行流程

### Step 1：解析分支名稱

若使用者已提供 `sd_branch` 與 `pg_branch` → 直接使用，跳到 Step 2。

否則自動偵測：

```bash
cd P1-design && git fetch origin
git branch -a | grep "issue-{ISSUE_N}-"
```

```bash
cd P1-code && git fetch origin
git branch -a | grep "issue-{ISSUE_N}-"
```

- 各取第一筆符合結果（去除 `remotes/origin/` 前綴），分別作為 `{SD_BRANCH}` 與 `{PG_BRANCH}`
- 若任一找不到 → 停止，輸出 `✗ 找不到 issue-{ISSUE_N} 對應分支，請手動傳入`

### Step 2：偵測工作範圍

讀取 `P1-design/SD/sd-{ISSUE_N}-TDD.md`：
- 若檔案不存在 → 停止，輸出 `✗ TDD 不存在：SD/sd-{ISSUE_N}-TDD.md`
- 若包含 `Schema` / `API` / `Test` 類型工作項目 → `has_backend = true`
- 若包含 `畫面` 類型工作項目 → `has_frontend = true`

### Step 3：後端流程（has_backend = true 時執行）

呼叫 `Agent()` tool，prompt 為 [pg-backend-orchestrator](P1-design/agents/v2/pg-backend-orchestrator.md) 的內容，傳入參數：
- `{ISSUE_N}`, `{SD_BRANCH}`, `{PG_BRANCH}`

### Step 4：前端流程（has_frontend = true 時執行）

呼叫 `Agent()` tool，prompt 為 [pg-frontend-orchestrator](P1-design/agents/v2/pg-frontend-orchestrator.md) 的內容，傳入參數：
- `{ISSUE_N}`, `{SD_BRANCH}`, `{PG_BRANCH}`
