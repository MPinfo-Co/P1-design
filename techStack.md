# MP-BOX 技術棧

## 前端
- **語言**：TypeScript（新檔案一律使用 `.tsx`；舊 `.jsx` 漸進式遷移）
- **套件管理**：npm
- **建置工具**：Vite（熱更新極速）
- **UI 框架**：React 19
- **路由**：React Router v7
- **UI 元件庫**：MUI（Material UI）
- **Client State**：Zustand（auth token、登入身份、全域 UI 設定）
- **Server State**：React Query（API 資料 fetch、cache、loading/error 管理）
- **HTTP 請求**：Fetch API
- **程式碼品質**：ESLint

## 後端
- **語言**：Python 3.12+
- **套件管理**：pip
- **Web 框架**：FastAPI（自動生成 Swagger 文件）
- **ASGI 伺服器**：Uvicorn
- **資料驗證**：Pydantic
- **ORM**：SQLAlchemy
- **Migration**：Alembic
- **環境變數**：pydantic-settings

## 資料庫 & 基礎設施
- **PostgreSQL**（主要關聯式資料庫）
- **Redis**（Celery Broker；可擴充為 Cache / Session）

## 排程與非同步任務
- **Celery**（分散式任務佇列，執行 Flash Task / Pro Task）
- **Celery Beat**（定時排程，觸發 Flash Task 每 10 分鐘、Pro Task 每日 02:00）

## 認證
- **自建 JWT**（登入 / 登出 / permission guard，bcrypt 密碼 hash）

## 測試
- **pytest**（後端單元測試 / 整合測試）

## AI / LLM 整合
- **Claude Haiku**（`claude-haiku-4-5-20251001`，SSB log 逐 chunk 分析，高速低成本）
- **Claude Sonnet**（`claude-sonnet-4-6`，每日彙整、去重、修正嚴重度）
- **Anthropic Python SDK**（Python 呼叫 Claude API）

## 部署平台
- **Vercel**（前端）
- **Railway**（後端）

## 檔案儲存（規劃中）
- **Cloudflare R2**（物件儲存，無流出費用，S3 API 相容）

## Email（規劃中）
- **Resend**（交易型 Email 服務）

## 客戶支援（規劃中）
- **Crisp**（網站內嵌聊天視窗）

## 安全（規劃中）
- **ClamAV**（開源檔案掃描）
