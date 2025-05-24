// 遊戲載入動畫
function showLoadingAnimation(gameId) {
    const gameSection = document.getElementById(gameId);
    if (!gameSection) {
        console.warn(`找不到遊戲區塊：${gameId}`);
        return;
    }

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>遊戲載入中...</p>
        </div>
    `;
    gameSection.appendChild(loadingOverlay);
}

// 遊戲進度管理
function saveGameProgress(gameId, progress) {
    if (!gameId || !progress) {
        console.warn('無效的遊戲進度資料');
        return;
    }
    try {
        localStorage.setItem(`game_progress_${gameId}`, JSON.stringify(progress));
    } catch (error) {
        console.error('儲存遊戲進度失敗：', error);
    }
}

function loadGameProgress(gameId) {
    if (!gameId) {
        console.warn('無效的遊戲 ID');
        return null;
    }
    try {
        const progress = localStorage.getItem(`game_progress_${gameId}`);
        return progress ? JSON.parse(progress) : null;
    } catch (error) {
        console.error('載入遊戲進度失敗：', error);
        return null;
    }
}

// 導出功能
window.gameManager = {
    showLoadingAnimation,
    saveGameProgress,
    loadGameProgress
};
