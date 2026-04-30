# expert-03 AI 分析後端

## 對應程式碼

| 層 | 檔案 |
|----|------|
| 排程 | `app/worker.py`（Celery app + beat schedule） |
| 任務 | `app/tasks/flash_task.py`、`app/tasks/pro_task.py` |
| 服務 | `app/services/ssb_client.py`、`app/services/log_preaggregator.py`、`app/services/claude_flash.py`、`app/services/claude_pro.py` |

---

## Pipeline 架構

```
SSB（Syslog 來源）
  │  fetch_logs()：每 N 分鐘拉取一批 log
  ▼
log_preaggregator.preaggregate()
  │  FortiGate log → deny_external / deny_internal / warning 彙總摘要
  │  Windows log → 原樣通過
  │  效果：~1,500 筆 FortiGate → ~20-50 筆摘要
  ▼
claude_flash（Claude Haiku）：Flash Task（Celery beat，每 N 分鐘）
  │  analyze_chunk()：每批最多 FLASH_CHUNK_SIZE 筆
  │  System prompt：資安事件分析師，輸出 JSON 陣列
  │  回傳欄位：star_rank / title / affected_summary / affected_detail
  │            match_key / log_ids / ioc_list / mitre_tags
  │  每批結果存入 FlashResult（chunk_index=0,1,2...）
  │  批次合併後存 FlashResult（chunk_index=999）
  │  更新當日累計 FlashResult（chunk_index=-1）
  ▼
claude_pro（Claude Sonnet）：Pro Task（Celery beat，每日凌晨）
  │  aggregate_daily()：讀當日累計 FlashResult（chunk_index=-1）
  │  System prompt：資深資安分析師，跨 match_key 合併同類事件
  │  合併規則：同類現象 + 同一根因 + 同一處置方式 → 合併（上限 5 個原始 key）
  │  回傳欄位：+ description / suggests / continued_from_match_key
  ▼
SecurityEvent 資料表
  │  同 match_key 且未結案 → UPDATE（detection_count 累加、date_end 延伸）
  └  新事件 → INSERT
```

---

## 關鍵設計說明

### match_key

程式根據 log 類型自動產生，覆蓋 AI 回傳值：

| Log 類型 | match_key 格式 |
|---------|---------------|
| FortiGate deny（外部來源） | `deny_external_{dstip 前三段}` |
| FortiGate deny（內部廣播） | `deny_internal_broadcast_p{dstport}` |
| FortiGate deny（內部單播） | `deny_internal_{srcip}` |
| FortiGate warning | `warning_{subtype}` |
| Windows | `{event_id}_{username}` |

### star_rank

1=正常資訊 / 2=低風險 / 3=中風險 / 4=高風險 / 5=緊急

### affected_detail 格式

```
【異常發現】發生什麼事+受影響對象（必填）
【風險分析】嚴重性與可能後果（必填）
【攻擊來源】IP 清單（有明確來源才填）
```

### SSB Client

- API：`GET /api/5/search/logspace/filter/{logspace}`
- 支援分頁（offset/limit=1000）
- 自動 re-login（token 失效時）
- 防暴力鎖帳：連續失敗 ≥ 8 次停止嘗試

### Celery 排程

| Task | 排程 | 說明 |
|------|------|------|
| `flash_task` | 每 `FLASH_INTERVAL_MINUTES` 秒 | 拉 log → Haiku 分析 |
| `pro_task` | 每日 `PRO_TASK_HOUR:PRO_TASK_MINUTE` | Sonnet 彙整 → 寫入 SecurityEvent |
