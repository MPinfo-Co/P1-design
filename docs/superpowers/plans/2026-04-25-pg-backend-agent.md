# PG Backend Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立三個 Claude Code skill 檔（寫作 agent、驗證 agent、Orchestrator），讓 PG issue 的後端 code 能自動由 SD 文件產出並驗證。

**Architecture:** Orchestrator 讀取 SD 文件後呼叫寫作 subagent（產出 FastAPI code），再呼叫驗證 subagent（比對規格 + 跑 pytest），最多重試 3 輪，全通過後產出 TestReport。全程不 push，code 保留在本地 branch。

**Tech Stack:** Claude Code Agent tool, Python 3.12, FastAPI, SQLAlchemy, pytest, SQLite（測試 DB）

---

## 檔案地圖

建立：
- `P1-design/agents/pg-writer-prompt.md` — 寫作 subagent 的 prompt
- `P1-design/agents/pg-verifier-prompt.md` — 驗證 subagent 的 prompt
- `P1-design/agents/pg-orchestrator.md` — Orchestrator skill（使用者呼叫的入口）
- `P1-code/backend/app/api/user.py` — 4 支使用者管理 API（由寫作 agent 產出）
- `P1-code/backend/app/schemas/user.py` — Pydantic 請求／回應模型（由寫作 agent 產出）
- `P1-code/backend/tests/test_user_api.py` — pytest（由寫作 agent 產出）
- `P1-code/TestReport/issue-66.md` — 測試報告（由驗證 agent 產出）

修改：
- `P1-code/backend/app/db/models/user.py` — 補 `updated_by` 欄位
- `P1-code/backend/app/main.py` — 加入 user router
- `P1-code/backend/tests/conftest.py` — 修正 import 路徑

---

## Task 1：建立 agents 目錄 + 寫作 agent prompt

**Files:**
- Create: `P1-design/agents/pg-writer-prompt.md`

- [ ] **Step 1：建立目錄**

```bash
mkdir -p /Users/rex/Desktop/P1/P1-design/agents
```

Expected: 目錄建立成功，無錯誤訊息。

- [ ] **Step 2：建立 pg-writer-prompt.md**

Write `/Users/rex/Desktop/P1/P1-design/agents/pg-writer-prompt.md`：

````markdown
# PG Writing Agent — Backend Implementation

你是 P1 專案的後端工程師 (PG)，任務是依據 SD 文件實作 FastAPI 後端 code。

## 輸入
- Issue 編號：{ISSUE_N}
- P1-design 路徑：/Users/rex/Desktop/P1/P1-design（branch: issue-{ISSUE_N}-issue）
- P1-code 路徑：/Users/rex/Desktop/P1/P1-code（branch: test/pg-agent-{ISSUE_N}）

## 前次驗證回饋（若有）
{FEEDBACK}

若有回饋，**優先修正**回饋中的問題，再執行下方步驟。

---

## 執行步驟

### Step 1：切換 P1-code 分支

```bash
cd /Users/rex/Desktop/P1/P1-code
git checkout main && git pull
git checkout test/pg-agent-{ISSUE_N} 2>/dev/null || git checkout -b test/pg-agent-{ISSUE_N}
```

### Step 2：閱讀 SD 文件

依序讀取（路徑以 `/Users/rex/Desktop/P1/P1-design/` 為根）：
1. `TDD/issue-{ISSUE_N}.md` — 工作項目清單（必讀）
2. `SA/sa-{ISSUE_N}-logic.md` — 商業邏輯背景（若不存在則跳過）
3. `schema/schema.md` — DB schema
4. 每支 API 工作項目對應的 `Spec/fn_xxx/Api/*.md`
5. `techStack.md` — 技術選型

### Step 3：依工作項目實作

#### Schema 類型工作項目

讀取 `/Users/rex/Desktop/P1/P1-code/backend/app/db/models/user.py`，
比對 schema.md，補充缺少的欄位。**不刪除現有欄位。**

User 模型需補充（若 `updated_by` 不存在）：
```python
updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
```

#### API 類型工作項目

在 `/Users/rex/Desktop/P1/P1-code/backend/app/api/user.py` 建立 router，
遵循 `/Users/rex/Desktop/P1/P1-code/backend/app/api/auth.py` 的模式。

JWT 驗證 + 權限檢查 helper：
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user import User, Role, UserRole
from app.core.security import decode_access_token, hash_password

router = APIRouter(prefix="/api/users", tags=["users"])
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="未登入或 Token 過期")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="未登入或 Token 過期")
    return user


def require_manage_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    roles = (
        db.query(Role)
        .join(UserRole, Role.id == UserRole.role_id)
        .filter(UserRole.user_id == current_user.id)
        .all()
    )
    if not any(r.can_manage_accounts for r in roles):
        raise HTTPException(status_code=403, detail="您沒有執行此操作的權限")
    return current_user
```

4 支 API 依各自 Spec 實作：
- `GET /api/users` → fn_user_query_api.md（query params：角色職位 int?, 關鍵字 str?）
- `POST /api/users` → fn_user_add_api.md（body：名稱, email, 密碼, 角色[]）
- `PATCH /api/users/{email}` → fn_user_update_api.md（body：名稱?, email?, 角色[]?）
- `DELETE /api/users/{email}` → fn_user_del_api.md

Pydantic schemas 寫在 `/Users/rex/Desktop/P1/P1-code/backend/app/schemas/user.py`。

#### Test 類型工作項目

在 `/Users/rex/Desktop/P1/P1-code/backend/tests/test_user_api.py` 建立 pytest。
- 若存在 `Spec/fn_xxx/Api/_fn_user_test_api.md`，讀取其測試案例 ID
- 若不存在，自行標注 T1、T2...，每支 API 至少 2 個案例（正常 + 401）
- 格式：
```python
def test_xxx(client, db_session):
    """對應 T1"""
    ...
```

使用 conftest.py 的 `client` fixture。

### Step 4：更新 main.py

讀取 `/Users/rex/Desktop/P1/P1-code/backend/app/main.py`，加入：
```python
from .api.user import router as user_router
# 在 include_router 區段加入：
app.include_router(user_router)
```

### Step 5：修正 conftest.py

讀取 `/Users/rex/Desktop/P1/P1-code/backend/tests/conftest.py`。
將 `from app.models.user import Role, User, UserRole` 改為：
```python
from app.db.models.user import Role, User, UserRole
```

### Step 6：commit（不 push）

```bash
cd /Users/rex/Desktop/P1/P1-code
git add backend/ TestReport/
git commit -m "feat(user): implement issue-{ISSUE_N} backend"
```

**嚴禁執行 git push。**
````

- [ ] **Step 3：確認檔案建立**

```bash
ls /Users/rex/Desktop/P1/P1-design/agents/
```

Expected: 看到 `pg-writer-prompt.md`

- [ ] **Step 4：commit**

```bash
cd /Users/rex/Desktop/P1/P1-design
git add agents/pg-writer-prompt.md
git commit -m "feat(agents): 新增 pg-writer-prompt"
```

---

## Task 2：手動測試寫作 agent（issue-66）

**目標：** 驗證 pg-writer-prompt.md 能正確驅動 subagent 產出 issue-66 的後端 code。

**Files:**
- Create (by agent): `P1-code/backend/app/api/user.py`
- Create (by agent): `P1-code/backend/app/schemas/user.py`
- Create (by agent): `P1-code/backend/tests/test_user_api.py`
- Modify (by agent): `P1-code/backend/app/db/models/user.py`
- Modify (by agent): `P1-code/backend/app/main.py`
- Modify (by agent): `P1-code/backend/tests/conftest.py`

- [ ] **Step 1：讀取 writer prompt**

Read `/Users/rex/Desktop/P1/P1-design/agents/pg-writer-prompt.md`

- [ ] **Step 2：呼叫寫作 subagent**

以 `Agent()` tool 呼叫，prompt 為 pg-writer-prompt.md 的內容，
將 `{ISSUE_N}` 替換為 `66`，`{FEEDBACK}` 替換為空字串。

- [ ] **Step 3：確認產出檔案存在**

```bash
ls /Users/rex/Desktop/P1/P1-code/backend/app/api/user.py
ls /Users/rex/Desktop/P1/P1-code/backend/app/schemas/user.py
ls /Users/rex/Desktop/P1/P1-code/backend/tests/test_user_api.py
```

Expected: 三個檔案均存在。

- [ ] **Step 4：確認 git branch 正確**

```bash
cd /Users/rex/Desktop/P1/P1-code && git branch --show-current
```

Expected: `test/pg-agent-66`

- [ ] **Step 5：手動跑 pytest 確認語法無誤**

```bash
cd /Users/rex/Desktop/P1/P1-code/backend && python -m pytest tests/test_user_api.py -v 2>&1 | head -40
```

Expected: pytest 能執行（無 ImportError、SyntaxError），部分測試可能 fail 沒關係。

---

## Task 3：建立驗證 agent prompt

**Files:**
- Create: `P1-design/agents/pg-verifier-prompt.md`

- [ ] **Step 1：建立 pg-verifier-prompt.md**

Write `/Users/rex/Desktop/P1/P1-design/agents/pg-verifier-prompt.md`：

````markdown
# PG Verification Agent — Spec Compliance + Test Runner

你是 P1 專案的驗證工程師，任務是確認 PG 產出的後端 code 符合 SD 規格，並執行 pytest。

## 輸入
- Issue 編號：{ISSUE_N}
- P1-design 路徑：/Users/rex/Desktop/P1/P1-design（branch: issue-{ISSUE_N}-issue）
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
1. `TDD/issue-{ISSUE_N}.md` — 工作項目清單
2. `schema/schema.md` — DB schema
3. 每支 API 工作項目對應的 `Spec/fn_xxx/Api/*.md`
4. `Spec/fn_xxx/Api/_fn_xxx_test_api.md` — 測試案例（若存在）

### Step 3：逐項驗證 TDD 工作項目

#### Schema 類型
- 讀取 `backend/app/db/models/user.py`
- 比對 schema.md 欄位（型別、nullable、FK、unique）
- 記錄不符的欄位

#### API 類型
- 讀取 `backend/app/api/user.py`
- 對每支 API 確認：
  - HTTP method 正確
  - endpoint 路徑正確
  - 所有 Spec 中的檢核邏輯有實作（401、403、400、404）
  - response status code 正確
- 記錄缺少或不符的項目

#### Test 類型
- 讀取 `backend/tests/test_user_api.py`
- 確認每個 test function 有 TestSpec ID 標注
- 若 `_fn_xxx_test_api.md` 存在，確認 pytest 數量 ≥ 測試案例數

### Step 4：執行 pytest

```bash
cd /Users/rex/Desktop/P1/P1-code/backend
python -m pytest tests/test_user_api.py -v 2>&1
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

## 備註

（若有特殊情況說明）
```

然後輸出：
```
VERIFICATION_RESULT: PASS
```

#### 若有問題

輸出：
```
VERIFICATION_RESULT: FAIL
ISSUE: [TDD#1] [工作內容]: [具體問題描述]
ISSUE: [TDD#2] [工作內容]: [具體問題描述]
PYTEST_FAILURE: [test_name]: [錯誤訊息]
```
````

- [ ] **Step 2：確認檔案建立**

```bash
ls /Users/rex/Desktop/P1/P1-design/agents/
```

Expected: 看到 `pg-writer-prompt.md` 和 `pg-verifier-prompt.md`

- [ ] **Step 3：commit**

```bash
cd /Users/rex/Desktop/P1/P1-design
git add agents/pg-verifier-prompt.md
git commit -m "feat(agents): 新增 pg-verifier-prompt"
```

---

## Task 4：測試驗證 agent

**目標：** 確認驗證 agent 能正確通過（正確 code）和抓出問題（刻意改壞的 code）。

- [ ] **Step 1：測試 A — 正確 code（應 PASS）**

讀取 `/Users/rex/Desktop/P1/P1-design/agents/pg-verifier-prompt.md`，
呼叫 `Agent()` tool，將 `{ISSUE_N}` 替換為 `66`。

Expected 輸出包含：`VERIFICATION_RESULT: PASS`

- [ ] **Step 2：刻意破壞 code**

讀取 `P1-code/backend/app/api/user.py`，
在 `GET /api/users` 的 handler 中移除 401 驗證（暫時刪除 `require_manage_accounts` dependency）。

- [ ] **Step 3：測試 B — 破壞後的 code（應 FAIL）**

再次呼叫驗證 agent subagent（同 Step 1）。

Expected 輸出包含：
- `VERIFICATION_RESULT: FAIL`
- 至少一行 `ISSUE:` 指出缺少權限驗證

- [ ] **Step 4：還原破壞的 code**

用 git 還原：
```bash
cd /Users/rex/Desktop/P1/P1-code
git checkout backend/app/api/user.py
```

---

## Task 5：建立 Orchestrator skill

**Files:**
- Create: `P1-design/agents/pg-orchestrator.md`

- [ ] **Step 1：建立 pg-orchestrator.md**

Write `/Users/rex/Desktop/P1/P1-design/agents/pg-orchestrator.md`：

````markdown
# PG Backend Agent Orchestrator

PG issue 後端自動實作工具。呼叫寫作 agent 產出 code，再由驗證 agent 確認規格合規，最多重試 3 輪。

## 使用方式

在 Claude Code 中呼叫此 skill，並提供 issue 編號（例如：66）。

## 執行流程

給定 ISSUE_N（例如 66）：

### 初始化

```
attempt = 1
max_retries = 3
feedback = ""
writer_prompt_path = /Users/rex/Desktop/P1/P1-design/agents/pg-writer-prompt.md
verifier_prompt_path = /Users/rex/Desktop/P1/P1-design/agents/pg-verifier-prompt.md
```

### 迴圈（最多 max_retries 次）

1. 讀取 writer_prompt_path 的內容
2. 將內容中 `{ISSUE_N}` 替換為實際 issue 編號，`{FEEDBACK}` 替換為當前 feedback
3. 呼叫 `Agent()` tool，使用替換後的 prompt
4. 讀取 verifier_prompt_path 的內容
5. 將內容中 `{ISSUE_N}` 替換為實際 issue 編號
6. 呼叫 `Agent()` tool，使用替換後的 prompt
7. 解析驗證結果：
   - 若包含 `VERIFICATION_RESULT: PASS` → 跳到「完成」
   - 若包含 `VERIFICATION_RESULT: FAIL` → 提取所有 `ISSUE:` 和 `PYTEST_FAILURE:` 行作為新的 feedback
8. 若 attempt >= max_retries → 跳到「失敗停止」
9. attempt += 1，回到步驟 1

### 完成

印出：
```
✓ PG agent 完成（第 {attempt} 輪）
請執行：
  cd /Users/rex/Desktop/P1/P1-code
  git diff main
  cat TestReport/issue-{ISSUE_N}.md
確認無誤後再手動 git push。
```

### 失敗停止

印出：
```
✗ PG agent 超過最大重試次數（{max_retries} 輪）
最後一次驗證問題：
{feedback}
請人工介入處理後重新執行。
```
````

- [ ] **Step 2：確認三個 agent 檔案都存在**

```bash
ls /Users/rex/Desktop/P1/P1-design/agents/
```

Expected: `pg-orchestrator.md  pg-verifier-prompt.md  pg-writer-prompt.md`

- [ ] **Step 3：commit**

```bash
cd /Users/rex/Desktop/P1/P1-design
git add agents/pg-orchestrator.md
git commit -m "feat(agents): 新增 pg-orchestrator skill"
```

---

## Task 6：端對端測試（Orchestrator + 修正迴圈）

**目標：** 驗證 Orchestrator 能在 issue-66 上從頭跑到底，完成 TestReport。

- [ ] **Step 1：清空 test branch 重新開始**

```bash
cd /Users/rex/Desktop/P1/P1-code
git checkout main
git branch -D test/pg-agent-66 2>/dev/null || true
```

- [ ] **Step 2：呼叫 pg-orchestrator skill**

讀取 `/Users/rex/Desktop/P1/P1-design/agents/pg-orchestrator.md`，
依照 Orchestrator 流程，以 ISSUE_N = 66 執行完整迴圈。

- [ ] **Step 3：確認 TestReport 產出**

```bash
cat /Users/rex/Desktop/P1/P1-code/TestReport/issue-66.md
```

Expected: 檔案存在，包含規格合規表格 + pytest 結果。

- [ ] **Step 4：確認 code 在正確 branch**

```bash
cd /Users/rex/Desktop/P1/P1-code && git branch --show-current
```

Expected: `test/pg-agent-66`

- [ ] **Step 5：確認未 push 到 remote**

```bash
cd /Users/rex/Desktop/P1/P1-code && git log origin/main..HEAD --oneline 2>/dev/null | head -5
```

Expected: 顯示本地 commit（代表未 push）或提示 origin 無此 branch（正常）。

- [ ] **Step 6：人工審查**

執行：
```bash
cd /Users/rex/Desktop/P1/P1-code && git diff main --stat
```

手動確認：
- `app/api/user.py` 有 4 支路由
- `app/schemas/user.py` 有對應 Pydantic 模型
- `tests/test_user_api.py` 有 TestSpec ID 標注
- TestReport 內容合理

---

## Task 7：Phase 2 — /pg slash command

**目標：** 將 Orchestrator 包裝為可直接輸入 `/pg 66` 的 slash command。

**Files:**
- Create: `P1-design/agents/pg-slash-command.md`（skill wrapper）

- [ ] **Step 1：建立 slash command skill**

Write `/Users/rex/Desktop/P1/P1-design/agents/pg-slash-command.md`：

```markdown
# /pg — PG Backend Agent

快速入口：輸入 `/pg {ISSUE_N}` 啟動 PG Backend Agent。

## 步驟

1. 讀取 `/Users/rex/Desktop/P1/P1-design/agents/pg-orchestrator.md`
2. 以 args 中的 issue 編號作為 ISSUE_N，依照 Orchestrator 流程執行
```

- [ ] **Step 2：在 settings.json 註冊 skill**

使用 update-config skill 或手動在 `.claude/settings.json` 加入 pg skill 路徑。

- [ ] **Step 3：測試呼叫**

在 Claude Code 輸入：`/pg 66`

Expected: Orchestrator 正常啟動。

- [ ] **Step 4：commit**

```bash
cd /Users/rex/Desktop/P1/P1-design
git add agents/pg-slash-command.md
git commit -m "feat(agents): 新增 /pg slash command"
```

---

## Phase 3（未來計畫）

GitHub Actions 自動觸發屬於獨立部署計畫，本計畫不涵蓋。主要工作：

1. 在 GitHub repo secrets 加入 `ANTHROPIC_API_KEY`
2. 寫 `.github/workflows/pg-agent.yml`：SD merge → 建立 PG branch → 執行 `claude skill pg-orchestrator {ISSUE_N}` → commit & push → 開 PR
3. 測試：手動觸發 workflow，確認 Actions runner 能正確執行

---

## 成功標準

- [ ] 寫作 agent 依 TDD 產出完整後端 code（model、API、pytest）
- [ ] 驗證 agent 能抓出規格不符的問題
- [ ] Orchestrator 在 3 輪內收斂，產出 TestReport
- [ ] 全程未 push 到 remote
