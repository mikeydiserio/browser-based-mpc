import type { DelayTime, EffectsChain, EffectSlot } from "./effects";
import { createDefaultEffectsChain } from "./effects";
import type { EQSettings } from "./eq";
import { createDefaultEQSettings } from "./eq";

export type LoadedSample = {
  id: string;
  name: string;
  arrayBuffer: ArrayBuffer;
  audioBuffer?: AudioBuffer;
  pitchSemitones: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  startOffsetSec?: number;
  durationSec?: number;
  warp: boolean;
  quantize: boolean;
  loop: boolean;
  hold: boolean;
  // EQ
  eq: EQSettings;
  // FX chain
  effectsChain: EffectsChain;
};

export type StepEvent = {
  stepIndex: number;
  isAccent: boolean;
};

export class AudioEngine {
  private audioContext: AudioContext;
  private lookaheadMs = 25;
  private scheduleAheadTime = 0.1;
  private nextNoteTime = 0;
  private currentStep = 0;
  private numSteps = 16;
  private isRunning = false;
  private bpm = 120;
  private timerId: number | null = null;
  private metronomeOn = true;
  private metronomeGain: GainNode | null = null;
  private swingAmount = 0; // 0..1 fraction of half-step delay on off-steps

  private stepCallbacks = new Set<(e: StepEvent) => void>();
  private padMap = new Map<string, LoadedSample>();
  private patternMatrix: boolean[][] = Array.from({ length: 16 }, () =>
    Array(16).fill(false)
  );
  private barCallbacks = new Set<(barIndex: number) => void>();
  private barCount = 0;
  private playingPerPad = new Map<
    string,
    { gain: GainNode; startTime: number } | null
  >();

  constructor(context?: AudioContext) {
    const W = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    this.audioContext =
      context ?? new (W.AudioContext || W.webkitAudioContext!)();
    this.metronomeGain = this.audioContext.createGain();
    this.metronomeGain.gain.value = 0.0;
    this.metronomeGain.connect(this.audioContext.destination);
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  getBpm() {
    return this.bpm;
  }

  setMetronome(on: boolean) {
    this.metronomeOn = on;
    if (this.metronomeGain) this.metronomeGain.gain.value = on ? 1.0 : 0.0;
  }

  getMetronome() {
    return this.metronomeOn;
  }

  setSwing(amount: number) {
    // clamp 0..1
    this.swingAmount = Math.max(0, Math.min(1, amount));
  }

  getSwing() {
    return this.swingAmount;
  }

  setPattern(matrix: boolean[][]) {
    this.patternMatrix = matrix;
  }

  getPattern() {
    return this.patternMatrix;
  }

  setSteps(count: number) {
    this.numSteps = count;
    // Resize pattern columns
    this.patternMatrix = this.patternMatrix.map((row) => {
      const next = row.slice(0, count);
      while (next.length < count) next.push(false);
      return next;
    });
  }

  onStep(cb: (e: StepEvent) => void) {
    this.stepCallbacks.add(cb);
  }
  offStep(cb: (e: StepEvent) => void) {
    this.stepCallbacks.delete(cb);
  }

  onBar(cb: (barIndex: number) => void) {
    this.barCallbacks.add(cb);
  }
  offBar(cb: (barIndex: number) => void) {
    this.barCallbacks.delete(cb);
  }
  getBarCount() {
    return this.barCount;
  }

  private scheduleStep(stepIndex: number, time: number) {
    const isAccent = stepIndex % 4 === 0;
    this.stepCallbacks.forEach((cb) => cb({ stepIndex, isAccent }));

    if (stepIndex === 0) {
      this.barCount += 1;
      this.barCallbacks.forEach((cb) => cb(this.barCount));
    }

    if (this.metronomeOn) {
      this.triggerClick(time, isAccent);
    }

    for (let padRow = 0; padRow < this.patternMatrix.length; padRow++) {
      if (this.patternMatrix[padRow]?.[stepIndex]) {
        const padId = `pad-${padRow}`;
        const sample = this.padMap.get(padId);
        if (sample?.audioBuffer) {
          this.triggerBuffer(sample, time);
        }
      }
    }
  }

  private triggerClick(when: number, accent: boolean) {
    if (!this.metronomeGain) return;
    const osc = this.audioContext.createOscillator();
    const env = this.audioContext.createGain();
    osc.type = "square";
    osc.frequency.value = accent ? 2000 : 1200;
    env.gain.value = 0.0;
    osc.connect(env);
    env.connect(this.metronomeGain);
    const attack = 0.001;
    const decay = 0.06;
    env.gain.setValueAtTime(0.0, when);
    env.gain.linearRampToValueAtTime(accent ? 0.6 : 0.35, when + attack);
    env.gain.exponentialRampToValueAtTime(0.001, when + decay);
    osc.start(when);
    osc.stop(when + 0.08);
  }

  private getDelayTimeSeconds(delayTime: DelayTime): number {
    const secondsPerBeat = 60.0 / this.bpm;
    const quarterNote = secondsPerBeat;
    switch (delayTime) {
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

  private applyEQ(eqSettings: EQSettings, inputNode: AudioNode): AudioNode {
    let current: AudioNode = inputNode;

    for (const band of eqSettings) {
      if (!band.enabled) continue;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      filter.Q.value = band.q;

      current.connect(filter);
      current = filter;
    }

    return current;
  }

  private triggerBuffer(sample: LoadedSample, when: number) {
    const source = this.audioContext.createBufferSource();
    source.buffer = sample.audioBuffer!;
    const playbackRate = Math.pow(2, sample.pitchSemitones / 12);
    source.playbackRate.value = playbackRate;

    const amp = this.audioContext.createGain();
    const a = sample.attack ?? 0.005;
    const d = sample.decay ?? 0.05;
    const s = sample.sustain ?? 0.8;
    const r = sample.release ?? 0.08;
    const dur = source.buffer?.duration ?? 0;

    amp.gain.setValueAtTime(0, when);
    amp.gain.linearRampToValueAtTime(1, when + a);
    amp.gain.linearRampToValueAtTime(s, when + a + d);

    // Apply release near end for one-shots to avoid clicks
    if (!sample.loop && dur > r) {
      amp.gain.setValueAtTime(s, when + Math.max(a + d, dur - r));
      amp.gain.linearRampToValueAtTime(0.0001, when + dur);
    }

    source.connect(amp);

    // Apply EQ
    let outputNode: AudioNode = amp;
    outputNode = this.applyEQ(sample.eq, outputNode);

    // Process effects chain
    for (const effect of sample.effectsChain) {
      outputNode = this.applyEffect(effect, outputNode);
    }

    outputNode.connect(this.audioContext.destination);

    if (sample.loop) {
      source.loop = true;
      source.loopStart = 0;
      source.loopEnd = source.buffer?.duration ?? 0;
    }
    const offset = sample.startOffsetSec ?? 0;
    const playDur = sample.durationSec ?? undefined;
    try {
      source.start(when, offset, playDur);
    } catch {
      source.start(when);
    }

    // Store for real-time envelope adjustment
    this.playingPerPad.set(sample.id, { gain: amp, startTime: when });
  }

  async loadSampleToPad(padIndex: number, file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(
      arrayBuffer.slice(0)
    );
    const sample: LoadedSample = {
      id: `pad-${padIndex}`,
      name: file.name,
      arrayBuffer,
      audioBuffer,
      pitchSemitones: 0,
      attack: 0.005,
      decay: 0.05,
      sustain: 0.8,
      release: 0.08,
      warp: false,
      quantize: true,
      loop: false,
      hold: false,
      eq: createDefaultEQSettings(),
      effectsChain: createDefaultEffectsChain(),
    };
    this.padMap.set(sample.id, sample);
    return sample;
  }

  triggerPad(padIndex: number) {
    const sample = this.padMap.get(`pad-${padIndex}`);
    if (!sample?.audioBuffer) return;
    const now = this.audioContext.currentTime;
    this.triggerBuffer(sample, now);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.nextNoteTime = this.audioContext.currentTime;
    this.scheduler();
  }

  stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentStep = 0;
    this.barCount = 0;
  }

  private scheduler = () => {
    if (!this.isRunning) return;
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      const secondsPerBeat = 60.0 / this.bpm;
      const stepInterval = secondsPerBeat / 4;
      const isOffStep = this.currentStep % 2 === 1;
      const swingOffset = isOffStep
        ? this.swingAmount * (stepInterval * 0.5)
        : 0;
      const scheduledTime = this.nextNoteTime + swingOffset;
      this.scheduleStep(this.currentStep, scheduledTime);
      this.nextNoteTime += stepInterval;
      this.currentStep = (this.currentStep + 1) % this.numSteps;
    }
    this.timerId = window.setTimeout(this.scheduler, this.lookaheadMs);
  };

  getSampleForPad(padIndex: number): LoadedSample | undefined {
    return this.padMap.get(`pad-${padIndex}`);
  }

  async loadArrayBufferToPad(
    padIndex: number,
    arrayBuffer: ArrayBuffer,
    name: string,
    startOffsetSec?: number,
    durationSec?: number
  ) {
    const audioBuffer = await this.audioContext.decodeAudioData(
      arrayBuffer.slice(0)
    );
    const sample: LoadedSample = {
      id: `pad-${padIndex}`,
      name,
      arrayBuffer,
      audioBuffer,
      pitchSemitones: 0,
      attack: 0.005,
      decay: 0.05,
      sustain: 0.8,
      release: 0.08,
      startOffsetSec,
      durationSec,
      warp: false,
      quantize: true,
      loop: false,
      hold: false,
      eq: createDefaultEQSettings(),
      effectsChain: createDefaultEffectsChain(),
    };
    this.padMap.set(sample.id, sample);
    return sample;
  }

  assignSliceToPad(
    padIndex: number,
    name: string,
    audioBuffer: AudioBuffer,
    arrayBuffer: ArrayBuffer,
    startOffsetSec: number,
    durationSec: number
  ) {
    const sample: LoadedSample = {
      id: `pad-${padIndex}`,
      name,
      arrayBuffer,
      audioBuffer,
      pitchSemitones: 0,
      attack: 0.005,
      decay: 0.05,
      sustain: 0.8,
      release: 0.08,
      startOffsetSec,
      durationSec,
      warp: false,
      quantize: true,
      loop: false,
      hold: false,
      eq: createDefaultEQSettings(),
      effectsChain: createDefaultEffectsChain(),
    };
    this.padMap.set(sample.id, sample);
    return sample;
  }

  setPadAdsr(
    padIndex: number,
    {
      attack,
      decay,
      sustain,
      release,
    }: { attack?: number; decay?: number; sustain?: number; release?: number }
  ) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s) return;
    if (attack !== undefined) s.attack = attack;
    if (decay !== undefined) s.decay = decay;
    if (sustain !== undefined) s.sustain = sustain;
    if (release !== undefined) s.release = release;

    // Adjust envelope in real-time for currently playing sound
    const p = this.playingPerPad.get(`pad-${padIndex}`);
    if (p) {
      const { gain, startTime } = p;
      const now = this.audioContext.currentTime;
      const elapsed = now - startTime;
      const a = s.attack ?? 0.005;
      const d = s.decay ?? 0.05;
      const su = s.sustain ?? 0.8;

      gain.gain.cancelScheduledValues(now);

      if (elapsed < a) {
        gain.gain.linearRampToValueAtTime(1, startTime + a);
        gain.gain.linearRampToValueAtTime(su, startTime + a + d);
      } else if (elapsed < a + d) {
        gain.gain.linearRampToValueAtTime(su, startTime + a + d);
      } else {
        gain.gain.setValueAtTime(su, now);
      }
    }
  }

  setPadPitch(padIndex: number, semitones: number) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s) return;
    s.pitchSemitones = semitones;
  }

  setPadEffectsChain(padIndex: number, effectsChain: EffectsChain) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s) return;
    s.effectsChain = effectsChain;
  }

  updatePadEffectSlot(padIndex: number, slotIndex: number, effect: EffectSlot) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s || slotIndex < 0 || slotIndex > 5) return;
    // Create new array to trigger React re-render
    const newChain = [...s.effectsChain] as EffectsChain;
    newChain[slotIndex] = effect;
    s.effectsChain = newChain;
  }

  setPadEQ(padIndex: number, eq: EQSettings) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s) return;
    s.eq = eq;
  }

  updatePadEQBand(
    padIndex: number,
    bandIndex: number,
    band: import("./eq").EQBand
  ) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s || bandIndex < 0 || bandIndex > 5) return;
    // Create new array to trigger React re-render
    const newEQ = [...s.eq] as EQSettings;
    newEQ[bandIndex] = band;
    s.eq = newEQ;
  }
}
