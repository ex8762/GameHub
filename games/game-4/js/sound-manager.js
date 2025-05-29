// 音效管理器
export class SoundManager {
    static instance = null;
    
    constructor() {
        if (SoundManager.instance) {
            return SoundManager.instance;
        }
        
        this.sounds = new Map();
        this.volume = 0.5;
        this.enabled = true;
        this.context = null;
        this.buffers = new Map();
        this.isMuted = false;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('無法創建音訊上下文:', error);
        }
        
        // 新增靜音控制
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.mute();
            } else {
                this.unmute();
            }
        });
        
        SoundManager.instance = this;
    }
    
    static getInstance() {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }
    
    // 重置音效上下文
    resetAudioContext() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
    
    // 讓透過使用者互動方式啟動音效
    unlockAudio() {
        if (!this.context) return;
        
        // 一些行動裝置需要透過使用者互動啟動音效
        const unlock = () => {
            this.context.resume();
            
            // 創建空白聲音並播放
            const buffer = this.context.createBuffer(1, 1, 22050);
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.context.destination);
            source.start(0);
            
            // 移除事件監聽器
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        
        document.addEventListener('touchstart', unlock, false);
        document.addEventListener('touchend', unlock, false);
        document.addEventListener('click', unlock, false);
        document.addEventListener('keydown', unlock, false);
    }

    // 註冊音效
    registerSound(name, audioBuffer) {
        if (audioBuffer instanceof AudioBuffer) {
            this.buffers.set(name, audioBuffer);
            return true;
        } else if (audioBuffer instanceof Audio) {
            this.sounds.set(name, audioBuffer);
            return true;
        } else {
            console.warn(`註冊音效失敗: ${name} - 不支持的音效格式`);
            return false;
        }
    }
    
    // 往下相容方法
    loadSound(name) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            
            audio.addEventListener('canplaythrough', () => {
                this.sounds.set(name, audio);
                resolve();
            }, { once: true });

            audio.addEventListener('error', (error) => {
                console.error(`無法載入音效 ${name}:`, error);
                reject(error);
            });

            // 如果沒有音效文件，使用 Web Audio API 生成音效
            this.generateAudioBuffer(name).then(buffer => {
                const blob = new Blob([buffer], { type: 'audio/mp3' });
                audio.src = URL.createObjectURL(blob);
            }).catch(error => {
                console.error('生成音效失敗:', error);
                reject(error);
            });
        });
    }

    async generateAudioBuffer(name) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const channelData = buffer.getChannelData(0);

        // 根據不同的音效名稱生成不同的音效
        switch (name) {
            case 'craft':
                // 生成製作成功的音效（上升音調）
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 440 * t * (1 + t)) * (1 - t);
                }
                break;
            case 'error':
                // 生成錯誤音效（下降音調）
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 440 * t * (1 - t)) * (1 - t);
                }
                break;
            default:
                // 默認音效
                for (let i = 0; i < buffer.length; i++) {
                    const t = i / buffer.length;
                    channelData[i] = Math.sin(2 * Math.PI * 440 * t) * (1 - t);
                }
        }

        // 將 AudioBuffer 轉換為 Blob
        const offlineContext = new OfflineAudioContext(1, buffer.length, audioContext.sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();
        const wav = this.audioBufferToWav(renderedBuffer);
        return new Uint8Array(wav);
    }    audioBufferToWav(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const dataLength = audioBuffer.length * numChannels * (bitDepth / 8);
        const outputBuffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(outputBuffer);
        
        // WAV 檔案標頭
        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
        view.setUint16(32, numChannels * (bitDepth / 8), true);
        view.setUint16(34, bitDepth, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);
        
        // 寫入音訊數據
        const offset = 44;
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + i * 2, value, true);
        }
        
        return outputBuffer;
    }

    play(name) {
        if (!this.enabled || this.isMuted) return;
        
        // 確保音效上下文已啟動
        this.resetAudioContext();
        
        // 如果有音效緩衝區，使用Web Audio API播放
        if (this.buffers.has(name) && this.context) {
            const buffer = this.buffers.get(name);
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            
            // 創建音量控制節點
            const gainNode = this.context.createGain();
            gainNode.gain.value = this.volume;
            
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // 播放
            source.start(0);
            return source;
        }
        
        // 往下相容方式：使用HTML5 Audio
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn(`播放音效 ${name} 失敗:`, error);
                
                // 嘗試解鎖音效
                if (error.name === 'NotAllowedError') {
                    this.unlockAudio();
                }
            });
            return sound;
        } else {
            console.warn(`找不到音效: ${name}`);
            this.loadSound(name).then(() => this.play(name));
            return null;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // 更新所有音效的音量
        this.sounds.forEach(sound => {
            sound.volume = this.volume;
        });
        
        return this.volume;
    }

    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    mute() {
        this.isMuted = true;
        
        // 停止所有正在播放的音效
        this.sounds.forEach(sound => {
            if (!sound.paused) {
                sound.pause();
            }
        });
    }
    
    unmute() {
        this.isMuted = false;
    }
    
    playBackgroundMusic(name, options = {}) {
        if (!this.enabled || this.isMuted) return null;
        
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = options.volume || this.volume * 0.7; // 背景音樂預設音量低一點
            sound.loop = options.loop !== undefined ? options.loop : true; // 預設循環
            
            if (options.fadeIn) {
                // 淡入效果
                sound.volume = 0;
                sound.play().catch(console.error);
                
                let currentVolume = 0;
                const targetVolume = options.volume || this.volume * 0.7;
                const fadeStep = targetVolume / (options.fadeIn / 50); // 50ms 每步
                
                const fadeInterval = setInterval(() => {
                    currentVolume += fadeStep;
                    if (currentVolume >= targetVolume) {
                        sound.volume = targetVolume;
                        clearInterval(fadeInterval);
                    } else {
                        sound.volume = currentVolume;
                    }
                }, 50);
                
                return sound;
            } else {
                sound.play().catch(console.error);
                return sound;
            }
        } else {
            console.warn(`找不到背景音樂: ${name}`);
            return null;
        }
    }
}
