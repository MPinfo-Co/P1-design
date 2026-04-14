# MP-BOX 功能清單

> **用途**：記錄 MP-BOX 所有產品功能的代碼、實作範疇與完成狀態。

## 功能列表

> 各功能畫面拆分詳見 [P1-design/Spec](Spec/) 中的各資料夾。

| 編號 | 功能 | 說明 | 完成狀態 |
|------|------|------|---------|
| auth | 登入 / 認證 | 使用 email + 密碼登入；登出後帳號立即下線 | 已完成 |
| home | 首頁 | 目前導引至 AI 夥伴頁面 | 已完成 |
| evt | 安全事件 | 從設備 log 自動分析安全威脅，整理成事件清單；支援查看詳情、更新處置狀態與記錄處置結果 | 已完成 |
| partner | AI 夥伴 | 選擇要使用的 AI 夥伴，並設定其分析行為（模型、提示詞等） | 未開始 |
| chat | 諮詢聊天 | 安全事件詳情頁的聊天介面，含 UI 面板、對話後端與歷史保存 | 未開始 |
| kb | 知識庫 | 管理知識庫、文件與表格型資料，設定存取權限 | 規劃中 |
| user | 使用者管理 | 管理帳號與角色權限設定 | 未開始 |

## 功能編號說明

每個功能領域有一個固定代碼 `{domain}`，可在 Issue、Commit 中引用。子功能以 `{domain}-{NN}` 延伸，詳見 [Spec/](Spec/) 各功能資料夾。

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
| `frontend/src/pages/Home/Home.jsx` | 歡迎頁，非產品功能 |
| `frontend/src/pages/NotFound.jsx` | 404 錯誤頁，非產品功能 |
| `frontend/src/lib/api.js` | axios 設定與 token 注入，所有功能共用 |

</details>

## 維護規則

- **Epic 顆粒度**：單一功能預估工作量以 **1 週**為上限；超過應拆分為多個編號
- **新增 domain**：於表格新增一列，編號格式為 `{domain}`
- **子功能細化**：在既有 domain 下取流水號（如 `evt` 拆出子功能，命名為 `evt-01`、`evt-02`），詳見 Spec/ 資料夾
- **廢棄功能**：標記 `[DEPRECATED]`，**不回收編號**
- 各功能對應程式碼：詳見 [Spec/](Spec/) 各功能資料夾
- 程式碼命名規則：詳見 [Spec/code-naming-rules.md](Spec/code-naming-rules.md)
