# API Spec：安全事件清單

> 對應 Epic：MPinfo-Co/P1-project#50
> 前置條件：已登入（JWT token 有效）、具資安專家角色

---

## GET /api/events

取得安全事件清單，依嚴重度降冪排序。

**Query Parameters**

| 參數 | 型別 | 必填 | 說明 |
|---|---|---|---|
| status | string | 否 | 篩選狀態，多選用逗號分隔（pending,investigating,resolved,dismissed）|
| keyword | string | 否 | 搜尋 title / affected_summary（ILIKE）|
| date_from | string | 否 | 日期起（ISO8601，event_date >=）|
| date_to | string | 否 | 日期迄（ISO8601，event_date <=）|
| page | int | 否 | 頁碼，預設 1 |
| page_size | int | 否 | 每頁筆數，預設 20，最大 100 |

**排序**：`star_rank DESC`（固定）

**Response 200**
```json
{
  "total": 100,
  "page": 1,
  "page_size": 20,
  "items": [
    {
      "id": 1,
      "event_date": "2026-03-16",
      "date_end": null,
      "star_rank": 5,
      "title": "稽核政策遭大規模竄改",
      "affected_summary": "全域 AD 稽核政策（30,972筆）",
      "detection_count": 30972,
      "current_status": "pending",
      "assignee_user_id": null,
      "created_at": "2026-03-16T02:05:00"
    }
  ]
}
```

**Response 401**：Token 過期或未登入
**Response 403**：無資安專家權限

---

## GET /api/events/{id}

取得單一安全事件完整資料（含處理日誌）。

**Path Parameters**

| 參數 | 型別 | 說明 |
|---|---|---|
| id | int | 事件 ID |

**Response 200**
```json
{
  "id": 1,
  "event_date": "2026-03-16",
  "date_end": null,
  "star_rank": 5,
  "title": "稽核政策遭大規模竄改",
  "description": "【異常發現】...\n【風險分析】...",
  "affected_summary": "全域 AD 稽核政策（30,972筆）",
  "affected_detail": "【受影響對象】...【攻擊來源】...【攻擊行為】...【時間範圍】...",
  "detection_count": 30972,
  "current_status": "pending",
  "match_key": "ad_audit_policy_mpdc19",
  "assignee_user_id": null,
  "suggests": ["立即鎖定帳號", "封鎖來源 IP"],
  "logs": [
    {"id": "813298855461315879", "timestamp": "2026-03-16T13:32:01", "message": "稽核原則變更...", "program": "Microsoft_Windows_security_auditing."}
  ],
  "ioc_list": [],
  "mitre_tags": ["T1562.002"],
  "history": [
    {
      "id": 1,
      "user_id": 1,
      "action": "status_change",
      "old_status": "pending",
      "new_status": "investigating",
      "note": "開始調查",
      "resolved_at": null,
      "created_at": "2026-03-16T09:00:00"
    }
  ],
  "created_at": "2026-03-16T02:05:00",
  "updated_at": "2026-03-16T09:00:00"
}
```

**Response 404**：事件不存在

---

## PATCH /api/events/{id}

更新事件狀態或指派人，自動寫入 event_history。

**Path Parameters**

| 參數 | 型別 | 說明 |
|---|---|---|
| id | int | 事件 ID |

**Request Body**（擇一或多個）
```json
{
  "current_status": "investigating",
  "assignee_user_id": 2
}
```

**副作用**：自動寫入 event_history（action: status_change 或 assign）

**Response 200**：更新後的完整事件資料
**Response 400**：欄位值不合法
**Response 404**：事件不存在

---

## POST /api/events/{id}/history

新增處理日誌（留言或結案）。

**Path Parameters**

| 參數 | 型別 | 說明 |
|---|---|---|
| id | int | 事件 ID |

**Request Body**
```json
{
  "note": "已通知相關人員",
  "resolved_at": "2026-03-16T18:00:00"
}
```

| 欄位 | 必填 | 說明 |
|---|---|---|
| note | 是 | 留言內容 |
| resolved_at | 否 | 解決時間，有填則 action=resolve，否則 action=comment |

**Response 201**：新建的 event_history 資料
**Response 404**：事件不存在