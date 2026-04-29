# SD Agent Orchestrator

SD issue 自動設計工具。呼叫寫作 agent 產出 TDD，再由審查 agent 確認規格合規，最多重試 3 輪。

## 使用方式

由 GitHub Actions workflow 執行，{ISSUE_N} 與 {SA_N} 已由 sed 替換為實際數字。

## 執行流程

### 初始化

```
attempt = 1
max_retries = 3
feedback = ""
```

### 迴圈（最多 max_retries 次）

1. **呼叫** `Agent()` tool，prompt 為 [sd-writer-prompt文件](prompts/sd-writer-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: SD issue 編號（已被 sed 替換）
   {SA_N}: 關聯 SA issue 編號（已被 sed 替換）
   {FEEDBACK}: 當前 feedback
2. **呼叫** `Agent()` tool，prompt 為 [sd-reviewer-prompt文件](prompts/sd-reviewer-prompt.md) 的內容，傳入參數如下：
   {ISSUE_N}: SD issue 編號（已被 sed 替換）
   {SA_N}: 關聯 SA issue 編號（已被 sed 替換）
3. **讀取** reviewer agent 的回傳內容（尋找 `---` 邊界之間的內容）：
   - 若包含 `VERIFICATION_RESULT: PASS` → 跳到「完成」
   - 若包含 `VERIFICATION_RESULT: FAIL` → 提取所有 `ISSUE:` 行作為新的 feedback
4. 若 attempt >= max_retries → 跳到「失敗停止」
5. attempt += 1，回到步驟 1

### 完成

輸出：
```
✓ SD agent 完成（第 {attempt} 輪通過）
Issue: {ISSUE_N}
文件：SD/sd-{ISSUE_N}-TDD.md
```

**注意：不執行 git push，push 由 GitHub Actions workflow 負責。**

### 失敗停止

輸出：
```
✗ SD agent 超過最大重試次數（{max_retries} 輪）
Issue: {ISSUE_N}

最後一次驗證問題：
{feedback}

請人工介入處理後重新執行。
```

**注意：不執行 git push，push 由 GitHub Actions workflow 負責。**
