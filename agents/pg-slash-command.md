# /pg — PG Backend Agent

快速入口：輸入 `/pg {ISSUE_N}` 啟動後端 PG agent，自動讀 SD 文件、產出 FastAPI code、驗證規格、產出 TestReport。

## 使用方式

```
/pg 66
```

args 中的數字即為 issue 編號。

## 執行步驟

1. 從 args 取得 issue 編號（例如 `66`）
2. 讀取 `/Users/rex/Desktop/P1/P1-design/agents/pg-orchestrator.md`
3. 依照 Orchestrator 的流程執行，以取得的 issue 編號作為 ISSUE_N
