/**
 * TB303 Synthesizer Engine
 * Emulates the classic Roland TB-303 bass synthesizer
 */
import type { DelayTime, EffectsChain, EffectSlot } from "./effects";
import { createDefaultEffectsChain } from "./effects";

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
  // Full ADSR envelope
  attack: number; // Attack time in seconds
  decay: number; // Decay time in seconds
  sustain: number; // Sustain level 0-1
  release: number; // Release time in seconds
  accent: number; // Accent amount 0-1
  volume: number; // 0-1
  noteLength: number; // 0-1, multiplier for note duration
  // Additional tone controls
  tune: number; // -12 to +12 semitones
  distortion: number; // 0-1
};

export const defaultTB303Patch: TB303Patch = {
  waveform: "sawtooth",
  cutoff: 0.3,
  resonance: 0.7,
  envMod: 0.5,
  attack: 0.003,
  decay: 0.2,
  sustain: 0.3,
  release: 0.1,
  accent: 0.6,
  volume: 0.7,
  noteLength: 0.5,
  tune: 0,
  distortion: 0,
};

export class TB303Synth {
  private audioContext: AudioContext;
  private patch: TB303Patch;
  private masterGain: GainNode;
  // FX chain support
  private inputBus: GainNode; // notes feed into this, then through FX, then to masterGain
  private effectsChain: EffectsChain;
  private effectsOutput: GainNode;
  private hasChainConnections: boolean = false;
  // Analysis for visualization
  public analyser: AnalyserNode;
  private analysisGain: GainNode;

  constructor(
    audioContext: AudioContext,
    patch: TB303Patch = defaultTB303Patch,
    outputNode?: AudioNode
  ) {
    this.audioContext = audioContext;
    this.patch = { ...patch };
    this.masterGain = audioContext.createGain();
    this.masterGain.gain.value = this.patch.volume;

    // Setup analyzer for waveform visualization
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.analysisGain = audioContext.createGain();
    this.analysisGain.gain.value = 1;

    // Connect to provided output node or default to audioContext.destination
    if (outputNode) {
      this.masterGain.connect(this.analysisGain);
      this.analysisGain.connect(this.analyser);
      this.analysisGain.connect(outputNode);
    } else {
      this.masterGain.connect(this.analysisGain);
      this.analysisGain.connect(this.analyser);
      this.analysisGain.connect(audioContext.destination);
    }

    // Initialize FX buses
    this.inputBus = this.audioContext.createGain();
    this.effectsOutput = this.audioContext.createGain();
    // Default empty FX chain and initial wiring
    this.effectsChain = createDefaultEffectsChain();
    this.rebuildEffectsGraph();
  }

  setPatch(patch: Partial<TB303Patch>) {
    this.patch = { ...this.patch, ...patch };
    this.masterGain.gain.value = this.patch.volume;
  }

  getPatch(): TB303Patch {
    return { ...this.patch };
  }

  setEffectsChain(chain: EffectsChain) {
    this.effectsChain = chain;
    this.rebuildEffectsGraph();
  }

  getEffectsChain(): EffectsChain {
    return this.effectsChain.map((e) => ({ ...e })) as EffectsChain;
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
    const tunedNote = midiNote + this.patch.tune;
    const frequency = this.midiToFreq(tunedNote);
    const prevFrequency =
      slideFrom !== undefined
        ? this.midiToFreq(slideFrom + this.patch.tune)
        : frequency;

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

    // Filter envelope with full ADSR
    filter.frequency.setValueAtTime(baseCutoff, startTime);
    filter.frequency.linearRampToValueAtTime(
      peakCutoff,
      startTime + this.patch.attack
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(baseCutoff + (peakCutoff - baseCutoff) * this.patch.sustain, 50),
      startTime + this.patch.attack + this.patch.decay
    );
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(baseCutoff, 30),
      startTime + duration + this.patch.release
    );

    // VCA (Voltage Controlled Amplifier) with ADSR
    const ampEnv = this.audioContext.createGain();
    const peakLevel = accent ? 0.8 + this.patch.accent * 0.2 : 0.6;
    const sustainLevel = peakLevel * this.patch.sustain;

    // Full ADSR amplitude envelope
    ampEnv.gain.setValueAtTime(0, startTime);
    ampEnv.gain.linearRampToValueAtTime(
      peakLevel,
      startTime + this.patch.attack
    );
    ampEnv.gain.exponentialRampToValueAtTime(
      Math.max(sustainLevel, 0.001),
      startTime + this.patch.attack + this.patch.decay
    );
    ampEnv.gain.setValueAtTime(sustainLevel, startTime + duration);
    ampEnv.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + duration + this.patch.release
    );

    // Optional distortion
    let currentNode: AudioNode = filter;
    if (this.patch.distortion > 0) {
      const waveshaper = this.audioContext.createWaveShaper();
      const amount = this.patch.distortion;
      const samples = 44100;
      const curve = new Float32Array(samples);
      const k = amount * 100;

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x) / (Math.PI + k * Math.abs(x));
      }

      waveshaper.curve = curve;
      waveshaper.oversample = "2x";

      currentNode.connect(waveshaper);
      currentNode = waveshaper;
    }

    // Connect the chain
    osc.connect(filter);
    currentNode.connect(ampEnv);
    // Route through FX input bus
    ampEnv.connect(this.inputBus);

    // Start and stop
    osc.start(startTime);
    osc.stop(startTime + duration + this.patch.release + 0.1);

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
    if (this.hasChainConnections) {
      this.inputBus.disconnect();
      this.effectsOutput.disconnect();
      this.hasChainConnections = false;
    }
    this.masterGain.disconnect();
  }

  /**
   * Set master volume
   */
  setVolume(volume: number) {
    this.patch.volume = volume;
    this.masterGain.gain.value = volume;
  }

  // Build FX graph between inputBus -> [effects...] -> effectsOutput -> masterGain
  private rebuildEffectsGraph() {
    if (this.hasChainConnections) {
      this.inputBus.disconnect();
      this.effectsOutput.disconnect();
      this.hasChainConnections = false;
    }

    let current: AudioNode = this.inputBus;

    for (const effect of this.effectsChain) {
      if (!effect.enabled || effect.type === "none") continue;
      current = this.applyEffect(effect, current);
    }

    // Ensure final node connects to effectsOutput
    current.connect(this.effectsOutput);
    this.effectsOutput.connect(this.masterGain);
    this.hasChainConnections = true;
  }

  private applyEffect(effect: EffectSlot, inputNode: AudioNode): AudioNode {
    if (!effect.enabled || effect.type === "none") return inputNode;

    const dryWet = effect.dryWet ?? 0.5;
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();
    dryGain.gain.value = 1 - dryWet;
    wetGain.gain.value = dryWet;

    let wetNode: AudioNode;

    switch (effect.type) {
      case "reverb":
        wetNode = this.createReverb(effect);
        break;
      case "delay":
        wetNode = this.createDelay(effect);
        break;
      case "distortion":
        wetNode = this.createDistortion(effect, true);
        break;
      case "saturation":
        wetNode = this.createDistortion(effect, false);
        break;
      case "phaser":
        wetNode = this.createPhaser(effect);
        break;
      case "chorus":
        wetNode = this.createChorus(effect);
        break;
      case "compressor":
        wetNode = this.createCompressor(effect);
        break;
      case "limiter":
        wetNode = this.createLimiter(effect);
        break;
      case "arpeggiator":
        wetNode = this.createArpeggiator();
        break;
      default:
        return inputNode;
    }

    inputNode.connect(dryGain);
    inputNode.connect(wetNode);
    wetNode.connect(wetGain);

    const mergeNode = this.audioContext.createGain();
    dryGain.connect(mergeNode);
    wetGain.connect(mergeNode);

    return mergeNode;
  }

  private createReverb(effect: EffectSlot): AudioNode {
    const convolver = this.audioContext.createConvolver();
    const size = effect.reverbSize ?? 2;
    const decay = effect.reverbDecay ?? 0.5;

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * size;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] =
          (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay * 3);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  private getDelayTimeSeconds(delayTime: DelayTime): number {
    const secondsPerBeat = 60.0 / 120; // Fallback; synth itself doesn't know global BPM
    const quarterNote = secondsPerBeat;
    switch (delayTime) {
      case "quarter":
        return quarterNote;
      case "half":
        return quarterNote * 2;
      case "8th":
        return quarterNote / 2;
      case "16th":
        return quarterNote / 4;
      case "32nd":
        return quarterNote / 8;
      case "triplet":
        return (quarterNote / 3) * 2; // 8th note triplet
    }
  }

  private createDelay(effect: EffectSlot): AudioNode {
    const delayNode = this.audioContext.createDelay(5.0);
    const delayTime = effect.delayTime ?? "16th";
    delayNode.delayTime.value = this.getDelayTimeSeconds(delayTime);

    const feedback = this.audioContext.createGain();
    feedback.gain.value = effect.delayFeedback ?? 0.4;

    delayNode.connect(feedback);
    feedback.connect(delayNode);

    return delayNode;
  }

  private createDistortion(effect: EffectSlot, hard: boolean): AudioNode {
    const waveshaper = this.audioContext.createWaveShaper();
    const amount = effect.distortionAmount ?? 0.5;
    const tone = effect.distortionTone ?? 0.5;

    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    const k = hard ? amount * 200 : amount * 50;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }

    waveshaper.curve = curve;
    waveshaper.oversample = "4x";

    // Add tone control filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400 + tone * 19600; // 400Hz to 20kHz
    filter.Q.value = 1;

    waveshaper.connect(filter);
    return waveshaper;
  }

  private createPhaser(effect: EffectSlot): AudioNode {
    const rate = effect.phaserRate ?? 0.5;
    const depth = effect.phaserDepth ?? 0.5;
    const stages = effect.phaserStages ?? 4;

    const input = this.audioContext.createGain();
    let current: AudioNode = input;

    // Create allpass filter stages
    for (let i = 0; i < stages; i++) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "allpass";
      filter.frequency.value = 500 + i * 500;
      filter.Q.value = 1;

      // LFO for modulation
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();
      lfo.frequency.value = rate * 2; // 0-2Hz
      lfoGain.gain.value = depth * 1000; // Modulation depth

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      current.connect(filter);
      current = filter;
    }

    return current;
  }

  private createChorus(effect: EffectSlot): AudioNode {
    const rate = effect.chorusRate ?? 0.5;
    const depth = effect.chorusDepth ?? 0.5;
    const delayTime = effect.chorusDelay ?? 0.02;

    const delayNode = this.audioContext.createDelay(1);
    delayNode.delayTime.value = delayTime;

    // LFO for chorus modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.frequency.value = rate * 5; // 0-5Hz
    lfoGain.gain.value = depth * 0.01; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(delayNode.delayTime);
    lfo.start();

    return delayNode;
  }

  private createCompressor(effect: EffectSlot): AudioNode {
    const compressor = this.audioContext.createDynamicsCompressor();

    compressor.threshold.value = effect.compressorThreshold ?? -24;
    compressor.ratio.value = effect.compressorRatio ?? 4;
    compressor.attack.value = effect.compressorAttack ?? 0.003;
    compressor.release.value = effect.compressorRelease ?? 0.25;
    compressor.knee.value = effect.compressorKnee ?? 30;

    return compressor;
  }

  private createLimiter(effect: EffectSlot): AudioNode {
    const limiter = this.audioContext.createDynamicsCompressor();

    // Limiter is essentially a compressor with a very high ratio
    limiter.threshold.value = effect.limiterThreshold ?? -3;
    limiter.ratio.value = 20; // High ratio for limiting
    limiter.attack.value = 0.001; // Very fast attack
    limiter.release.value = effect.limiterRelease ?? 0.01;
    limiter.knee.value = 0; // Hard knee for limiting

    return limiter;
  }

  private createArpeggiator(): AudioNode {
    // For now, return a simple gain node as passthrough
    // The actual arpeggiator logic would need to be implemented
    // at a higher level to intercept and reschedule notes
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 1;

    // TODO: Implement proper arpeggiator logic that:
    // 1. Intercepts incoming chords/notes
    // 2. Breaks them into individual notes based on pattern
    // 3. Schedules them with proper timing and gate
    // 4. Handles octave ranges and different patterns

    return gainNode;
  }
}
