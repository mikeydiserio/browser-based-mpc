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
    amp.connect(this.audioContext.destination);
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
  }

  setPadPitch(padIndex: number, semitones: number) {
    const s = this.padMap.get(`pad-${padIndex}`);
    if (!s) return;
    s.pitchSemitones = semitones;
  }
}
