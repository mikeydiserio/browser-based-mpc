// Core Web Audio API engine for the DAW
export class AudioEngine {
  start() {
    throw new Error("Method not implemented.");
  }
  stop() {
    throw new Error("Method not implemented.");
  }
  loadSampleToPad() {
    throw new Error("Method not implemented.");
  }
  setPadPitch() {
    throw new Error("Method not implemented.");
  }
  setPadGain() {
    throw new Error("Method not implemented.");
  }
  setPadAdsr() {
    throw new Error("Method not implemented.");
  }
  updatePadEffectSlot() {
    throw new Error("Method not implemented.");
  }
  getSampleForPad() {
    throw new Error("Method not implemented.");
  }
  updatePadEQBand() {
    throw new Error("Method not implemented.");
  }
  clearAllPads() {
    throw new Error("Method not implemented.");
  }
  loadArrayBufferToPad() {
    throw new Error("Method not implemented.");
  }
  assignSliceToPad() {
    throw new Error("Method not implemented.");
  }
  loadSamplesFromUrls() {
    throw new Error("Method not implemented.");
  }
  private static instance: AudioEngine;
  public context!: AudioContext;
  public masterGain!: GainNode;
  public masterAnalyser!: AnalyserNode;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private isInitialized = false;
  private isBrowser = typeof window !== "undefined";
  private autoResumeAttached = false;

  private constructor() {
    // Only initialize AudioContext in the browser
    if (this.isBrowser) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.8;

      // Create master analyser for VU metering
      this.masterAnalyser = this.context.createAnalyser();
      this.masterAnalyser.fftSize = 512;
      this.masterAnalyser.smoothingTimeConstant = 0.3;

      // Route: masterGain -> analyser -> destination
      this.masterGain.connect(this.masterAnalyser);
      this.masterAnalyser.connect(this.context.destination);
    }
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async initialize() {
    if (this.isInitialized || !this.isBrowser) return;

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.isInitialized = true;
  }

  /**
   * Attach one-time listeners to resume the AudioContext on first user gesture.
   */
  enableAutoResume() {
    if (!this.isBrowser || this.autoResumeAttached) return;
    const resume = async () => {
      try {
        if (this.context.state === "suspended") {
          await this.context.resume();
        }
      } catch {
        // ignore
      } finally {
        window.removeEventListener("click", resume);
        window.removeEventListener("touchstart", resume);
        window.removeEventListener("keydown", resume);
        this.autoResumeAttached = true;
      }
    };
    window.addEventListener("click", resume, { once: true });
    window.addEventListener("touchstart", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
  }

  getCurrentTime(): number {
    if (!this.isBrowser) return 0;
    return this.context.currentTime;
  }

  getSampleRate(): number {
    if (!this.isBrowser) return 44100;
    return this.context.sampleRate;
  }

  getMasterAnalyser(): AnalyserNode | null {
    return this.masterAnalyser || null;
  }

  async startRecording(): Promise<void> {
    if (!this.isBrowser || this.isRecording) return;

    try {
      // Create a MediaStreamDestination to capture audio
      const dest = this.context.createMediaStreamDestination();
      this.masterGain.connect(dest);

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(dest.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No active recording"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        this.recordedChunks = [];
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  downloadRecording(blob: Blob, filename: string = "recording.webm") {
    if (!this.isBrowser) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export interface Track {
  id: string;
  name: string;
  type: "audio" | "midi";
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  arm: boolean;
  clips: Clip[];
  color: string;
}

export interface Clip {
  id: string;
  name: string;
  trackId: string;
  startTime: number;
  duration: number;
  color: string;
  audioBuffer?: AudioBuffer;
  midiNotes?: MidiNote[];
  // Audio clip settings
  loop?: boolean;
  quantize?: boolean;
  quantizeValue?: number; // in beats (0.25 = 16th, 0.5 = 8th, 1 = quarter, etc.)
}

export interface MidiNote {
  id: string;
  pitch: number; // 0-127
  velocity: number; // 0-127
  startTime: number; // in beats
  duration: number; // in beats
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  tempo: number;
  timeSignature: [number, number];
  currentTime: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  metronomeEnabled: boolean;
}
