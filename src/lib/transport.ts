import { AudioEngine } from "./audio-engine";

export class Transport {
  private static instance: Transport;
  private audioEngine: AudioEngine;
  private isPlaying = false;
  private isRecording = false;
  private tempo = 120;
  private timeSignature: [number, number] = [4, 4];
  private currentTime = 0;
  private startTime = 0;
  private metronomeEnabled = false;
  private metronomeGain!: GainNode;
  private scheduledEvents: number[] = [];
  private animationFrameId: number | null = null;
  private listeners: Set<() => void> = new Set();
  private isBrowser = typeof window !== "undefined";

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    if (this.isBrowser) {
      this.metronomeGain = this.audioEngine.context.createGain();
      this.metronomeGain.connect(this.audioEngine.masterGain);
      this.metronomeGain.gain.value = 0.5;
    }
  }

  static getInstance(): Transport {
    if (!Transport.instance) {
      Transport.instance = new Transport();
    }
    return Transport.instance;
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  play() {
    if (this.isPlaying || !this.isBrowser) return;

    this.audioEngine.initialize();
    this.isPlaying = true;
    this.startTime = this.audioEngine.getCurrentTime() - this.currentTime;

    if (this.metronomeEnabled) {
      this.scheduleMetronome();
    }

    this.startAnimationLoop();
    this.notify();
  }

  pause() {
    this.isPlaying = false;
    this.stopAnimationLoop();
    this.clearScheduledEvents();
    this.notify();
  }

  stop() {
    this.isPlaying = false;
    this.isRecording = false;
    this.currentTime = 0;
    this.stopAnimationLoop();
    this.clearScheduledEvents();
    this.notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  toggleRecord() {
    this.isRecording = !this.isRecording;
    if (this.isRecording && !this.isPlaying) {
      this.play();
    }
    this.notify();
  }

  setTempo(tempo: number) {
    this.tempo = Math.max(20, Math.min(999, tempo));
    this.notify();
  }

  toggleMetronome() {
    this.metronomeEnabled = !this.metronomeEnabled;
    if (this.isPlaying) {
      if (this.metronomeEnabled) {
        this.scheduleMetronome();
      } else {
        this.clearScheduledEvents();
      }
    }
    this.notify();
  }

  private scheduleMetronome() {
    const secondsPerBeat = 60 / this.tempo;
    const currentAudioTime = this.audioEngine.getCurrentTime();
    const scheduleAheadTime = 0.1;

    // Schedule next 4 beats
    for (let i = 0; i < 4; i++) {
      const beatTime =
        this.startTime +
        Math.ceil(this.currentTime / secondsPerBeat + i) * secondsPerBeat;
      const audioTime = beatTime;

      if (
        audioTime > currentAudioTime &&
        audioTime < currentAudioTime + scheduleAheadTime
      ) {
        this.playMetronomeClick(audioTime, i % this.timeSignature[0] === 0);
      }
    }
  }

  private playMetronomeClick(time: number, isDownbeat: boolean) {
    if (!this.isBrowser) return;

    const osc = this.audioEngine.context.createOscillator();
    const gain = this.audioEngine.context.createGain();

    osc.connect(gain);
    gain.connect(this.metronomeGain);

    osc.frequency.value = isDownbeat ? 1000 : 800;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private startAnimationLoop() {
    const update = () => {
      if (this.isPlaying) {
        this.currentTime = this.audioEngine.getCurrentTime() - this.startTime;

        if (this.metronomeEnabled) {
          this.scheduleMetronome();
        }

        this.notify();
        this.animationFrameId = requestAnimationFrame(update);
      }
    };
    update();
  }

  private stopAnimationLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private clearScheduledEvents() {
    this.scheduledEvents.forEach((id) => clearTimeout(id));
    this.scheduledEvents = [];
  }

  setPosition(bar: number, beat: number) {
    const secondsPerBeat = 60 / this.tempo;
    const totalBeats = bar * this.timeSignature[0] + beat;
    this.currentTime = totalBeats * secondsPerBeat;

    if (this.isPlaying) {
      this.startTime = this.audioEngine.getCurrentTime() - this.currentTime;
    }

    this.notify();
  }

  private getCurrentBar(): number {
    const secondsPerBeat = 60 / this.tempo;
    const totalBeats = this.currentTime / secondsPerBeat;
    return Math.floor(totalBeats / this.timeSignature[0]);
  }

  private getCurrentBeat(): number {
    const secondsPerBeat = 60 / this.tempo;
    const totalBeats = this.currentTime / secondsPerBeat;
    return totalBeats % this.timeSignature[0];
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isRecording: this.isRecording,
      tempo: this.tempo,
      timeSignature: this.timeSignature,
      currentTime: this.currentTime,
      metronomeEnabled: this.metronomeEnabled,
      currentBar: this.getCurrentBar(),
      currentBeat: this.getCurrentBeat(),
    };
  }
}
