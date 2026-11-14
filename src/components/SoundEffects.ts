// Hollow Knight & Silksong inspired atmospheric sound generator using Web Audio API
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

  // Soft silk thread pluck / needle tap
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

  // Mechanical switch / drill step click
  playClick(freq = 520) {
    this.playBlip(freq, "triangle", 0.08);
  }

  // Silksong bell / silk spool tension chime for advancing steps
  playNextStep() {
    if (!this.enabled) return;
    // Two-tone bell harmonic (Pharloom bell chord)
    this.playBlip(576, "triangle", 0.18);
    setTimeout(() => {
      this.playBlip(864, "sine", 0.28);
    }, 70);
  }

  // Dramatic Silksong needle slash & sacred chord for launching / mode select
  playLaunchChord() {
    if (!this.enabled) return;
    // Ancient chord: D - F# - A - D (Ethereal Silk Chord)
    const freqs = [293.66, 369.99, 440.0, 587.33];
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBlip(freq, "triangle", 0.35);
      }, idx * 60);
    });
  }

  // Pulsing danger/crisis alarm
  playAlarm() {
    if (!this.enabled) return;
    this.playBlip(680, "sawtooth", 0.12);
    setTimeout(() => {
      this.playBlip(510, "sawtooth", 0.16);
    }, 130);
  }

  // Triumphant earth splashdown / mission success chord
  playSuccessChord() {
    if (!this.enabled) return;
    const freqs = [349.23, 440.0, 523.25, 698.46, 880.0]; // F major radiant chord
    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBlip(freq, "sine", 0.45);
      }, idx * 80);
    });
  }
}

export const sounds = new SoundManager();
