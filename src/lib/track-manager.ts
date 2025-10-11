import type { Clip, Track } from "./audio-engine";
import { AudioEngine } from "./audio-engine";
import { EffectsChain } from "./effects";
import { Synthesizer } from "./synthesizer";

export class TrackManager {
  private static instance: TrackManager;
  private tracks: Track[] = [];
  private audioEngine: AudioEngine;
  private listeners: Set<() => void> = new Set();
  private trackGains: Map<string, GainNode> = new Map();
  private trackPanners: Map<string, StereoPannerNode> = new Map();
  private trackEffects: Map<string, EffectsChain> = new Map();
  private trackSynths: Map<string, Synthesizer> = new Map();
  private isBrowser = typeof window !== "undefined";

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.initializeTracks();
  }

  static getInstance(): TrackManager {
    if (!TrackManager.instance) {
      TrackManager.instance = new TrackManager();
    }
    return TrackManager.instance;
  }

  private initializeTracks() {
    // Initialize exactly 4 MIDI tracks (for instruments) - FIRST
    const midiColors = ["#a29bfe", "#fd79a8", "#fdcb6e", "#6c5ce7"];
    const midiNames = ["MPC", "TB-303", "MIDI 3", "MIDI 4"];
    for (let i = 0; i < 4; i++) {
      const track: Track = {
        id: `midi-${i}`,
        name: midiNames[i],
        type: "midi",
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        arm: false,
        clips: [],
        color: midiColors[i],
      };
      this.tracks.push(track);
      this.setupTrackAudioNodes(track);
    }

    // Initialize exactly 4 audio tracks - SECOND
    const audioColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"];
    for (let i = 0; i < 4; i++) {
      const track: Track = {
        id: `audio-${i}`,
        name: `Audio ${i + 1}`,
        type: "audio",
        volume: 0.8,
        pan: 0,
        mute: false,
        solo: false,
        arm: false,
        clips: [],
        color: audioColors[i],
      };
      this.tracks.push(track);
      this.setupTrackAudioNodes(track);
    }
  }

  private setupTrackAudioNodes(track: Track) {
    // Skip audio node setup during SSR
    if (!this.isBrowser) return;

    const gain = this.audioEngine.context.createGain();
    const panner = this.audioEngine.context.createStereoPanner();

    gain.gain.value = track.volume;
    panner.pan.value = track.pan;

    const effectsChain = new EffectsChain();
    effectsChain.getOutputNode().connect(gain);

    gain.connect(panner);
    panner.connect(this.audioEngine.masterGain);

    this.trackGains.set(track.id, gain);
    this.trackPanners.set(track.id, panner);
    this.trackEffects.set(track.id, effectsChain);

    if (track.type === "midi") {
      const synth = new Synthesizer();
      this.trackSynths.set(track.id, synth);
    }
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  getTracks(): Track[] {
    return [...this.tracks];
  }

  getTrack(id: string): Track | undefined {
    return this.tracks.find((t) => t.id === id);
  }

  updateTrack(id: string, updates: Partial<Track>) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return;

    Object.assign(track, updates);

    const gain = this.trackGains.get(id);
    if (gain) {
      gain.gain.setTargetAtTime(
        updates.volume !== undefined ? updates.volume : track.volume,
        this.audioEngine.getCurrentTime(),
        0.01
      );
    }

    const panner = this.trackPanners.get(id);
    if (panner) {
      panner.pan.setTargetAtTime(
        updates.pan !== undefined ? updates.pan : track.pan,
        this.audioEngine.getCurrentTime(),
        0.01
      );
    }

    this.notify();
  }

  toggleMute(id: string) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return;

    track.mute = !track.mute;
    const gain = this.trackGains.get(id);
    if (gain) {
      gain.gain.setTargetAtTime(
        track.mute ? 0 : track.volume,
        this.audioEngine.getCurrentTime(),
        0.01
      );
    }

    this.notify();
  }

  toggleSolo(id: string) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return;

    track.solo = !track.solo;

    const hasSolo = this.tracks.some((t) => t.solo);

    this.tracks.forEach((t) => {
      const gain = this.trackGains.get(t.id);
      if (!gain) return;

      if (hasSolo) {
        gain.gain.setTargetAtTime(
          t.solo ? t.volume : 0,
          this.audioEngine.getCurrentTime(),
          0.01
        );
      } else {
        gain.gain.setTargetAtTime(
          t.mute ? 0 : t.volume,
          this.audioEngine.getCurrentTime(),
          0.01
        );
      }
    });

    this.notify();
  }

  toggleArm(id: string) {
    const track = this.tracks.find((t) => t.id === id);
    if (!track) return;

    track.arm = !track.arm;
    this.notify();
  }

  addClip(trackId: string, clip: Clip) {
    const track = this.tracks.find((t) => t.id === trackId);
    if (!track) return;

    track.clips.push(clip);
    this.notify();
  }

  removeClip(trackId: string, clipId: string) {
    const track = this.tracks.find((t) => t.id === trackId);
    if (!track) return;

    track.clips = track.clips.filter((c) => c.id !== clipId);
    this.notify();
  }

  getTrackGain(id: string): GainNode | undefined {
    return this.trackGains.get(id);
  }

  getTrackEffects(id: string): EffectsChain | undefined {
    return this.trackEffects.get(id);
  }

  getTrackSynth(id: string): Synthesizer | undefined {
    return this.trackSynths.get(id);
  }

  async loadAudioToClip(clipId: string, audioFile: File): Promise<void> {
    if (!this.isBrowser) return;

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await this.audioEngine.context.decodeAudioData(
      arrayBuffer
    );

    // Find the clip across all tracks
    for (const track of this.tracks) {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip && track.type === "audio") {
        clip.audioBuffer = audioBuffer;
        clip.name = audioFile.name;
        this.notify();
        return;
      }
    }
  }

  getTrackCount(): { audio: number; midi: number; total: number } {
    const audio = this.tracks.filter((t) => t.type === "audio").length;
    const midi = this.tracks.filter((t) => t.type === "midi").length;
    return { audio, midi, total: audio + midi };
  }
}
