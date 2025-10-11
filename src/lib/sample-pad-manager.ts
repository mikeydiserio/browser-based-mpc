import { AudioEngine } from "./audio-engine";

export interface SamplePad {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  warp: boolean;
  quantize: boolean;
  loop: boolean;
  hold: boolean;
  gain: number;
  pitch: number;
  velocityToVolume: number;
  adsr: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  eq: {
    bands: Array<{
      frequency: number;
      gain: number;
      q: number;
      type: BiquadFilterType;
    }>;
  };
}

export class SamplePadManager {
  private audioEngine: AudioEngine;
  private pads: Map<string, SamplePad> = new Map();
  private listeners: Set<() => void> = new Set();
  private activeSources: Map<string, AudioBufferSourceNode> = new Map();
  private isBrowser = typeof window !== "undefined";

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  async loadSample(file: File): Promise<SamplePad | null> {
    if (!this.isBrowser) return null;

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioEngine.context.decodeAudioData(
      arrayBuffer
    );

    const pad: SamplePad = {
      id: `pad-${Date.now()}-${Math.random()}`,
      name: file.name,
      audioBuffer,
      warp: false,
      quantize: false,
      loop: false,
      hold: false,
      gain: 1.0,
      pitch: 0,
      velocityToVolume: 0.5,
      adsr: {
        attack: 0.005,
        decay: 0.05,
        sustain: 0.8,
        release: 0.08,
      },
      eq: {
        bands: [
          { frequency: 60, gain: 0, q: 1.0, type: "lowshelf" },
          { frequency: 250, gain: 0, q: 1.0, type: "peaking" },
          { frequency: 1000, gain: 0, q: 1.0, type: "peaking" },
          { frequency: 3000, gain: 0, q: 1.0, type: "peaking" },
          { frequency: 8000, gain: 0, q: 1.0, type: "peaking" },
          { frequency: 16000, gain: 0, q: 1.0, type: "highshelf" },
        ],
      },
    };

    this.pads.set(pad.id, pad);
    this.notify();
    return pad;
  }

  getPad(id: string): SamplePad | undefined {
    return this.pads.get(id);
  }

  getAllPads(): SamplePad[] {
    return Array.from(this.pads.values());
  }

  updatePad(id: string, updates: Partial<SamplePad>) {
    const pad = this.pads.get(id);
    if (!pad) return;

    Object.assign(pad, updates);
    this.notify();
  }

  deletePad(id: string) {
    this.pads.delete(id);
    this.notify();
  }

  playSample(
    padId: string,
    destination: AudioNode,
    velocity = 1.0,
    startTime?: number
  ): AudioBufferSourceNode | null {
    if (!this.isBrowser) return null;

    const pad = this.pads.get(padId);
    if (!pad || !pad.audioBuffer) return null;

    const now = this.audioEngine.context.currentTime;
    const when = startTime || now;

    // Create source
    const source = this.audioEngine.context.createBufferSource();
    source.buffer = pad.audioBuffer;
    source.loop = pad.loop;
    source.playbackRate.value = Math.pow(2, pad.pitch / 12);

    // Create gain envelope
    const gainNode = this.audioEngine.context.createGain();
    const finalGain =
      pad.gain * (pad.velocityToVolume * velocity + (1 - pad.velocityToVolume));

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, when);
    gainNode.gain.linearRampToValueAtTime(finalGain, when + pad.adsr.attack);
    gainNode.gain.linearRampToValueAtTime(
      finalGain * pad.adsr.sustain,
      when + pad.adsr.attack + pad.adsr.decay
    );

    // Create EQ chain
    let currentNode: AudioNode = source;
    const eqNodes: BiquadFilterNode[] = [];

    for (const band of pad.eq.bands) {
      const filter = this.audioEngine.context.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.Q.value = band.q;
      filter.gain.value = band.gain;

      currentNode.connect(filter);
      currentNode = filter;
      eqNodes.push(filter);
    }

    currentNode.connect(gainNode);
    gainNode.connect(destination);

    // Handle release
    source.onended = () => {
      const releaseTime = this.audioEngine.context.currentTime;
      gainNode.gain.cancelScheduledValues(releaseTime);
      gainNode.gain.setValueAtTime(gainNode.gain.value, releaseTime);
      gainNode.gain.linearRampToValueAtTime(0, releaseTime + pad.adsr.release);

      setTimeout(() => {
        source.disconnect();
        eqNodes.forEach((node) => node.disconnect());
        gainNode.disconnect();
        this.activeSources.delete(padId);
      }, pad.adsr.release * 1000 + 100);
    };

    source.start(when);
    this.activeSources.set(padId, source);

    return source;
  }

  stopSample(padId: string) {
    const source = this.activeSources.get(padId);
    if (source) {
      source.stop();
      this.activeSources.delete(padId);
    }
  }
}
