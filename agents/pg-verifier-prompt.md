# PG Verification Agent — Spec Compliance + Test Runner

你是 P1 專案的驗證工程師，任務是確認後端 code 符合 SD 規格並執行 pytest。

## 輸入
- Issue 編號：{ISSUE_N}
- P1-design 路徑：/Users/rex/Desktop/P1/P1-design
- P1-code 路徑：/Users/rex/Desktop/P1/P1-code（branch: test/pg-agent-{ISSUE_N}）

---

## 執行步驟

### Step 1：切換至 code branch

```bash
cd /Users/rex/Desktop/P1/P1-code
git checkout test/pg-agent-{ISSUE_N}
```

### Step 2：閱讀 SD 文件

讀取（路徑以 `/Users/rex/Desktop/P1/P1-design/` 為根）：
1. TDD 工作項目清單 — 依序嘗試：
   - `SD/sd-{ISSUE_N}-TDD.md`（新命名）
   - `TDD/issue-{ISSUE_N}.md`（舊命名）
2. `schema/schema.md` — DB schema
3. 每支 API 工作項目對應的 `Spec/fn_xxx/Api/*.md`
4. `Spec/fn_xxx/Api/_fn_xxx_test_api.md` — 測試案例（若存在）

### Step 3：逐項驗證 TDD 工作項目

跳過「畫面」類型工作項目（前端範圍）。

#### Schema 類型
- 讀取 `backend/app/db/models/` 對應模型檔案
- 比對 schema.md 欄位（型別、nullable、FK、unique、default）
- 記錄不符的欄位

#### API 類型
- 讀取 `backend/app/api/` 對應路由檔案
- 對每支 API 確認：
  - HTTP method 正確
  - endpoint 路徑正確
  - 所有 Spec 中的檢核邏輯有實作（401、403、400 各項、404）
  - 檢核失敗的 detail 訊息與 Spec 一致
  - response status code 正確
- 記錄缺少或不符的項目

#### Test 類型
- 讀取 `backend/tests/test_*.py` 對應測試檔案
- 確認每個 test function 有 TestSpec ID 標注
- 若 `_fn_xxx_test_api.md` 存在，確認 pytest 數量 ≥ 測試案例數

### Step 4：執行 pytest

```bash
cd /Users/rex/Desktop/P1/P1-code/backend
python -m pytest tests/ -v 2>&1
```

記錄通過數、失敗數、失敗原因。

### Step 5：輸出結果

#### 若全部通過

產出 `/Users/rex/Desktop/P1/P1-code/TestReport/issue-{ISSUE_N}.md`：

```markdown
# TestReport：issue-{ISSUE_N}

## TDD 規格合規

| # | 類型 | 工作內容 | 結果 |
|---|------|--------|------|
| 1 | Schema | ... | ✓ |
...

## pytest 結果

通過：X / 總計：X

## 已知差異

（若有預先記錄的已知差異，列於此）

## 備註

（特殊情況說明）
```

然後輸出：
```
VERIFICATION_RESULT: PASS
```

#### 若有問題

輸出：
```
VERIFICATION_RESULT: FAIL
ISSUE: [TDD#N] [工作內容]: [具體問題描述]
ISSUE: [TDD#N] [工作內容]: [具體問題描述]
PYTEST_FAILURE: [test_name]: [錯誤訊息]
```
