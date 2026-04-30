# 共用基礎設施 — Frontend

以下檔案跨多個功能共用或不屬於任何產品功能，**保留原檔名**，不加功能編號前綴：

| 檔案                                     | 說明                        |
| -------------------------------------- | ------------------------- |
| `frontend/src/main.jsx`                | 應用程式入口                    |
| `frontend/src/App.jsx`                 | 路由設定                      |
| `frontend/src/theme.js`                | 介面主題設定                    |
| `frontend/src/components/Layout/*.jsx` | 共用版面元件（頁首 / 側欄 / 外框）      |
| `frontend/src/components/ui/*.jsx`     | 共用 UI 元件（標籤 / 彈窗 / 分頁）    |
| `frontend/src/lib/api.js`              | axios 設定與 token 注入，所有功能共用 |
| `frontend/src/pages/NotFound.jsx`      | 404 錯誤頁，非產品功能             |
