// 初始化遊戲變量
window.addEventListener('DOMContentLoaded', function() {
    // 確保drinksMade變量存在
    if (typeof window.drinksMade === 'undefined') {
        window.drinksMade = {
            "美式咖啡": 0,
            "拿鐵": 0,
            "卡布奇諾": 0,
            "摩卡": 0,
            "冰咖啡": 0,
            "巧克力咖啡": 0
        };
    }
});