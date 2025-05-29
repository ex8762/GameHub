// Asset Loader - 處理遊戲資源的加載系統
export class AssetLoader {
    constructor() {
        this.assets = {
            sounds: {},
            images: {}
        };
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.callbacks = [];
    }

    loadSound(name, url = null) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            // 如果沒有提供URL，使用默認的音效生成系統
            if (!url) {
                this._generateSound(name).then(buffer => {
                    this.assets.sounds[name] = buffer;
                    this.loadedAssets++;
                    this._checkProgress();
                    resolve(buffer);
                }).catch(error => {
                    console.error(`生成音效 ${name} 失敗:`, error);
                    reject(error);
                });
                return;
            }

            // 否則，嘗試從URL加載
            const audio = new Audio();
            audio.src = url;
            
            audio.addEventListener('canplaythrough', () => {
                this.assets.sounds[name] = audio;
                this.loadedAssets++;
                this._checkProgress();
                resolve(audio);
            }, { once: true });

            audio.addEventListener('error', (error) => {
                console.error(`無法載入音效 ${name}:`, error);
                reject(error);
            });

            // 開始加載
            audio.load();
        });
    }

    loadImage(name, url) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            
            img.onload = () => {
                this.assets.images[name] = img;
                this.loadedAssets++;
                this._checkProgress();
                resolve(img);
            };

            img.onerror = (error) => {
                console.error(`無法載入圖片 ${name}:`, error);
                reject(error);
            };
        });
    }

    getSound(name) {
        return this.assets.sounds[name];
    }

    getImage(name) {
        return this.assets.images[name];
    }

    onProgress(callback) {
        this.callbacks.push(callback);
        return this;
    }

    getProgress() {
        if (this.totalAssets === 0) return 1;
        return this.loadedAssets / this.totalAssets;
    }

    _checkProgress() {
        const progress = this.getProgress();
        this.callbacks.forEach(callback => callback(progress));
    }

    async _generateSound(name) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.5, audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);

        // 根據不同的音效名稱生成不同的音效
        switch (name) {
            case 'craft':
                // 製作成功的音效（上升音調）
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 440 * t * (1 + t)) * (1 - t);
                }
                break;
            case 'collect':
                // 收集資源的音效
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 660 * t) * (1 - t);
                }
                break;
            case 'error':
                // 錯誤音效（下降音調）
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 220 * t * (1 - t * 0.5)) * (1 - t);
                }
                break;
            case 'levelUp':
                // 升級音效
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    const freq = 440 + 440 * t;
                    channelData[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t * 0.5);
                }
                break;
            default:
                // 默認音效
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 440 * t) * (1 - t);
                }
        }

        return buffer;
    }
}

// 單例模式
let instance = null;
export function getAssetLoader() {
    if (!instance) {
        instance = new AssetLoader();
    }
    return instance;
}
