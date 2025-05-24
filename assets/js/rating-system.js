// 遊戲評分系統
function initializeRatingSystem() {
    document.querySelectorAll('.stars-input').forEach(container => {
        if (!container) return;
        const stars = container.querySelectorAll('i');
        if (!stars.length) return;

        stars.forEach(star => {
            if (!star || !star.dataset || !star.dataset.rating) return;
            
            star.addEventListener('mouseover', () => {
                try {
                    const rating = parseInt(star.dataset.rating);
                    if (isNaN(rating) || rating < 1 || rating > 5) return;
                    
                    stars.forEach(s => {
                        if (s.dataset.rating <= rating) {
                            s.classList.replace('far', 'fas');
                        } else {
                            s.classList.replace('fas', 'far');
                        }
                    });
                } catch (error) {
                    console.error('評分系統錯誤：', error);
                }
            });

            star.addEventListener('mouseout', () => {
                const selectedStar = container.querySelector('.fas');
                if (selectedStar) {
                    const rating = selectedStar.dataset.rating;
                    stars.forEach(s => {
                        if (s.dataset.rating <= rating) {
                            s.classList.replace('far', 'fas');
                        } else {
                            s.classList.replace('fas', 'far');
                        }
                    });
                } else {
                    stars.forEach(s => s.classList.replace('fas', 'far'));
                }
            });

            star.addEventListener('click', () => {
                const rating = star.dataset.rating;
                stars.forEach(s => {
                    if (s.dataset.rating <= rating) {
                        s.classList.replace('far', 'fas');
                    } else {
                        s.classList.replace('fas', 'far');
                    }
                });
            });
        });
    });
}

function updateGameRating(gameId, rating) {
    const gameSection = document.getElementById(gameId);
    if (!gameSection) {
        console.warn(`找不到遊戲區塊：${gameId}`);
        return;
    }

    const stars = gameSection.querySelectorAll('.stars i');
    const ratingScore = gameSection.querySelector('.rating-score');
    const ratingCount = gameSection.querySelector('.rating-count');

    if (!stars.length || !ratingScore || !ratingCount) {
        console.warn(`找不到評分元素：${gameId}`);
        return;
    }

    // 更新星星顯示
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.replace('far', 'fas');
        } else {
            star.classList.replace('fas', 'far');
        }
    });

    // 更新評分數據
    const currentRating = parseFloat(ratingScore.textContent) || 0;
    const currentCount = parseInt(ratingCount.textContent.match(/\d+/)?.[0] || '0');
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;

    ratingScore.textContent = newRating.toFixed(1);
    ratingCount.textContent = `(${newCount} 人評分)`;

    // 保存評分數據
    try {
        const ratings = JSON.parse(localStorage.getItem('game_ratings') || '{}');
        ratings[gameId] = {
            rating: newRating,
            count: newCount
        };
        localStorage.setItem('game_ratings', JSON.stringify(ratings));
    } catch (error) {
        console.error('儲存評分資料失敗：', error);
    }
}

function loadGameRatings() {
    try {
        const ratings = JSON.parse(localStorage.getItem('game_ratings') || '{}');
        Object.entries(ratings).forEach(([gameId, data]) => {
            const gameSection = document.getElementById(gameId);
            if (!gameSection) return;

            const ratingScore = gameSection.querySelector('.rating-score');
            const ratingCount = gameSection.querySelector('.rating-count');
            const stars = gameSection.querySelectorAll('.stars i');

            if (!ratingScore || !ratingCount || !stars.length) return;

            if (typeof data.rating === 'number' && !isNaN(data.rating) && 
                typeof data.count === 'number' && data.count > 0) {
                stars.forEach((star, index) => {
                    if (index < Math.round(data.rating)) {
                        star.classList.replace('far', 'fas');
                    } else {
                        star.classList.replace('fas', 'far');
                    }
                });
                ratingScore.textContent = data.rating.toFixed(1);
                ratingCount.textContent = `(${data.count} 人評分)`;
            } else {
                // 若資料異常，顯示預設值
                stars.forEach(star => star.classList.replace('fas', 'far'));
                ratingScore.textContent = '0.0';
                ratingCount.textContent = '(0 人評分)';
            }
        });
    } catch (error) {
        console.error('載入評分資料失敗：', error);
    }
}

// 初始化評分系統
document.addEventListener('DOMContentLoaded', () => {
    initializeRatingSystem();
    loadGameRatings();
});

// 導出功能
window.ratingSystem = {
    updateGameRating,
    loadGameRatings
};
