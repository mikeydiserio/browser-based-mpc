import { AudioEngine } from "./audio-engine";

export type EffectType =
  | "reverb"
  | "delay"
  | "distortion"
  | "filter"
  | "compressor";

export interface Effect {
  id: string;
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

export class EffectsChain {
  private audioEngine: AudioEngine;
  private effects: Effect[] = [];
  private effectNodes: Map<string, AudioNode[]> = new Map();
  private inputNode!: GainNode;
  private outputNode!: GainNode;
  private listeners: Set<() => void> = new Set();
  private isBrowser = typeof window !== "undefined";

  constructor() {
    this.audioEngine = AudioEngine.getInstance();
    if (this.isBrowser) {
      this.inputNode = this.audioEngine.context.createGain();
      this.outputNode = this.audioEngine.context.createGain();
      this.inputNode.connect(this.outputNode);
    }
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  getInputNode(): GainNode {
    return this.inputNode;
  }

  getOutputNode(): GainNode {
    return this.outputNode;
  }

  addEffect(type: EffectType): Effect {
    const effect: Effect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      type,
      enabled: true,
      params: this.getDefaultParams(type),
    };

    this.effects.push(effect);
    if (this.isBrowser) {
      this.createEffectNodes(effect);
      this.reconnectChain();
    }
    this.notify();

    return effect;
  }

  removeEffect(effectId: string) {
    this.effects = this.effects.filter((e) => e.id !== effectId);
    this.effectNodes.delete(effectId);
    if (this.isBrowser) {
      this.reconnectChain();
    }
    this.notify();
  }

  updateEffect(effectId: string, params: Partial<Effect>) {
    const effect = this.effects.find((e) => e.id === effectId);
    if (!effect) return;

    Object.assign(effect, params);

    if (params.params && this.isBrowser) {
      this.updateEffectParams(effect);
    }

    if (params.enabled !== undefined && this.isBrowser) {
      this.reconnectChain();
    }

    this.notify();
  }

  getEffects(): Effect[] {
    return [...this.effects];
  }

  private getDefaultParams(type: EffectType): Record<string, number> {
    switch (type) {
      case "reverb":
        return { decay: 2, mix: 0.3 };
      case "delay":
        return { time: 0.5, feedback: 0.3, mix: 0.3 };
      case "distortion":
        return { amount: 50, mix: 0.5 };
      case "filter":
        return { frequency: 1000, q: 1, type: 0 };
      case "compressor":
        return { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 };
      default:
        return {};
    }
  }

  private createEffectNodes(effect: Effect) {
    const nodes: AudioNode[] = [];

    switch (effect.type) {
      case "reverb":
        nodes.push(this.createReverbNode(effect));
        break;
      case "delay":
        nodes.push(...this.createDelayNodes(effect));
        break;
      case "distortion":
        nodes.push(this.createDistortionNode(effect));
        break;
      case "filter":
        nodes.push(this.createFilterNode(effect));
        break;
      case "compressor":
        nodes.push(this.createCompressorNode(effect));
        break;
    }

    this.effectNodes.set(effect.id, nodes);
  }

  private createReverbNode(effect: Effect): ConvolverNode {
    const convolver = this.audioEngine.context.createConvolver();
    const sampleRate = this.audioEngine.context.sampleRate;
    const length = sampleRate * effect.params.decay;
    const impulse = this.audioEngine.context.createBuffer(
      2,
      length,
      sampleRate
    );

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  private createDelayNodes(effect: Effect): AudioNode[] {
    const delay = this.audioEngine.context.createDelay(5);
    const feedback = this.audioEngine.context.createGain();

    delay.delayTime.value = effect.params.time;
    feedback.gain.value = effect.params.feedback;

    delay.connect(feedback);
    feedback.connect(delay);

    return [delay, feedback];
  }

  private createDistortionNode(effect: Effect): WaveShaperNode {
    const distortion = this.audioEngine.context.createWaveShaper();
    const amount = effect.params.amount;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] =
        ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    distortion.curve = curve;
    distortion.oversample = "4x";

    return distortion;
  }

  private createFilterNode(effect: Effect): BiquadFilterNode {
    const filter = this.audioEngine.context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = effect.params.frequency;
    filter.Q.value = effect.params.q;

    return filter;
  }

  private createCompressorNode(effect: Effect): DynamicsCompressorNode {
    const compressor = this.audioEngine.context.createDynamicsCompressor();
    compressor.threshold.value = effect.params.threshold;
    compressor.ratio.value = effect.params.ratio;
    compressor.attack.value = effect.params.attack;
    compressor.release.value = effect.params.release;

    return compressor;
  }

  private updateEffectParams(effect: Effect) {
    const nodes = this.effectNodes.get(effect.id);
    if (!nodes) return;

    switch (effect.type) {
      case "delay":
        if (nodes[0] instanceof DelayNode) {
          nodes[0].delayTime.value = effect.params.time;
        }
        if (nodes[1] instanceof GainNode) {
          nodes[1].gain.value = effect.params.feedback;
        }
        break;
      case "filter":
        if (nodes[0] instanceof BiquadFilterNode) {
          nodes[0].frequency.value = effect.params.frequency;
          nodes[0].Q.value = effect.params.q;
        }
        break;
      case "compressor":
        if (nodes[0] instanceof DynamicsCompressorNode) {
          nodes[0].threshold.value = effect.params.threshold;
          nodes[0].ratio.value = effect.params.ratio;
          nodes[0].attack.value = effect.params.attack;
          nodes[0].release.value = effect.params.release;
        }
        break;
    }
  }

  private reconnectChain() {
    // Disconnect everything
    this.inputNode.disconnect();
    this.effectNodes.forEach((nodes) => {
      nodes.forEach((node) => {
        try {
          node.disconnect();
        } catch {
          // Node might already be disconnected
        }
      });
    });

    // Reconnect in order
    let currentNode: AudioNode = this.inputNode;

    for (const effect of this.effects) {
      if (!effect.enabled) continue;

      const nodes = this.effectNodes.get(effect.id);
      if (!nodes || nodes.length === 0) continue;

      currentNode.connect(nodes[0]);
      currentNode = nodes[nodes.length - 1];
    }

    currentNode.connect(this.outputNode);
  }
}
