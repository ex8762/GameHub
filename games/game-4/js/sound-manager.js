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
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('無法創建音訊上下文:', error);
        }
        
        SoundManager.instance = this;
    }
    
    static getInstance() {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

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
        if (!this.enabled) return;

        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn(`播放音效 ${name} 失敗:`, error);
            });
        } else {
            console.warn(`找不到音效: ${name}`);
            this.loadSound(name).then(() => this.play(name));
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach(sound => {
            sound.volume = this.volume;
        });
    }

    toggleSound() {
        this.enabled = !this.enabled;
    }
}
