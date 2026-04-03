# MP-BOX 技術棧

## 程式語言
- **Python 3.12+**（後端語言，AI 函式庫豐富）
- **TypeScript**（前端語言，React 生態主流）

## 前端
- **Vite**（建置工具，熱更新極速）
- **React 19**（主流 UI 框架）
- **React Router v7**（前端路由）
- **Tailwind CSS v3**（Utility-first CSS）
- **MUI（Material UI）**（UI 元件庫）
- **Zustand**（Client State 管理）
- **TanStack Query**（Server State 管理）
- **Axios**（HTTP 請求）

## 後端框架
- **FastAPI**（高效能 Python Web 框架，自動生成 Swagger 文件）
- **Pydantic**（資料驗證）
- **SQLAlchemy**（ORM，成熟穩定）
- **Alembic**（Migration 工具）

## 排程與非同步任務
- **Celery**（分散式任務佇列，執行 Flash Task / Pro Task）
- **Celery Beat**（定時排程，觸發 Flash Task 每 10 分鐘、Pro Task 每日 02:00）
- **Redis**（Celery Broker）

## 資料庫
- **PostgreSQL**（主要關聯式資料庫）

## 認證
- **自建 JWT**（登入 / 登出 / permission guard，bcrypt 密碼 hash）

## AI 整合
- **Claude Haiku**（`claude-haiku-4-5-20251001`，SSB log 逐 chunk 分析，高速低成本）
- **Claude Sonnet**（`claude-sonnet-4-6`，每日彙整、去重、修正嚴重度）
- **Anthropic Python SDK**（Python 呼叫 Claude API）

## 外部系統串接
- **SSB（syslog-ng Store Box）**：REST API `/api/5/` 拉取 log，認證用 AUTHENTICATION_TOKEN cookie

## 檔案儲存
- **Cloudflare R2**（物件儲存，無流出費用，S3 API 相容）

## Email
- **Resend**（交易型 Email 服務）

## 客戶支援
- **Crisp**（網站內嵌聊天視窗）

## 安全
- **ClamAV**（開源檔案掃描）