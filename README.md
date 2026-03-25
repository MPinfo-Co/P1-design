# P1-design — MP-BOX 1.0 設計文件

MP-BOX 1.0 的設計文件 repo。

## 這個 repo 是做什麼的

存放產品設計相關的所有文件，包含功能清單、技術棧、資料庫 Schema、UI Prototype。
不放程式碼，不放分析文件。

## 目錄結構

```
P1-design/
├── FunctionList.md      # 產品功能清單
├── TechStack.md         # 技術棧選型（含待討論項目）
├── schema/              # 資料庫 Schema
│   ├── entity-analysis.md           # 實體分析說明文件
│   └── mpbox_postgresql_v3_drawsql.sql  # PostgreSQL DDL
├── Prototype/           # UI 原型（HTML）
│   ├── MP-Box_資安專家_v73_claude.html  # 目前設計基準（v73）
│   └── MP-Box_資安專家_v72_Gemini.html
└── Specs/               # 功能規格文件（待新增）
```

## 各資料夾說明

| 資料夾 / 檔案 | 內容 |
|---|---|
| `FunctionList.md` | 產品所有功能列表與簡述 |
| `TechStack.md` | 技術棧選型，含選擇原因與待討論項目 |
| `schema/` | 資料庫實體分析與 SQL DDL |
| `Prototype/` | UI 原型 HTML，v73 為目前開發基準 |
| `Specs/` | 各功能的頁面與 API 規格文件 |

## 相關 Repo

| Repo | 用途 |
|---|---|
| `P1-analysis` | 需求分析、參考文件 |
| `P1-code` | 前後端程式碼 |
| `P1-project` | 專案管理、AI-CONTEXT.md |
