# 遊戲天地網站 - 項目文件說明

## 核心文件

### HTML/CSS 文件
- `index.html` - 主頁面，包含遊戲列表和主要界面元素
- `offline.html` - 離線頁面，當用戶處於離線狀態時顯示
- `assets/css/styles.css` - 主要樣式表文件，定義網站外觀

### 主要 JavaScript 文件
- `main.js` - 核心功能實現，包含初始化、通知系統、本地存儲管理等
- `error-handler.js` - 錯誤處理系統，用於捕獲、記錄和處理各種錯誤
- `storage-manager.js` - 存儲空間管理器，用於安全地操作本地存儲
- `maintenance.js` - 維護系統，執行定期維護任務
- `browser-compatibility-fix.js` - 瀏覽器兼容性修復，解決各種瀏覽器兼容性問題

### 後端相關
- `server.js` - 簡單的 Node.js 服務器，用於處理 API 請求和錯誤日誌

### 離線支持
- `service-worker.js` - Service Worker 實現，提供離線功能和資源緩存

## 功能模塊

### 存儲系統
- `storage-manager.js` - 提供安全的存儲操作，處理存儲錯誤和限制
- `StorageSpaceManager` 類 - 監控和管理存儲空間使用情況

### 錯誤處理
- `error-handler.js` - 定義 `ErrorHandler` 類，用於捕獲和處理錯誤
- 提供錯誤日誌記錄、錯誤通知和服務器同步功能

### 通知系統
- `NotificationSystem` - 顯示各種類型的通知（成功、錯誤、警告等）
- 支持通知佇列和通知音效

### 維護系統
- `maintenance.js` - 定義 `MaintenanceSystem`，執行定期維護任務
- 提供任務註冊和定期運行機制

### 監控系統
- `StorageMonitor` - 監控存儲操作的性能和錯誤率
- 收集各種指標並在問題發生時發出警告

### 兼容性修復
- `browser-compatibility-fix.js` - 解決瀏覽器兼容性問題和未處理的 Promise 錯誤
- 提供缺失 API 的模擬實現

## 遊戲相關

### 遊戲功能
- 評分系統 - 允許用戶評分和查看遊戲評分
- 評論系統 - 允許用戶留下評論和查看其他用戶的評論
- 收藏系統 - 允許用戶收藏喜歡的遊戲
- 分享功能 - 允許用戶分享遊戲鏈接

### 遊戲資源
- `games/` 目錄 - 包含各個遊戲的資源文件
- 遊戲資源加載和進度顯示功能

## 系統架構

### 依賴關係
- `main.js` 是核心文件，初始化其他模塊
- `error-handler.js` 被多個模塊使用來記錄錯誤
- `storage-manager.js` 依賴於 `error-handler.js` 來記錄存儲錯誤
- `maintenance.js` 依賴於其他模塊來執行維護任務

### 初始化順序
1. `browser-compatibility-fix.js` - 最先加載，確保兼容性
2. `error-handler.js` - 提供全局錯誤處理
3. `main.js` - 初始化主要功能
4. 其他模塊（存儲管理器、維護系統等）

## 已知問題和解決方案

### 瀏覽器兼容性
- 使用 `browser-compatibility-fix.js` 解決各種兼容性問題
- 提供缺失 API 的模擬實現和錯誤處理

### 存儲問題
- 使用 `StorageSpaceManager` 監控存儲空間使用情況
- 實現自動清理機制，避免存儲空間不足

### 錯誤處理
- 使用全局 `unhandledrejection` 事件處理未處理的 Promise 錯誤
- 記錄錯誤並在可能的情況下恢復

### 本地開發環境
- 特殊處理本地環境（localhost, 127.0.0.1），禁用某些可能導致錯誤的功能
- 提供模擬數據，避免在本地環境中進行網絡請求
