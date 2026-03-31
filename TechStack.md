# MP-BOX 技術棧

## 階段一：MVP（目前）

**目標：產品上線，核心功能可用**

---

### 一、程式語言
- **Python 3.12+**（後端語言，AI 函式庫豐富）
- **JavaScript**（前端語言，React 生態主流）

### 二、前端
- **Vite**（建置工具，熱更新極速）
- **React 18**（主流 UI 框架）
- **React Router v6**（前端路由）
- **Tailwind CSS v3**（Utility-first CSS）
- **shadcn/ui**（UI 元件庫，基於 Radix UI）
- **Zustand**（Client State 管理）
- **TanStack Query**（Server State 管理）
- **Axios**（HTTP 請求）

### 三、後端框架
- **FastAPI**（高效能 Python Web 框架，自動生成 Swagger 文件）
- **Pydantic**（資料驗證）
- **SQLAlchemy**（ORM，成熟穩定）
- **Alembic**（Migration 工具）

### 四、排程與非同步任務
- **Celery**（分散式任務佇列，執行 Flash Task / Pro Task）
- **Celery Beat**（定時排程，觸發 Flash Task 每 10 分鐘、Pro Task 每日 02:00）
- **Redis**（Celery Broker）

### 五、資料庫
- **PostgreSQL**（主要關聯式資料庫）

### 六、認證
- **自建 JWT**（登入 / 登出 / permission guard，bcrypt 密碼 hash）

### 七、AI 整合
- **Gemini 2.5 Flash**（SSB log 逐 chunk 分析，高速低成本）
- **Gemini 2.5 Pro**（每日彙整、去重、修正嚴重度）
- **Google Generative AI SDK**（Python 呼叫 Gemini API）

### 八、外部系統串接
- **SSB（syslog-ng Store Box）**：REST API `/api/5/` 拉取 log，認證用 AUTHENTICATION_TOKEN cookie

### 九、檔案儲存
- **Cloudflare R2**（物件儲存，無流出費用，S3 API 相容）

### 十、Email
- **Resend**（交易型 Email 服務）

### 十一、客戶支援
- **Crisp**（網站內嵌聊天視窗）

### 十二、安全
- **ClamAV**（開源檔案掃描）