/**
 * TB303 Synthesizer Engine
 * Emulates the classic Roland TB-303 bass synthesizer
 */

export type TB303Note = {
  note: number; // MIDI note number (0-127)
  startStep: number; // Which 16th note step (0-15 for 1 bar)
  duration: number; // Duration in steps
  accent: boolean; // Accent flag
  slide: boolean; // Glide/slide to next note
};

export type TB303Patch = {
  waveform: "sawtooth" | "square";
  cutoff: number; // 0-1
  resonance: number; // 0-1
  envMod: number; // Envelope modulation amount 0-1
  decay: number; // Envelope decay time in seconds
  accent: number; // Accent amount 0-1
  volume: number; // 0-1
};

export const defaultTB303Patch: TB303Patch = {
  waveform: "sawtooth",
  cutoff: 0.3,
  resonance: 0.7,
  envMod: 0.5,
  decay: 0.2,
  accent: 0.6,
  volume: 0.7,
};

export class TB303Synth {
  private audioContext: AudioContext;
  private patch: TB303Patch;
  private masterGain: GainNode;

  constructor(
    audioContext: AudioContext,
    patch: TB303Patch = defaultTB303Patch
  ) {
    this.audioContext = audioContext;
    this.patch = { ...patch };
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.value = this.patch.volume;
    this.masterGain.connect(audioContext.destination);
  }

  setPatch(patch: Partial<TB303Patch>) {
    this.patch = { ...this.patch, ...patch };
    this.masterGain.gain.value = this.patch.volume;
  }

  getPatch(): TB303Patch {
    return { ...this.patch };
  }

  /**
   * Trigger a single note
   */
  triggerNote(
    midiNote: number,
    startTime: number,
    duration: number,
    accent: boolean = false,
    slideFrom?: number
  ) {
    const frequency = this.midiToFreq(midiNote);
    const prevFrequency =
      slideFrom !== undefined ? this.midiToFreq(slideFrom) : frequency;

    // Oscillator
    const osc = this.audioContext.createOscillator();
    osc.type = this.patch.waveform;

    // Apply slide/glide if coming from another note
    if (slideFrom !== undefined) {
      osc.frequency.setValueAtTime(prevFrequency, startTime);
      osc.frequency.exponentialRampToValueAtTime(frequency, startTime + 0.05);
    } else {
      osc.frequency.setValueAtTime(frequency, startTime);
    }

    // VCF (Voltage Controlled Filter) - the heart of the 303 sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";

    // Base cutoff frequency
    const baseCutoff = 50 + this.patch.cutoff * 5000; // 50Hz to 5kHz
    const resonanceQ = 0.5 + this.patch.resonance * 29.5; // 0.5 to 30
    filter.Q.value = resonanceQ;

    // Envelope modulation
    const envAmount = this.patch.envMod * 4000; // Up to 4kHz modulation
    const accentBoost = accent ? 1 + this.patch.accent * 2 : 1; // Up to 3x boost on accent
    const peakCutoff = Math.min(baseCutoff + envAmount * accentBoost, 20000);

    // Filter envelope
    filter.frequency.setValueAtTime(peakCutoff, startTime);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(baseCutoff, 30),
      startTime + this.patch.decay
    );

    // VCA (Voltage Controlled Amplifier)
    const ampEnv = this.audioContext.createGain();
    const accentLevel = accent ? 0.8 + this.patch.accent * 0.2 : 0.6;

    // Amplitude envelope
    ampEnv.gain.setValueAtTime(0, startTime);
    ampEnv.gain.linearRampToValueAtTime(accentLevel, startTime + 0.003); // Fast attack
    ampEnv.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Connect the chain
    osc.connect(filter);
    filter.connect(ampEnv);
    ampEnv.connect(this.masterGain);

    // Start and stop
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    return { osc, filter, ampEnv };
  }

  /**
   * Convert MIDI note to frequency
   */
  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.masterGain.disconnect();
  }

  /**
   * Set master volume
   */
  setVolume(volume: number) {
    this.patch.volume = volume;
    this.masterGain.gain.value = volume;
  }
}
