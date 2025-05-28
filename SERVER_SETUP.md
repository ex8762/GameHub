# 遊戲天地網站伺服器設置指南

## 概述

「遊戲天地」是一個靜態網頁遊戲網站，使用Express.js作為後端伺服器，提供以下功能：

- 靜態文件服務
- 評論系統API
- 星星評分系統
- PWA (漸進式網頁應用) 支持
- 離線訪問能力

## 伺服器環境需求

- Node.js (建議版本 14.x 或更高)
- npm (Node.js包管理器)

## 安裝與啟動

### 1. 安裝依賴

```bash
npm install
```

這將安裝以下依賴：
- express: Web應用框架
- cors: 跨域資源共享
- body-parser: 請求體解析
- nodemon (開發依賴): 自動重啟伺服器

### 2. 啟動伺服器

#### 生產環境

```bash
npm start
```

#### 開發環境 (自動重啟)

```bash
npm run dev
```

### 3. 訪問網站

啟動後，可通過以下地址訪問：
- http://localhost:3000
- http://127.0.0.1:3000
- http://[您的主機名]:3000 (區域網內可訪問)

## 伺服器功能說明

### 靜態文件服務

伺服器配置為提供項目根目錄下的所有靜態文件，包括：
- HTML頁面
- CSS樣式
- JavaScript腳本
- 圖片和其他資源

### API端點

#### 獲取評論
- 路徑: `/api/comments/:gameId`
- 方法: GET
- 描述: 獲取指定遊戲的所有評論

#### 添加評論
- 路徑: `/api/comments/:gameId`
- 方法: POST
- 請求體: `{ username, comment, rating }`
- 描述: 為指定遊戲添加新評論

### PWA支持

網站配置為PWA應用，支持：
- 離線訪問
- 添加到主屏幕
- 緩存靜態資源

關鍵文件：
- `manifest.json`: 定義應用信息
- `service-worker.js`: 管理緩存和離線功能

## 部署到生產環境

### 方法1: 使用Node.js直接運行

1. 在伺服器上安裝Node.js
2. 複製整個項目到伺服器
3. 運行 `npm install`
4. 使用進程管理器（如PM2）啟動應用：
   ```bash
   npm install -g pm2
   pm2 start server.js --name "game-website"
   ```

### 方法2: 使用Docker容器

1. 創建Dockerfile（如果尚未存在）
2. 構建並運行Docker容器

### 方法3: 部署到靜態網站託管服務

如果不需要後端API功能，可以將網站部署到：
- GitHub Pages
- Netlify
- Vercel

## 常見問題解決

### 端口衝突

如果3000端口被佔用，可以通過環境變量更改端口：
```bash
PORT=3001 npm start
```

### 跨域問題

伺服器已配置CORS中間件，允許跨域請求。如需自定義CORS設置，請修改server.js中的相關配置。

### 數據持久化

評論數據存儲在 `data/comments.json` 文件中。在生產環境中，建議使用更可靠的數據庫解決方案。

### 本地文件系統開發 (file:// 協議)

如果您需要在沒有伺服器的情況下直接通過 file:// 協議開發，需要注意以下限制：

1. **ServiceWorker 限制**：ServiceWorker 不支持 file:// 協議，網站已包含代碼識別此情況並將自動禁用相關功能。

2. **存儲 API 限制**：某些浏覽器在 file:// 協議下限制存儲 API 的訪問，網站已經實現了備用方案。

3. **網絡請求限制**：浏覽器安全機制會限制 file:// 協議下的網絡請求，因此某些功能可能不可用。

在本地文件系統開發時，網站將自動如下調整：

- 呈現簡化版功能且不嘗試使用受限的 API
- 為某些 API 調用提供模擬數據
- 在控制台顯示提示訊息而非錯誤

## 維護與更新

### 更新依賴

定期運行以下命令更新依賴：
```bash
npm update
```

### 監控伺服器

使用PM2等工具監控伺服器狀態：
```bash
pm2 monit
```

## 聯絡支持

如有問題，請聯絡：
- GitHub: ex8762
- Email: ex8762@gmail.com