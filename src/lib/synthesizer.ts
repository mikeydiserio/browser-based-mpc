import type { MidiNote } from "./audio-engine";
import { AudioEngine } from "./audio-engine";

export interface SynthSettings {
  waveform: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterFrequency: number;
  filterQ: number;
}

export class Synthesizer {
  private audioEngine: AudioEngine;
  private activeNotes: Map<
    string,
    { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }
  > = new Map();
  private settings: SynthSettings = {
    waveform: "sawtooth",
    attack: 0.01,
    decay: 0.1,
    sustain: 0.7,
    release: 0.3,
    filterFrequency: 2000,
    filterQ: 1,
  };
  private isBrowser = typeof window !== "undefined";

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
  }

  updateSettings(settings: Partial<SynthSettings>) {
    Object.assign(this.settings, settings);
  }

  getSettings(): SynthSettings {
    return { ...this.settings };
  }

  playNote(note: MidiNote, outputNode: GainNode, startTime?: number) {
    if (!this.isBrowser) return "";

    const frequency = this.midiNoteToFrequency(note.pitch);
    const velocity = note.velocity / 127;
    const now = startTime || this.audioEngine.getCurrentTime();

    const osc = this.audioEngine.context.createOscillator();
    const gain = this.audioEngine.context.createGain();
    const filter = this.audioEngine.context.createBiquadFilter();

    osc.type = this.settings.waveform;
    osc.frequency.value = frequency;

    filter.type = "lowpass";
    filter.frequency.value = this.settings.filterFrequency;
    filter.Q.value = this.settings.filterQ;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(outputNode);

    // ADSR envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity, now + this.settings.attack);
    gain.gain.linearRampToValueAtTime(
      velocity * this.settings.sustain,
      now + this.settings.attack + this.settings.decay
    );

    osc.start(now);

    const noteKey = `${note.pitch}-${now}`;
    this.activeNotes.set(noteKey, { osc, gain, filter });

    // Schedule note off
    const duration = note.duration;
    this.stopNote(noteKey, now + duration);

    return noteKey;
  }

  stopNote(noteKey: string, stopTime?: number) {
    if (!this.isBrowser) return;

    const note = this.activeNotes.get(noteKey);
    if (!note) return;

    const now = stopTime || this.audioEngine.getCurrentTime();

    note.gain.gain.cancelScheduledValues(now);
    note.gain.gain.setValueAtTime(note.gain.gain.value, now);
    note.gain.gain.linearRampToValueAtTime(0, now + this.settings.release);

    note.osc.stop(now + this.settings.release);

    setTimeout(() => {
      this.activeNotes.delete(noteKey);
    }, (this.settings.release + 0.1) * 1000);
  }

  stopAllNotes() {
    if (!this.isBrowser) return;

    const now = this.audioEngine.getCurrentTime();
    this.activeNotes.forEach((_note, key) => {
      this.stopNote(key, now);
    });
  }

  private midiNoteToFrequency(_midiNote: number): number {
    return 440 * Math.pow(2, (_midiNote - 69) / 12);
  }
}
