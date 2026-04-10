# MP-BOX 功能清單

## 功能列表

> 編號格式 `f-{domain}-{NN}`（規則詳見下方）；完成狀態：`未開始` / `規劃中` / `進行中` / `已完成`

| 編號 | 功能 | 說明 | 對應 code | 完成狀態 |
|------|------|------|-----------|---------|
| f-auth-01 | 登入 / 登出 | 使用 email 登入系統，取得 JWT token；登出時加入 token 黑名單 | 後端：`api/auth.py`、`core/security.py`、`core/deps.py`、`models/token_blacklist.py`、`schemas/auth.py`<br>前端：`pages/Login/Login.jsx`、`stores/authStore.js` | 已完成 |
| f-evt-01 | 安全事件 | 涵蓋 SSB log 拉取、FortiGate log 預彙總、Claude Haiku 批次分析、Claude Sonnet 每日彙整、事件清單 / 詳情 / 狀態更新 / 處置紀錄的完整 pipeline | 後端：`api/events.py`、`models/security_event.py`、`schemas/security_event.py`、`services/ssb_client.py`、`services/log_preaggregator.py`、`services/claude_flash.py`、`services/claude_pro.py`、`tasks/flash_task.py`、`tasks/pro_task.py`、`scripts/run_pipeline.py`、`scripts/run_planb_comparison.py`<br>前端：`pages/AiPartner/IssueList.jsx`、`pages/AiPartner/IssueDetail.jsx`、`contexts/IssuesContext.jsx`、`data/issues.js` | 已完成 |
| f-partner-01 | AI 夥伴選擇 | 以卡片列表選擇要使用的 AI 夥伴 | 前端：`pages/AiPartner/AiPartner.jsx` | 未開始 |
| f-partner-02 | AI 夥伴管理設定 | 設定與管理 AI 夥伴的參數與配置 | 前端：`pages/Settings/AiConfig.jsx`、`data/aiPartners.js`（mock data） | 未開始 |
| f-chat-01 | 諮詢聊天 UI 面板 | 安全事件詳情頁右側的聊天介面 | — | 未開始 |
| f-chat-02 | SSE 對話串流後端 | AI 對話以 Server-Sent Events 串流回應 | — | 未開始 |
| f-chat-03 | 對話歷史儲存 | 以安全事件為單位保存對話紀錄並關聯 | — | 未開始 |
| f-kb-01 | 知識庫列表 | 查閱所有知識庫 | 前端：`pages/KnowledgeBase/KnowledgeBase.jsx`、`data/knowledgeBase.js`、`data/mockKnowledge.js`（mock data） | 規劃中 |
| f-kb-02 | 文件上傳與管理 | 知識庫內文件的上傳 / 列表 / 刪除 / 預覽 | 前端：`pages/KnowledgeBase/DocTab.jsx`（目前使用 mock data） | 規劃中 |
| f-kb-03 | 結構化資料表管理 | 知識庫內表格資料的建立與維護 | 前端：`pages/KnowledgeBase/TableTab.jsx`（目前使用 mock data） | 規劃中 |
| f-kb-04 | 知識庫存取權限 | 單一知識庫的讀寫權限設定 | 前端：`pages/KnowledgeBase/AccessTab.jsx`（目前使用 mock data） | 規劃中 |
| f-user-01 | 帳號管理 | 新增 / 編輯 / 停用帳號 | 後端：`models/user.py`（User 類，model 已建立但無 API）<br>前端：`pages/Settings/Account.jsx`、`data/users.js`（mock data） | 未開始 |
| f-user-02 | 角色管理 | 管理角色與權限設定 | 後端：`models/user.py`（Role、UserRole 類，model 已建立但無 API）<br>前端：`pages/Settings/Role.jsx`（目前使用 mock data） | 未開始 |

## 功能編號規則

格式：`f-{domain}-{NN}`

- `f` = Function
- `domain` = 領域前綴（見下表）
- `NN` = 該領域內兩位流水號

### 領域前綴

| 前綴 | 領域 |
|------|------|
| `f-auth` | 登入 / 認證 |
| `f-evt` | 安全事件 |
| `f-partner` | AI 夥伴（選擇與管理設定） |
| `f-chat` | 諮詢聊天面板 |
| `f-kb` | 知識庫 |
| `f-user` | 使用者管理（帳號 / 角色） |

### 編號在 code 中的引用方式

- **Python 與前端（JSX / JS）檔名**：以 `f_{domain}_{NN}_{semantic}` 為前綴（底線因 Python 模組命名限制；前端為求一致亦採用）
  - 只有一個語意名稱時可省略 semantic，例：`f_auth_01.py`
  - 多個檔案屬同一編號時以 semantic 區分，例：`f_evt_01_ssb_client.py`、`f_evt_01_claude_flash.py`
- **Commit message**：`feat: f-evt-01 新增事件篩選邏輯`
- **Model 歸屬原則**：SQLAlchemy model 的 owner = 「管理該資料」的功能，而非「消費該資料」的功能。例：`User` 屬 f-user-01（帳號管理 owns），不屬 f-auth-01（登入只是 read User）

## 共用基礎設施（不套用編號規則）

以下檔案跨多個 domain 共用或不屬於任何產品功能，**保留原檔名**，不加功能編號前綴：

### Backend

| 檔案 | 原因 |
|------|------|
| `backend/app/main.py` | FastAPI 唯一入口 |
| `backend/app/core/config.py` | 全域環境設定 |
| `backend/app/db/session.py` | SQLAlchemy Session 工廠，所有 domain 共用 |
| `backend/app/api/health.py` | 健檢端點，非產品功能 |
| `backend/app/worker.py` | Celery worker 基礎設定 |
| `backend/seed.py` | 初始化腳本（跨域建 users + roles） |
| `backend/alembic/env.py` | Alembic migration 入口 |
| `backend/app/**/__init__.py`、`backend/tests/__init__.py` | Python package markers |

### Frontend

| 檔案 | 原因 |
|------|------|
| `frontend/src/main.jsx` | Vite 應用入口 |
| `frontend/src/App.jsx` | React Router 路由設定 |
| `frontend/src/theme.js` | MUI 主題設定 |
| `frontend/src/components/Layout/*.jsx` | 共用版面元件（Header / Sidebar / Layout） |
| `frontend/src/components/ui/*.jsx` | 共用 UI 元件（Badge / Modal / Pagination） |
| `frontend/src/pages/NotFound.jsx` | 404 錯誤頁，非產品功能 |

## 維護規則

- **Epic 顆粒度**：單一功能的預估工作量以 **1 週**為上限；超過應拆分為多個編號，並於「說明」欄註明子範疇
- **新增功能**：於該領域取下一個流水號（如 `f-evt` 目前到 01，下一個為 `f-evt-02`）
- **廢棄功能**：標記 `[DEPRECATED]`，**不回收編號**
- **粗顆粒項目細化**：如 `f-evt-01` 未來需細分（例：單獨追蹤 SSB 整合或 Flash 分析），保留原編號為集合，新增 `f-evt-02`、`f-evt-03`…
- **新增領域前綴**：需更新本文件的「領域前綴」表並於 PR 說明動機
- **檔名同步**：code 檔案若屬於某功能編號，遵循「編號在 code 中的引用方式」小節約定（此規則將於本 issue 的 P1-code sub-issue 落實至既有檔案）
- **基礎設施檔案**：見「共用基礎設施」章節，該清單新增項目需於 PR 說明為何不能歸屬單一功能
