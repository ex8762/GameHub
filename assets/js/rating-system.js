// 統一的遊戲評分系統
(function() {
    console.log('Unified Rating System: Initializing...');

    function initializeRatingSystem() {
        const ratingContainers = document.querySelectorAll('.stars-input');
        console.log(`Unified Rating System: Found ${ratingContainers.length} rating containers`);

        ratingContainers.forEach((container, index) => {
            console.log(`Unified Rating System: Setting up container ${index + 1}`);

            // 清理可能存在的舊元素或事件，參考 clean-rating-fix.js 和 fixed-rating.js
            // 例如移除特定的 overlay 或舊的事件監聽器 (如果有的話)
            const existingOverlays = container.querySelectorAll('.rating-overlay');
            existingOverlays.forEach(overlay => overlay.parentNode.removeChild(overlay));

            // 獲取或創建星星元素
            let stars = Array.from(container.querySelectorAll('i[data-rating]'));

            // 如果沒有 data-rating 的星星，嘗試尋找通用 i 標籤並賦予 data-rating
            if (stars.length === 0) {
                const genericStars = Array.from(container.querySelectorAll('i'));
                if (genericStars.length > 0 && genericStars.length <= 5) {
                    genericStars.forEach((star, i) => {
                        star.setAttribute('data-rating', i + 1);
                    });
                    stars = genericStars;
                }
            }

            // 如果仍然沒有星星，或者星星數量不對，可以選擇動態創建或報錯
            if (stars.length === 0 || stars.length > 5) {
                console.warn(`Unified Rating System: Container ${index + 1} has no valid stars or too many stars. Attempting to create them.`);
                container.innerHTML = ''; // 清空容器
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    star.setAttribute('data-rating', i);
                    container.appendChild(star);
                }
                stars = Array.from(container.querySelectorAll('i[data-rating]'));
            }

            console.log(`Unified Rating System: Container ${index + 1} has ${stars.length} stars`);

            // 移除並重新綁定事件，確保唯一性
            stars.forEach(star => {
                const newStar = star.cloneNode(true); // 克隆以移除舊事件
                star.parentNode.replaceChild(newStar, star);
            });

            const freshStars = Array.from(container.querySelectorAll('i[data-rating]'));

            freshStars.forEach(star => {
                star.className = 'far fa-star'; // 統一初始 class
                star.style.cursor = 'pointer';
                star.style.fontSize = '1.8rem'; // 統一字體大小
                star.style.color = '#ddd'; // 統一初始顏色
                star.style.margin = '0 3px'; // 統一間距
                star.style.padding = '2px'; // 增加點擊區域
                star.style.transition = 'color 0.2s, transform 0.2s'; // 添加過渡效果

                star.addEventListener('mouseover', handleStarMouseOver);
                star.addEventListener('click', handleStarClick);
            });

            container.addEventListener('mouseleave', handleContainerMouseLeave);
            
            // 初始化時，根據表單中已有的值設定星星狀態
            const form = findParentForm(container);
            if (form) {
                const hiddenInput = form.querySelector('input[name="rating"]');
                if (hiddenInput && hiddenInput.value) {
                    updateStarsVisual(container, parseInt(hiddenInput.value));
                }
            }
        });
    }

    function handleStarMouseOver(event) {
        const star = event.target;
        const container = star.closest('.stars-input');
        if (!container) return;
        const hoverRating = parseInt(star.getAttribute('data-rating'));
        updateStarsVisual(container, hoverRating, true);
    }

    function handleContainerMouseLeave(event) {
        const container = event.target;
        const form = findParentForm(container);
        let currentRating = 0;
        if (form) {
            const hiddenInput = form.querySelector('input[name="rating"]');
            if (hiddenInput && hiddenInput.value) {
                currentRating = parseInt(hiddenInput.value);
            }
        }
        updateStarsVisual(container, currentRating);
    }

    function handleStarClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const star = event.target;
        const container = star.closest('.stars-input');
        if (!container) return;

        const clickedRating = parseInt(star.getAttribute('data-rating'));
        console.log(`Unified Rating System: Star clicked with rating: ${clickedRating}`);

        updateStarsVisual(container, clickedRating);

        const form = findParentForm(container);
        if (form) {
            let hiddenInput = form.querySelector('input[name="rating"]');
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'rating'; // 統一 name
                form.appendChild(hiddenInput);
            }
            hiddenInput.value = clickedRating;
            console.log(`Unified Rating System: Rating ${clickedRating} saved to form.`);
        }
    }

    function updateStarsVisual(container, rating, isHover = false) {
        const starsInContainer = container.querySelectorAll('i[data-rating]');
        starsInContainer.forEach(s => {
            const starRating = parseInt(s.getAttribute('data-rating'));
            if (starRating <= rating) {
                s.className = 'fas fa-star';
                s.style.color = '#FFC107'; // 高亮顏色
                if(isHover) s.style.transform = 'scale(1.1)';
            } else {
                s.className = 'far fa-star';
                s.style.color = '#ddd'; // 預設顏色
                s.style.transform = 'scale(1)';
            }
        });
    }

    function findParentForm(element) {
        let current = element;
        while (current && current.tagName !== 'FORM') {
            current = current.parentElement;
        }
        return current;
    }

    // --- 全局評分處理 (來自原 rating-system.js) ---
    function updateGameRatingDisplay(gameId, newAverageRating, newRatingCount) {
        const gameSection = document.getElementById(gameId);
        if (!gameSection) {
            console.warn(`Unified Rating System: Game section not found for ${gameId}`);
            return;
        }

        const starsDisplay = gameSection.querySelectorAll('.game-rating-display .stars i'); // 假設有一個專門顯示總評分的區域
        const ratingScoreDisplay = gameSection.querySelector('.game-rating-display .rating-score');
        const ratingCountDisplay = gameSection.querySelector('.game-rating-display .rating-count');

        if (starsDisplay.length > 0) {
            starsDisplay.forEach((star, index) => {
                star.className = index < Math.round(newAverageRating) ? 'fas fa-star' : 'far fa-star';
            });
        }
        if (ratingScoreDisplay) {
            ratingScoreDisplay.textContent = newAverageRating.toFixed(1);
        }
        if (ratingCountDisplay) {
            ratingCountDisplay.textContent = `(${newRatingCount} 人評分)`;
        }
    }

    function loadGameRatings() {
        try {
            const ratings = JSON.parse(localStorage.getItem('game_ratings') || '{}');
            Object.entries(ratings).forEach(([gameId, data]) => {
                if (data && typeof data.average_rating === 'number' && typeof data.count === 'number') {
                    updateGameRatingDisplay(gameId, data.average_rating, data.count);
                }
            });
        } catch (error) {
            console.error('Unified Rating System: Error loading game ratings:', error);
        }
    }
    
    // 處理評論提交時的評分 (如果需要，可以從 comment-system.js 移過來或在此處調用)
    // 例如，在評論提交成功後，調用一個函數來更新遊戲的總體評分
    // function handleCommentSubmitAndUpdateRating(gameId, userRating) { ... }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeRatingSystem();
            loadGameRatings();
        });
    } else {
        initializeRatingSystem();
        loadGameRatings();
    }

    // 導出可選的全局函數
    window.unifiedRatingSystem = {
        initialize: initializeRatingSystem, // 允許手動重新初始化
        updateGameRatingDisplay,
        loadGameRatings
    };

    console.log('Unified Rating System: Initialized successfully.');
})();
