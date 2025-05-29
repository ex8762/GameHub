// 面板相關功能

// 定義全局的togglePanel函數
window.togglePanel = function(panelId) {
    try {
        console.log('切換面板:', panelId);
        const panel = document.getElementById(panelId);
        if (!panel) {
            console.warn('面板不存在:', panelId);
            return;
        }
        
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
            console.log('面板已隱藏:', panelId);
        } else {
            hideAllPanels();
            panel.style.display = 'block';
            console.log('面板已顯示:', panelId);
        }
    } catch (error) {
        console.error('切換面板錯誤:', error);
    }
};

// 隱藏所有面板
function hideAllPanels() {
    try {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.style.display = 'none';
        });
        console.log('所有面板已隱藏');
    } catch (error) {
        console.error('隱藏面板錯誤:', error);
    }
}

// 安全地獲取面板 ID
function getSafePanelId(element) {
    try {
        if (!element) return null;
        const panel = element.closest('.panel');
        return panel ? panel.id : null;
    } catch (error) {
        console.error('獲取面板 ID 錯誤:', error);
        return null;
    }
}

// 初始化面板
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('面板初始化開始');
        
        // 為所有帶有 close-button 類的元素添加事件監聽器
        const closeButtons = document.querySelectorAll('.close-button');
        closeButtons.forEach(button => {
            const panelId = getSafePanelId(button);
            if (panelId) {
                button.addEventListener('click', function() {
                    window.togglePanel(panelId);
                });
                console.log('為面板添加關閉按鈕事件:', panelId);
            }
        });
        
        // 用首次點擊初始化所有面板的顯示狀態
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            if (!panel.style.display) {
                panel.style.display = 'none';
            }
        });
        
        console.log('面板初始化完成');
    } catch (error) {
        console.error('面板初始化錯誤:', error);
    }
});
