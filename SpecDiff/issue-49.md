# SpecDiff：Issue #49 Workflow Issue Body 精簡測試

## 修改項目及內容
- **Spec/workflow-test.yaml**（added，+58 -0）
```diff
@@ -0,0 +1,58 @@
+openapi: "3.0.3"
+info:
+  title: Workflow Test API
+  version: "1.0.0"
+  description: 用於 workflow 端對端測試的簡易 API Spec
+
+paths:
+  /api/health:
+    get:
+      summary: 系統健康檢查
+      operationId: getHealth
+      responses:
+        "200":
+          description: 服務正常
+          content:
+            application/json:
+              schema:
+                type: object
+                properties:
+                  status:
+                    type: string
+                    example: ok
+
+  /api/workflow/status:
+    get:
+      summary: 取得 workflow 狀態
+      operationId: getWorkflowStatus
+      parameters:
+        - name: format
+          in: query
+          required: false
+          schema:
+            type: string
+            enum: [json, text]
+      responses:
+        "200":
+          description: 成功取得狀態
+          content:
+            application/json:
+              schema:
+                type: object
+                properties:
+                  stage:
+                    type: string
+                    example: PG
+                  epic:
+                    type: string
+                    example: "Workflow Issue Body 精簡測試"
+        "400":
+          description: 無效的 format 參數
+          content:
+            application/json:
+              schema:
+                type: object
+                properties:
+                  error:
+                    type: string
+                    example: "Invalid format parameter"
```

## 關聯項目
- Epic：MPinfo-Co/P1-project#91
- SA Issue：MPinfo-Co/P1-analysis#75
- SD Issue：P1-design #49
- 上一個 commit：04a7220
- 本次 commit：1bd0368