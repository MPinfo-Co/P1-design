# Health API 規格

## GET /api/health

### 說明
系統健康檢查端點，回傳各服務狀態。

### Request
無需參數或認證。

### Response 200
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T10:00:00Z"
}
```

### Response 503
```json
{
  "status": "degraded",
  "message": "Database connection failed"
}
```
