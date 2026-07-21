class ProceduralAudioClass {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private isMuted: boolean = false;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.15, this.ctx.currentTime); // keep default low & cozy
      this.masterVolume.connect(this.ctx.destination);
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }

  private resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    this.resume();
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx.currentTime);
    }
  }

  getMuted() {
    return this.isMuted;
  }

  playLaser() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterVolume!);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playReel(weight: number) {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Reel click sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = Math.max(100, 300 - weight * 2);
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playScore() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    // Double chime / synth arpeggio
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(start);
      osc.stop(start + duration);
    };

    const now = this.ctx.currentTime;
    playTone(523.25, now, 0.1); // C5
    playTone(659.25, now + 0.08, 0.15); // E5
    playTone(783.99, now + 0.16, 0.3); // G5
  }

  playExplosion() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.masterVolume!);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playUpgrade() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + duration);

      osc.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(440, now, 0.08); // A4
    playTone(554.37, now + 0.06, 0.08); // C#5
    playTone(659.25, now + 0.12, 0.15); // E5
  }

  playLevelComplete() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.15); // C5
    playTone(659.25, now + 0.12, 0.15); // E5
    playTone(783.99, now + 0.24, 0.15); // G5
    playTone(1046.50, now + 0.36, 0.4); // C6
  }

  playLevelFailed() {
    this.resume();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq - 100, start + duration);

      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(this.masterVolume!);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(392, now, 0.2); // G4
    playTone(349.23, now + 0.18, 0.2); // F4
    playTone(311.13, now + 0.36, 0.4); // Eb4
  }
}

export const ProceduralAudio = new ProceduralAudioClass();
