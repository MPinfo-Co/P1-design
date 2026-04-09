# MP-BOX 功能清單

> 完成狀態選項：`未開始` / `進行中` / `已完成`

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

- **Python / JSX 檔名**：以 `f_{domain}_{NN}_{semantic}` 為前綴（底線因 Python 模組命名限制；JSX 為求一致亦採用）
  - 只有一個語意名稱時可省略 semantic，例：`f_auth_01.py`
  - 多個檔案屬同一編號時以 semantic 區分，例：`f_evt_01_ssb_client.py`、`f_evt_01_claude_flash.py`
- **Commit message**：`feat: f-evt-01 新增事件篩選邏輯`
- **Model 歸屬原則**：SQLAlchemy model 的 owner = 「管理該資料」的功能，而非「消費該資料」的功能。例：`User` 屬 f-user-01（帳號管理 owns），不屬 f-auth-01（登入只是 read User）

### 共用基礎設施（不套用編號規則）

以下檔案跨多個 domain 共用或不屬於任何產品功能，**保留原檔名**，不加功能編號前綴：

| 檔案 | 原因 |
|------|------|
| `backend/app/main.py` | FastAPI 唯一入口 |
| `backend/app/core/config.py` | 全域環境設定 |
| `backend/app/db/session.py` | SQLAlchemy Session 工廠，所有 domain 共用 |
| `backend/app/api/health.py` | 健檢端點，非產品功能 |
| `backend/app/worker.py` | Celery worker 基礎設定 |
| `backend/seed.py` | 初始化腳本（跨域建 users + roles） |
| `backend/app/**/__init__.py` | Python package marker |

## 功能列表

| 編號 | 功能 | 說明 | 對應 code | 完成狀態 |
|------|------|------|-----------|---------|
| f-auth-01 | 登入 / 登出 | 使用 email 登入系統，取得 JWT token；登出時加入 token 黑名單 | 後端：`api/auth.py`、`core/security.py`、`core/deps.py`、`models/user.py`、`models/token_blacklist.py`、`schemas/auth.py`<br>前端：`pages/Login/Login.jsx` | 已完成 |
| f-evt-01 | 安全事件 | 涵蓋 SSB log 拉取、FortiGate log 預彙總、Claude Haiku 批次分析、Claude Sonnet 每日彙整、事件清單 / 詳情 / 狀態更新 / 處置紀錄的完整 pipeline | 後端：`api/events.py`、`models/security_event.py`、`schemas/security_event.py`、`services/ssb_client.py`、`services/log_preaggregator.py`、`services/claude_flash.py`、`services/claude_pro.py`、`tasks/flash_task.py`、`tasks/pro_task.py`、`worker.py`<br>前端：`pages/AiPartner/IssueList.jsx`、`pages/AiPartner/IssueDetail.jsx` | 已完成 |
| f-partner-01 | AI 夥伴選擇 | 以卡片列表選擇要使用的 AI 夥伴 | 前端：`pages/AiPartner/AiPartner.jsx`（目前使用 mock data） | 進行中 |
| f-partner-02 | AI 夥伴管理設定 | 設定與管理 AI 夥伴的參數與配置 | 前端：`pages/Settings/AiConfig.jsx`（目前使用 mock data） | 進行中 |
| f-chat-01 | 右側諮詢聊天面板 | 針對安全事件與 AI 夥伴即時對話諮詢（SSE 串流） | — | 未開始 |
| f-kb-01 | 知識庫列表 | 查閱所有知識庫內容 | 前端：`pages/KnowledgeBase/KnowledgeBase.jsx`（目前使用 mock data） | 進行中 |
| f-kb-02 | 知識庫詳情 | 管理知識庫單一條目（文件 / 資料表 / 存取設定三個 tab） | 前端：`pages/KnowledgeBase/DocTab.jsx`、`pages/KnowledgeBase/TableTab.jsx`、`pages/KnowledgeBase/AccessTab.jsx`（目前使用 mock data） | 進行中 |
| f-user-01 | 帳號管理 | 新增 / 編輯 / 停用帳號 | 前端：`pages/Settings/Account.jsx`（目前使用 mock data） | 進行中 |
| f-user-02 | 角色管理 | 管理角色與權限設定 | 後端：`models/user.py::Role`（model 已建立但無 API）<br>前端：`pages/Settings/Role.jsx`（目前使用 mock data） | 進行中 |

## 維護規則

- **新增功能**：於該領域取下一個流水號（如 `f-evt` 目前到 01，下一個為 `f-evt-02`）
- **廢棄功能**：標記 `[DEPRECATED]`，**不回收編號**
- **粗顆粒項目細化**：如 `f-evt-01` 未來需細分（例：單獨追蹤 SSB 整合或 Flash 分析），保留原編號為集合，新增 `f-evt-02`、`f-evt-03`…
- **新增領域前綴**：需更新本文件的「領域前綴」表並於 PR 說明動機
- **檔名同步**：code 檔案若屬於某功能編號，遵循「編號在 code 中的引用方式」小節約定（此規則將於本 issue 的 P1-code sub-issue 落實至既有檔案）
- **基礎設施檔案**：見「共用基礎設施」小節，該清單新增項目需於 PR 說明為何不能歸屬單一功能
