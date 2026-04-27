# PG Backend Agent Orchestrator

PG issue 後端自動實作工具。呼叫寫作 agent 產出 code，再由驗證 agent 確認規格合規，最多重試 3 輪。

## 使用方式

在 Claude Code 中以此 skill 執行，並提供 issue 編號（例如：66）。

## 執行流程

給定 ISSUE_N（例如 66）：

### 初始化

```
attempt = 1
max_retries = 3
feedback = ""
writer_prompt_path = /Users/rex/Desktop/P1/P1-design/prompts/pg-writer-prompt.md
verifier_prompt_path = /Users/rex/Desktop/P1/P1-design/prompts/pg-verifier-prompt.md
```

### 迴圈（最多 max_retries 次）

1. 讀取 writer_prompt_path 的完整內容
2. 將內容中 `{ISSUE_N}` 替換為實際 issue 編號，`{FEEDBACK}` 替換為當前 feedback
3. 呼叫 `Agent()` tool，使用替換後的 prompt（model: sonnet）
4. 讀取 verifier_prompt_path 的完整內容
5. 將內容中 `{ISSUE_N}` 替換為實際 issue 編號
6. 呼叫 `Agent()` tool，使用替換後的 prompt（model: sonnet）
7. 解析驗證結果（尋找 `---` 邊界之間的內容）：
   - 若包含 `VERIFICATION_RESULT: PASS` → 跳到「完成」
   - 若包含 `VERIFICATION_RESULT: FAIL` → 提取所有 `ISSUE:` 和 `PYTEST_FAILURE:` 行作為新的 feedback
8. 若 attempt >= max_retries → 跳到「失敗停止」
9. attempt += 1，回到步驟 1

### 完成

輸出：
```
✓ PG agent 完成（第 {attempt} 輪通過）
Issue: {ISSUE_N}

下一步請執行：
  cd /Users/rex/Desktop/P1/P1-code
  git diff main --stat
  cat TestReport/issue-{ISSUE_N}.md

確認無誤後再手動 git push。
```

### 失敗停止

輸出：
```
✗ PG agent 超過最大重試次數（{max_retries} 輪）
Issue: {ISSUE_N}

最後一次驗證問題：
{feedback}

請人工介入處理後重新執行。
```
