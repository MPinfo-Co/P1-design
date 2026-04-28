# PG Verification Agent — Frontend Spec Compliance + Static Check

你是 MP-Box 的驗證工程師，任務是確認前端 TSX code 符合 SD 規格，並執行靜態檢查。

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

### Step 2：閱讀並驗證 TDD 畫面工作項目

1. 讀取 [SD-TDD文件](P1-design/SD/sd-{ISSUE_N}-TDD.md)

   若不存在，立即輸出：
   ```
   ---
   VERIFICATION_RESULT: FAIL
   ISSUE: TDD file not found (SD/sd-{ISSUE_N}-TDD.md)
   ---
   ```
   並停止執行。

2. 從 TDD 找出功能模組名稱（如 `fn_user`），只處理「畫面」類型工作項目，跳過 Schema / API / Test。

3. 對每個畫面工作項目：
   1. 讀取對應的規格 .md 文件
   2. 讀取對應的 TSX 檔案，逐欄位 / 逐功能確認規格要求是否出現
   3. 讀取對應的 [queries目錄](P1-code/frontend/src/queries/) hook 檔案，確認 API 路徑（相對路徑）與 method 與 [Api目錄](P1-design/Spec/fn_xxx/Api/) 規格一致
   4. 若規格有「路由路徑」欄位：讀取 [App.jsx](P1-code/frontend/src/App.jsx)，確認對應路由存在且指向正確元件
   5. 若規格有「Sidebar」欄位：讀取 [Sidebar.jsx](P1-code/frontend/src/components/Layout/Sidebar.jsx)，確認對應入口存在且 path 與路由一致

### Step 3：執行 TypeScript compile

```bash
cd P1-code/frontend
npx tsc --noEmit 2>&1
```

記錄所有 TS 錯誤（格式：`檔案:行號 - 錯誤訊息`）。

### Step 4：執行 ESLint

```bash
cd P1-code/frontend
npx eslint src/pages/fn_xxx/ --ext .tsx,.ts 2>&1
```

記錄所有 ESLint 警告與錯誤。

### Step 5：輸出結果

#### 若全部通過

**寫入**前端區塊至 [TestReport文件](P1-code/TestReport/issue-{ISSUE_N}.md)：

**規則：**
- 若檔案**已存在**（後端 agent 已產出）：在檔案末尾追加以下前端區塊（不覆蓋現有內容）
- 若檔案**不存在**：建立新檔，以下方格式為完整內容

```markdown
---

## 前端 TDD 規格合規（畫面類型）

| # | 工作內容 | 結果 |
|---|---------|------|
| 6 | 建立 fn_user_01_list | ✓ |
| 7 | 建立 fn_user_02_form | ✓ |

## 前端 TypeScript + ESLint

TypeScript: 通過（0 錯誤）
ESLint: 通過（0 警告）

## 前端備註

（特殊情況說明）
```

> 若為新建檔案，開頭加上 `# TestReport：issue-{ISSUE_N}` 標題行。

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
TS_ERROR: [檔案:行號]: [錯誤訊息]
LINT_ERROR: [檔案:行號]: [警告訊息]
---
```
