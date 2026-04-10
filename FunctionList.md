# MP-BOX 功能清單

> **用途**：記錄 MP-BOX 所有產品功能的代碼、實作範疇與完成狀態。
> 每個功能對應一個 Epic，是 SA / SD / PG Issue 的對照基準。

## 功能列表

> 編號格式 `f-{domain}-{NN}`（前綴說明詳見下方）；完成狀態：`未開始`（無明確需求）/ `規劃中`（需求明確，待實作）/ `進行中`（實作中，含前端佔位版本）/ `已完成`（前後端串接完整）

| 編號 | 功能 | 說明 | 完成狀態 |
|------|------|------|---------|
| f-auth-01 | 登入 / 登出 | 使用 email + 密碼登入；登出後帳號立即下線 | 已完成 |
| f-evt-01 | 安全事件 | 從設備 log 自動分析安全威脅，整理成事件清單；支援查看詳情、更新處置狀態與記錄處置結果 | 已完成 |
| f-partner-01 | AI 夥伴選擇 | 以卡片列表選擇要使用的 AI 夥伴 | 未開始 |
| f-partner-02 | AI 夥伴管理設定 | 設定 AI 夥伴的分析行為（使用的 AI 模型、提示詞等） | 未開始 |
| f-chat-01 | 諮詢聊天 UI 面板 | 安全事件詳情頁右側聊天介面：訊息輸入、送出、即時顯示 AI 回覆 | 未開始 |
| f-chat-02 | 對話後端 | 收到問題後依 AI 夥伴設定呼叫 AI 模型，即時逐字推送回覆 | 未開始 |
| f-chat-03 | 對話歷史 | 保存對話記錄並與安全事件關聯；重新開啟時可載入歷史 | 未開始 |
| f-kb-01 | 知識庫列表 | 查閱所有知識庫 | 規劃中 |
| f-kb-02 | 文件上傳與管理 | 知識庫內文件的上傳 / 列表 / 刪除 / 預覽 | 規劃中 |
| f-kb-03 | 資料表管理 | 知識庫內表格型資料的建立與維護 | 規劃中 |
| f-kb-04 | 知識庫存取權限 | 單一知識庫的讀寫權限設定 | 規劃中 |
| f-user-01 | 帳號管理 | 新增 / 編輯 / 停用帳號 | 未開始 |
| f-user-02 | 角色管理 | 管理角色與權限設定 | 未開始 |

## 功能編號說明

每個功能有一個固定代碼 `f-{domain}-{NN}`，可在 Issue、Commit 中引用：

| 前綴 | 領域 |
|------|------|
| `f-auth` | 登入 / 認證 |
| `f-evt` | 安全事件 |
| `f-partner` | AI 夥伴（選擇與管理設定）|
| `f-chat` | 諮詢聊天面板 |
| `f-kb` | 知識庫 |
| `f-user` | 使用者管理（帳號 / 角色）|

<details>
<summary>共用基礎設施（開發人員參考）</summary>

以下檔案跨多個功能共用或不屬於任何產品功能，**保留原檔名**，不加功能編號前綴：

### Backend

| 檔案 | 原因 |
|------|------|
| `backend/app/main.py` | FastAPI 唯一入口 |
| `backend/app/core/config.py` | 全域環境設定 |
| `backend/app/db/session.py` | 資料庫連線，所有功能共用 |
| `backend/app/api/health.py` | 健檢端點，非產品功能 |
| `backend/app/worker.py` | 背景任務排程基礎設定 |
| `backend/seed.py` | 初始化腳本（建立預設帳號與角色）|
| `backend/alembic/env.py` | 資料庫版本遷移入口 |
| `backend/app/**/__init__.py`、`backend/tests/__init__.py` | Python 套件標記檔 |

### Frontend

| 檔案 | 原因 |
|------|------|
| `frontend/src/main.jsx` | 應用程式入口 |
| `frontend/src/App.jsx` | 路由設定 |
| `frontend/src/theme.js` | 介面主題設定 |
| `frontend/src/components/Layout/*.jsx` | 共用版面元件（頁首 / 側欄 / 外框）|
| `frontend/src/components/ui/*.jsx` | 共用 UI 元件（標籤 / 彈窗 / 分頁）|
| `frontend/src/pages/NotFound.jsx` | 404 錯誤頁，非產品功能 |

</details>

## 維護規則

- **Epic 顆粒度**：單一功能預估工作量以 **1 週**為上限；超過應拆分為多個編號
- **新增功能**：於該領域取下一個流水號（如 `f-evt` 目前到 01，下一個為 `f-evt-02`）
- **廢棄功能**：標記 `[DEPRECATED]`，**不回收編號**
- **粗顆粒項目細化**：保留原編號為集合，新增 -02、-03… 表示子項目

<details>
<summary>各功能對應程式碼（開發人員參考）</summary>

| 編號 | 後端 | 前端 |
|------|------|------|
| f-auth-01 | `api/auth.py`、`core/security.py`、`core/deps.py`、`models/token_blacklist.py`、`schemas/auth.py` | `pages/Login/Login.jsx`、`stores/authStore.js` |
| f-evt-01 | `api/events.py`、`models/security_event.py`、`schemas/security_event.py`、`services/ssb_client.py`、`services/log_preaggregator.py`、`services/claude_flash.py`、`services/claude_pro.py`、`tasks/flash_task.py`、`tasks/pro_task.py`、`scripts/run_pipeline.py`、`scripts/run_planb_comparison.py` | `pages/AiPartner/IssueList.jsx`、`pages/AiPartner/IssueDetail.jsx`、`contexts/IssuesContext.jsx`、`data/issues.js` |
| f-partner-01 | — | `pages/AiPartner/AiPartner.jsx` |
| f-partner-02 | — | `pages/Settings/AiConfig.jsx`、`data/aiPartners.js` |
| f-chat-01 | — | — |
| f-chat-02 | — | — |
| f-chat-03 | — | — |
| f-kb-01 | — | `pages/KnowledgeBase/KnowledgeBase.jsx`、`data/knowledgeBase.js`、`data/mockKnowledge.js` |
| f-kb-02 | — | `pages/KnowledgeBase/DocTab.jsx` |
| f-kb-03 | — | `pages/KnowledgeBase/TableTab.jsx` |
| f-kb-04 | — | `pages/KnowledgeBase/AccessTab.jsx` |
| f-user-01 | `models/user.py`（User 類，model 已建立但無 API） | `pages/Settings/Account.jsx`、`data/users.js` |
| f-user-02 | `models/user.py`（Role、UserRole 類，model 已建立但無 API） | `pages/Settings/Role.jsx` |

</details>

<details>
<summary>程式碼命名規則（開發人員參考）</summary>

- **Python 與前端（JSX / JS）檔名**：以 `f_{domain}_{NN}_{semantic}` 為前綴（底線因 Python 模組命名限制；前端為求一致亦採用）
  - 只有一個語意名稱時可省略 semantic，例：`f_auth_01.py`
  - 多個檔案屬同一編號時以 semantic 區分，例：`f_evt_01_ssb_client.py`
- **Commit message**：`feat: f-evt-01 新增事件篩選邏輯`
- **Model 歸屬原則**：model 的 owner = 「管理該資料」的功能，而非「使用它」的功能。例：`User` model 屬 f-user-01（帳號管理），不屬 f-auth-01（登入只是讀取）
- **既有檔案改名**：見 [MPinfo-Co/P1-code#93](https://github.com/MPinfo-Co/P1-code/issues/93)

</details>
