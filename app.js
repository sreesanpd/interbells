class AudioManager {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, duration, count = 1, volume = 0.5) {
    this.init();
    
    const playSingle = (delay) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = frequency < 300 ? 'sine' : 'triangle';
      
      const startTime = this.audioContext.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    for (let i = 0; i < count; i++) {
      playSingle(i * (duration + 0.2));
    }
  }

  playChurchBell(duration = 3.0, volume = 0.8) {
    this.init();
    
    const fundamentalFreq = 330;
    const harmonics = [1, 2, 2.4, 3, 4.2, 5.4];
    const amplitudes = [1, 0.6, 0.4, 0.3, 0.2, 0.1];
    
    const startTime = this.audioContext.currentTime;
    
    harmonics.forEach((harmonic, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = fundamentalFreq * harmonic;
      oscillator.type = 'sine';
      
      const amp = amplitudes[index] * volume;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(amp, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  playIntervalAlert(intervalNumber, totalIntervals) {
    const isFinal = intervalNumber === totalIntervals;
    
    if (isFinal) {
      this.playChurchBell(3.0, 0.8);
    } else {
      const frequency = 440;
      const duration = 0.3;
      const volume = 0.5;
      const count = intervalNumber;
      this.playTone(frequency, duration, count, volume);
    }
  }
}

class WakeLock {
  constructor() {
    this.sentinel = null;
  }

  async request() {
    if ('wakeLock' in navigator) {
      try {
        this.sentinel = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log('Wake Lock not available:', err);
      }
    }
  }

  async release() {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.log('Wake Lock release error:', err);
      }
      this.sentinel = null;
    }
  }

  async reacquire() {
    if (this.sentinel === null && 'wakeLock' in navigator) {
      await this.request();
    }
  }
}

class Timer {
  constructor() {
    this.audio = new AudioManager();
    this.wakeLock = new WakeLock();
    this.isRunning = false;
    this.intervalId = null;
    this.totalSeconds = 0;
    this.remainingSeconds = 0;
    this.numIntervals = 1;
    this.currentInterval = 0;
    this.alertedIntervals = new Set();
    
    this.loadSettings();
    this.bindEvents();
    this.updateDisplay();
    this.setupVisibilityHandler();
  }

  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.isRunning) {
        await this.wakeLock.reacquire();
      }
    });
  }

  loadSettings() {
    const saved = localStorage.getItem('interbells');
    if (saved) {
      const settings = JSON.parse(saved);
      document.getElementById('minutes').value = settings.minutes || 3;
      document.getElementById('seconds').value = settings.seconds || 0;
      document.getElementById('intervals').value = settings.intervals || 3;
    }
  }

  saveSettings() {
    const settings = {
      minutes: parseInt(document.getElementById('minutes').value) || 0,
      seconds: parseInt(document.getElementById('seconds').value) || 0,
      intervals: parseInt(document.getElementById('intervals').value) || 1
    };
    localStorage.setItem('interbells', JSON.stringify(settings));
  }

  bindEvents() {
    document.getElementById('minutes').addEventListener('change', () => this.handleInputChange());
    document.getElementById('seconds').addEventListener('change', () => this.handleInputChange());
    document.getElementById('intervals').addEventListener('change', () => this.handleInputChange());
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }

  handleInputChange() {
    this.saveSettings();
    if (!this.isRunning) {
      this.reset();
    }
  }

  getIntervalLength() {
    if (this.numIntervals <= 0) return 0;
    return this.totalSeconds / this.numIntervals;
  }

  formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateDisplay() {
    const mins = parseInt(document.getElementById('minutes').value) || 0;
    const secs = parseInt(document.getElementById('seconds').value) || 0;
    this.numIntervals = parseInt(document.getElementById('intervals').value) || 1;
    this.totalSeconds = mins * 60 + secs;

    const intervalLength = this.getIntervalLength();
    const intervalDisplay = document.getElementById('intervalDisplay');
    intervalDisplay.textContent = this.numIntervals > 0 
      ? `~${Math.round(intervalLength)}s each`
      : '';

    if (this.isRunning) {
      document.getElementById('timeLeft').textContent = this.formatTime(this.remainingSeconds);
      document.getElementById('intervalProgress').textContent = 
        `Interval ${this.currentInterval} of ${this.numIntervals}`;
      document.getElementById('statusText').textContent = 'Running...';
    } else {
      document.getElementById('timeLeft').textContent = this.formatTime(this.totalSeconds);
      document.getElementById('intervalProgress').textContent = '';
      document.getElementById('statusText').textContent = 'Ready';
    }
  }

  async start() {
    if (this.isRunning) return;
    
    const mins = parseInt(document.getElementById('minutes').value) || 0;
    const secs = parseInt(document.getElementById('seconds').value) || 0;
    this.numIntervals = parseInt(document.getElementById('intervals').value) || 1;
    this.totalSeconds = mins * 60 + secs;
    
    if (this.totalSeconds < this.numIntervals) {
      this.showAlert('Need at least 1 second per interval', 'error');
      return;
    }

    this.isRunning = true;
    this.audio.init();
    await this.wakeLock.request();
    this.alertedIntervals.clear();
    this.currentInterval = 0;
    
    this.updateButtonStates();
    this.updateProgressBar();
    this.startCountdown();
  }

  startCountdown() {
    const startTime = Date.now();
    const initialRemaining = this.totalSeconds;
    
    this.intervalId = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      this.remainingSeconds = Math.max(0, initialRemaining - elapsed);
      
      this.checkIntervals(initialRemaining - this.remainingSeconds);
      
      this.updateDisplay();
      this.updateProgressBar();
      
      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 100);
  }

  updateProgressBar() {
    if (this.totalSeconds > 0) {
      const progress = this.remainingSeconds / this.totalSeconds;
      const fill = document.getElementById('progressFill');
      fill.style.width = (progress * 100) + '%';
    }
  }

  checkIntervals(elapsedSeconds) {
    const intervalLength = this.getIntervalLength();
    
    for (let i = 1; i <= this.numIntervals; i++) {
      const alertTime = intervalLength * i;
      if (elapsedSeconds >= alertTime && !this.alertedIntervals.has(i)) {
        this.alertedIntervals.add(i);
        this.currentInterval = i;
        this.audio.playIntervalAlert(i, this.numIntervals);
        
        if (i === this.numIntervals) {
          this.showAlert(`Time's Up!`, 'complete');
        } else {
          this.showAlert(`Interval ${i} of ${this.numIntervals}`, 'ringing');
        }
      }
    }
  }

  async pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.intervalId);
    await this.wakeLock.release();
    this.updateButtonStates();
    this.updateDisplay();
  }

  async reset() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    await this.wakeLock.release();
    this.remainingSeconds = 0;
    this.currentInterval = 0;
    this.alertedIntervals.clear();
    this.hideAlert();
    this.updateButtonStates();
    this.updateDisplay();
    this.resetProgressBar();
  }

  resetProgressBar() {
    const fill = document.getElementById('progressFill');
    fill.style.width = '100%';
  }

  async complete() {
    await this.pause();
    this.remainingSeconds = 0;
    this.currentInterval = this.numIntervals;
    this.audio.playComplete();
    this.showAlert(`Time's Up!`, 'complete');
    this.updateDisplay();
  }

  updateButtonStates() {
    document.getElementById('startBtn').disabled = this.isRunning;
    document.getElementById('pauseBtn').disabled = !this.isRunning;
    document.getElementById('resetBtn').disabled = !this.isRunning && this.remainingSeconds === 0;
  }

  showAlert(message, type) {
    const box = document.getElementById('alertBox');
    box.textContent = message;
    box.className = 'alert-box show';
    
    if (type === 'complete') {
      box.classList.add('alert-complete');
    } else if (type === 'ringing') {
      box.classList.add('alert-ringing');
    }
    
    setTimeout(() => this.hideAlert(), 2000);
  }

  hideAlert() {
    const box = document.getElementById('alertBox');
    box.classList.remove('show');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Timer();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  }
});
