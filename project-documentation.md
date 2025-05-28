# 遊戲天地網站專案文件 (Gaming Portal Project Documentation)

## 1. 專案概述 (Project Overview)

**專案類型 (Project Type):** 網頁遊戲平台 (Web Gaming Platform)  
**主要功能 (Primary Features):** 遊戲列表、評分系統、用戶評論、離線支援  
**技術棧 (Technology Stack):** HTML5, CSS3, JavaScript, Node.js  

## 2. 檔案結構 (File Structure)

### 2.1 前端核心檔案 (Front-end Core Files)

#### 2.1.1 HTML/CSS 檔案 (HTML/CSS Files)
| 檔案路徑 (File Path) | 功能描述 (Functionality) | 相依關係 (Dependencies) |
|-------------------|------------------------|------------------------|
| `index.html` | 主頁面，顯示遊戲列表和主要界面 | 依賴所有 JS 和 CSS 檔案 |
| `offline.html` | 離線狀態顯示頁面 | 依賴 `service-worker.js` |
| `assets/css/styles.css` | 主要樣式定義 | 無直接依賴 |

#### 2.1.2 JavaScript 核心檔案 (JavaScript Core Files)
| 檔案路徑 (File Path) | 功能描述 (Functionality) | 相依關係 (Dependencies) |
|-------------------|------------------------|------------------------|
| `main.js` | 應用程式入口點，初始化所有系統 | 依賴所有其他 JS 模組 |
| `error-handler.js` | 全域錯誤處理系統 | 被其他模組使用 |
| `storage-manager.js` | 本地儲存操作管理 | 依賴 `error-handler.js` |
| `maintenance.js` | 系統維護任務執行 | 依賴多個其他模組 |
| `browser-compatibility-fix.js` | 瀏覽器兼容性問題修復 | 無依賴，首先載入 |

### 2.2 後端相關檔案 (Back-end Related Files)
| 檔案路徑 (File Path) | 功能描述 (Functionality) | 相依關係 (Dependencies) |
|-------------------|------------------------|------------------------|
| `server.js` | Node.js API 伺服器 | 依賴 npm 套件 (未列出) |

### 2.3 離線支援檔案 (Offline Support Files)
| 檔案路徑 (File Path) | 功能描述 (Functionality) | 相依關係 (Dependencies) |
|-------------------|------------------------|------------------------|
| `service-worker.js` | PWA 離線功能和資源快取 | 無直接程式碼依賴 |

## 3. 功能模組詳解 (Functional Modules Explained)

### 3.1 儲存系統 (Storage System)
**主要檔案:** `storage-manager.js`  
**主要類別:** `StorageSpaceManager`  
**功能:**
- 安全操作 localStorage 和 IndexedDB
- 錯誤處理和重試機制
- 儲存空間監控和管理
- 自動清理過期資料

**範例使用:**
```javascript
// 儲存資料
StorageManager.save('game_data', gameObject);

// 讀取資料
const data = await StorageManager.load('game_data');

// 監控儲存空間
StorageSpaceManager.watchUsage(0.9, cleanupFunction);
```

### 3.2 錯誤處理系統 (Error Handling System)
**主要檔案:** `error-handler.js`  
**主要類別:** `ErrorHandler`  
**功能:**
- 錯誤捕獲和分類
- 錯誤日誌記錄
- 使用者友好錯誤通知
- 伺服器錯誤同步

**範例使用:**
```javascript
try {
  // 可能出錯的代碼
} catch (error) {
  ErrorHandler.handle(error, {
    component: 'GameLoader',
    severity: 'critical',
    notifyUser: true
  });
}
```

### 3.3 通知系統 (Notification System)
**主要類別:** `NotificationSystem`  
**位置:** 在 `main.js` 中定義  
**功能:**
- 顯示成功、錯誤、警告通知
- 通知佇列管理
- 通知音效支援
- 可自訂通知外觀和行為

**範例使用:**
```javascript
NotificationSystem.show({
  type: 'success',
  message: '遊戲儲存成功',
  duration: 3000,
  sound: true
});
```

### 3.4 維護系統 (Maintenance System)
**主要檔案:** `maintenance.js`  
**主要類別:** `MaintenanceSystem`  
**功能:**
- 定期執行維護任務
- 提供任務註冊機制
- 基於條件執行任務
- 任務執行日誌

**範例使用:**
```javascript
MaintenanceSystem.registerTask({
  name: 'cleanOldGames',
  interval: 24 * 60 * 60 * 1000, // 每天執行一次
  condition: () => StorageSpaceManager.isSpaceLow(),
  task: async () => {
    // 清理舊遊戲資料
  }
});
```

### 3.5 監控系統 (Monitoring System)
**主要類別:** `StorageMonitor`  
**功能:**
- 監控儲存操作性能
- 收集錯誤率指標
- 發出警告通知
- 性能報告生成

## 4. 遊戲功能模組 (Game Feature Modules)

### 4.1 評分系統 (Rating System)
**功能:**
- 使用者評分 (1-5星)
- 平均評分計算
- 評分資料本地儲存
- 評分資料伺服器同步

### 4.2 評論系統 (Comment System)
**功能:**
- 使用者評論輸入
- 評論列表顯示
- 評論篩選和排序
- 評論資料本地緩存

### 4.3 收藏系統 (Favorites System)
**功能:**
- 將遊戲加入/移出收藏
- 收藏遊戲列表
- 收藏資料本地儲存
- 跨裝置同步 (如果使用者已登入)

### 4.4 分享功能 (Sharing Features)
**功能:**
- 社交媒體分享
- 直接連結分享
- 分享計數統計
- QR碼分享

## 5. 系統架構和初始化 (System Architecture and Initialization)

### 5.1 模組依賴關係 (Module Dependencies)
```
main.js
├── browser-compatibility-fix.js
├── error-handler.js
├── storage-manager.js
│   └── error-handler.js
├── maintenance.js
│   ├── storage-manager.js
│   └── error-handler.js
└── service-worker.js
```

### 5.2 初始化順序 (Initialization Sequence)
1. `browser-compatibility-fix.js` - 確保瀏覽器兼容性
2. `error-handler.js` - 設置全域錯誤處理
3. `main.js` - 初始化核心功能
   - 初始化通知系統
   - 初始化儲存系統
   - 設置遊戲列表
   - 註冊事件監聽器
4. 其他模組按需載入

### 5.3 事件流程 (Event Flow)
**頁面載入流程:**
```
DOMContentLoaded
└── main.js::init()
    ├── 檢查瀏覽器兼容性
    ├── 設置錯誤處理器
    ├── 初始化儲存系統
    ├── 載入遊戲列表
    ├── 註冊事件監聽器
    └── 註冊Service Worker
```

## 6. 已知問題和解決方案 (Known Issues and Solutions)

### 6.1 瀏覽器兼容性問題 (Browser Compatibility Issues)
**問題:** 舊版瀏覽器缺少必要API  
**解決方案:** 
- `browser-compatibility-fix.js` 提供 polyfills
- 針對特定瀏覽器的條件性代碼
- 使用特性檢測而非瀏覽器檢測

### 6.2 儲存空間問題 (Storage Space Issues)
**問題:** 本地儲存空間有限  
**解決方案:**
- `StorageSpaceManager` 監控儲存空間使用
- 自動清理舊資料和不必要資料
- 警告使用者儲存空間不足

### 6.3 未處理的 Promise 錯誤 (Unhandled Promise Errors)
**問題:** 未捕獲的 Promise 錯誤可能導致功能失效  
**解決方案:**
- 全域 `unhandledrejection` 事件處理
- 在關鍵功能點使用 try-catch
- 詳細錯誤日誌記錄和恢復策略

### 6.4 本地開發環境問題 (Local Development Environment Issues)
**問題:** 本地環境中某些功能可能導致錯誤  
**解決方案:**
- 環境檢測 (localhost, 127.0.0.1, file:// 協議)
- 針對本地環境禁用特定功能
- 提供本地測試用模擬資料
- 特別處理 file:// 協議的 API 限制 (ServiceWorker, 存儲 API)

### 6.5 星星評分系統問題 (Star Rating System Issues)
**問題:** 星星評分無法點擊和提交  
**解決方案:**
- 修正 HTML 結構中的 name 屬性 (name="direct_rating" 而非 name="rating")
- 確保評分容器使用正確的 CSS 選擇器 (.stars-input)
- 改進表單提交處理邏輯，確保評分值正確傳遢

### 6.6 存儲指標更新問題 (Storage Metrics Update Issues)
**問題:** 在特定環境下顯示「更新存處指標失敗」警告  
**解決方案:**
- 新增通知清除功能 (clearAll 和 removeStorageRelatedNotifications 方法)
- 在伺服器環境自動清除存儲相關通知
- 在 file:// 協議環境下提供模擬存儲指標數據
