// 16-Bit Retro Pixel Arcade Web Audio Sound FX Synthesizer
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Retro 8-bit/16-bit arcade square/triangle blip
  playBlip(freq = 432, type: OscillatorType = "sine", duration = 0.12) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio safety
    }
  }

  // Mechanical tactile microswitch arcade click
  playClick(freq = 520) {
    this.playBlip(freq, "triangle", 0.08);
  }

  // Subtle futuristic HUD hover tone
  playHover(freq = 780) {
    this.playBlip(freq, "sine", 0.04);
  }

  // Retro arcade power-up / step advance chime
  playNextStep() {
    if (!this.enabled) return;
    this.playBlip(576, "triangle", 0.18);
    setTimeout(() => {
      this.playBlip(864, "sine", 0.28);
    }, 70);
  }

  // Dramatic 16-bit arcade mission launch chord
  playLaunchChord() {
    if (!this.enabled) return;
    const freqs = [293.66, 369.99, 440.0, 587.33];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBlip(freq, "triangle", 0.35);
      }, idx * 60);
    });
  }

  // Pulsing retro arcade alarm
  playAlarm() {
    if (!this.enabled) return;
    this.playBlip(680, "sawtooth", 0.12);
    setTimeout(() => {
      this.playBlip(510, "sawtooth", 0.16);
    }, 130);
  }

  // Triumphant 16-bit arcade mission success fanfare
  playSuccessChord() {
    if (!this.enabled) return;
    const freqs = [349.23, 440.0, 523.25, 698.46, 880.0];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBlip(freq, "sine", 0.45);
      }, idx * 80);
    });
  }
}

export const sounds = new SoundManager();
