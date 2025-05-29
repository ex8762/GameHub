// 遊戲主檔 - 使用遊戲引擎啟動遊戲

// 當網頁完全載入後就創建遊戲引擎實例
// 注意：主要代碼現在已經移到 game-engine.js 中

// 標記遊戲開始時間
const START_TIME = Date.now();

// 這個檔案無需為因，已在 index.html 中直接創建遊戲引擎
// 如有額外的遊戲邏輯可以在這裡添加

// 記錄遊戲已經啟動
console.log(`Game started at ${new Date(START_TIME).toISOString()}`);
