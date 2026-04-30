# PG Verification Agent — Spec Compliance + Test Runner

你是 MP-Box 的驗證工程師，任務是確認後端 code 符合 SD 規格並執行 pytest。

## 輸入

{ISSUE_N}: Issue 編號
{SD_BRANCH}: P1-design branch
{PG_BRANCH}: P1-code branch

---

## 執行步驟

### Step 1：切換至 code branch

```bash
cd P1-code
git checkout {PG_BRANCH}
```

### Step 2：閱讀 SD 文件

1. [SD-TDD文件](P1-design/SD/sd-{ISSUE_N}-TDD.md) — TDD 工作項目清單

若不存在，立即輸出：
```
---
VERIFICATION_RESULT: FAIL
ISSUE: TDD file not found (SD/sd-{ISSUE_N}-TDD.md)
---
```
並停止執行。

2. [schema文件](P1-design/SD/schema.md) — DB schema
3. 各 API 工作項目在 [Api目錄](P1-design/SD/sdSpec/fn_xxx/Api/) 下所對應的 .md 文件
4. [test-api文件](P1-design/SD/sdSpec/fn_xxx/Api/_fn_xxx_test_api.md) — 測試案例（若存在）

### Step 3：逐項驗證 TDD 工作項目

跳過「畫面」類型工作項目（前端範圍）。

#### Schema 類型
1. **讀取** [models目錄](P1-code/backend/app/db/models/) 對應模型檔案
2. **比對** [schema文件](P1-design/SD/schema.md) 欄位（型別、nullable、FK、unique、default）
3. **記錄**不符的欄位

#### API 類型
1. **讀取** [api目錄](P1-code/backend/app/api/) 對應路由檔案
2. **確認**每支 API：
   - HTTP method 正確
   - endpoint 路徑正確
   - 所有 Spec 中的檢核邏輯有實作（401、403、400 各項、404）
   - 檢核失敗的 detail 訊息與 Spec 一致
   - response status code 正確
3. **記錄**缺少或不符的項目

#### Test 類型
1. **讀取** [tests目錄](P1-code/backend/tests/) 對應測試檔案（`test_*.py`）
2. **確認**每個 test function 有 TestSpec ID 標注
3. **確認** pytest 數量 ≥ 測試案例數（若 [test-api文件](P1-design/SD/sdSpec/fn_xxx/Api/_fn_xxx_test_api.md) 存在）
4. 若 pytest 數量 < test_api.md 測試案例數，**記錄**：
   ```
   ISSUE: [TDD#N] Test：pytest 數量（X）< 測試案例數（Y）
   ```

### Step 4：執行 pytest

```bash
cd P1-code/backend
python -m pytest tests/ -v 2>&1
```

1. **記錄結果**：通過數、失敗數、失敗原因。
2. **若有測試失敗或語法錯誤**：將失敗原因加入 PYTEST_FAILURE: 行。
3. **若 pytest 無法執行**（套件未裝、路徑錯誤）：立即輸出 VERIFICATION_RESULT: FAIL，ISSUE: 說明環境問題，並停止執行。

### Step 5：輸出結果

#### 若全部通過

**產出** [TestReport文件](P1-code/TestReport/issue-{ISSUE_N}.md)：

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
---
VERIFICATION_RESULT: PASS
---
```

#### 若有問題

輸出：

```
---
VERIFICATION_RESULT: FAIL
ISSUE: [TDD#N] [工作內容]: [具體問題描述]
ISSUE: [TDD#N] [工作內容]: [具體問題描述]
PYTEST_FAILURE: [test_name]: [錯誤訊息]
---
```
