# PG Frontend Agent Orchestrator

PG issue 前端自動實作工具。呼叫 writer agent 產出 TSX，再由 verifier agent 確認規格合規與靜態檢查，最多重試 3 輪。

## 使用方式

在 Claude Code 中以此 skill 執行，並提供 issue 編號（例如：66）。

## 執行流程

### 初始化

```
attempt = 1
max_retries = 3
feedback = ""
```

### 迴圈（最多 max_retries 次）

1. **呼叫** `Agent()` tool，prompt 為 [writer-prompt文件](P1-design/prompts/pg-frontend-writer-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: 實際 issue 編號
   {SD_BRANCH}: P1-design branch
   {PG_BRANCH}: P1-code branch
   {FEEDBACK}: 當前 feedback
2. **呼叫** `Agent()` tool，prompt 為 [verifier-prompt文件](P1-design/prompts/pg-frontend-verifier-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: 實際 issue 編號
   {SD_BRANCH}: P1-design branch
   {PG_BRANCH}: P1-code branch
3. **讀取** verifier agent 的回傳內容（尋找 `---` 邊界之間的內容）：
   - 若包含 `VERIFICATION_RESULT: PASS` → 跳到「完成」
   - 若包含 `VERIFICATION_RESULT: FAIL` → 提取所有 `ISSUE:` / `TS_ERROR:` / `LINT_ERROR:` 行作為新的 feedback
4. 若 attempt >= max_retries → 跳到「失敗停止」
5. attempt += 1，回到步驟 1

### 完成

```bash
cd P1-code && git push
```

輸出：
```
✓ PG frontend agent 完成（第 {attempt} 輪通過）
Issue: {ISSUE_N}
TestReport: TestReport/issue-{ISSUE_N}.md
```

### 失敗停止

```bash
cd P1-code && git push
```

輸出：
```
✗ PG frontend agent 超過最大重試次數（{max_retries} 輪）
Issue: {ISSUE_N}

最後一次驗證問題：
{feedback}

請人工介入處理後重新執行。
```
