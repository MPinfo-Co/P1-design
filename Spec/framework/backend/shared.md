# 共用基礎設施 — Backend

以下檔案跨多個功能共用或不屬於任何產品功能，**保留原檔名**，不加功能編號前綴：

| 檔案 | 說明 |
|------|------|
| `backend/app/main.py` | FastAPI 唯一入口 |
| `backend/app/core/config.py` | 全域環境設定 |
| `backend/app/db/session.py` | 資料庫連線，所有功能共用 |
| `backend/app/api/health.py` | 健檢端點，非產品功能 |
| `backend/app/worker.py` | 背景任務排程基礎設定 |
| `backend/seed.py` | 初始化腳本（建立預設帳號與角色）|
| `backend/alembic/env.py` | 資料庫版本遷移入口 |
| `backend/app/**/__init__.py`、`backend/tests/__init__.py` | Python 套件標記檔 |
