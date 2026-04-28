# SA Agent Orchestrator

SA issue 自動分析工具。呼叫寫作 agent 產出 SA 分析文件，再由審查 agent 確認內容合規，最多重試 2 輪。

## 使用方式

在 Claude Code 中以此 skill 執行，並提供 issue 編號（例如：42）。

## 執行流程

### 初始化

```
attempt = 1
max_retries = 2
feedback = ""
```

### 迴圈（最多 max_retries 次）

1. **呼叫** `Agent()` tool，prompt 為 [sa-writer-prompt文件](P1-design/prompts/sa-writer-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: 實際 issue 編號（已被 sed 替換）
   {FEEDBACK}: 當前 feedback
2. **呼叫** `Agent()` tool，prompt 為 [sa-reviewer-prompt文件](P1-design/prompts/sa-reviewer-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: 實際 issue 編號（已被 sed 替換）
3. **讀取** reviewer agent 的回傳內容（尋找 `---` 邊界之間的內容）：
   - 若包含 `VERIFICATION_RESULT: PASS` → 跳到「完成」
   - 若包含 `VERIFICATION_RESULT: FAIL` → 提取所有 `ISSUE:` 行作為新的 feedback
4. 若 attempt >= max_retries → 跳到「失敗停止」
5. attempt += 1，回到步驟 1

### 完成

輸出：
```
✓ SA agent 完成（第 {attempt} 輪通過）
Issue: {ISSUE_N}
文件：SA/sa-{ISSUE_N}-logic.md
```

**git push 由 GitHub Actions workflow 負責，此 orchestrator 不自行 push。**

### 失敗停止

輸出：
```
✗ SA agent 超過最大重試次數（{max_retries} 輪）
Issue: {ISSUE_N}

最後一次驗證問題：
{feedback}

請人工介入處理後重新執行。
```
