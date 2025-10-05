export type EffectType =
  | "none"
  | "reverb"
  | "delay"
  | "distortion"
  | "saturation"
  | "phaser"
  | "chorus"
  | "compressor"
  | "limiter"
  | "arpeggiator";

export type DelayTime =
  | "quarter"
  | "half"
  | "8th"
  | "16th"
  | "32nd"
  | "triplet";

export type ArpeggiatorPattern =
  | "up"
  | "down"
  | "up-down"
  | "down-up"
  | "random"
  | "order";

export type ArpeggiatorRate = "1/1" | "1/2" | "1/4" | "1/8" | "1/16" | "1/32";

export type EffectSlot = {
  type: EffectType;
  enabled: boolean;
  // Common parameters
  dryWet?: number;
  // Reverb parameters
  reverbSize?: number;
  reverbDecay?: number;
  // Delay parameters
  delayTime?: DelayTime;
  delayFeedback?: number;
  delayLeft?: number;
  delayRight?: number;
  delayPingPong?: boolean;
  // Distortion/Saturation parameters
  distortionAmount?: number;
  distortionTone?: number;
  // Phaser parameters
  phaserRate?: number;
  phaserDepth?: number;
  phaserStages?: number;
  // Chorus parameters
  chorusRate?: number;
  chorusDepth?: number;
  chorusDelay?: number;
  // Compressor parameters
  compressorThreshold?: number;
  compressorRatio?: number;
  compressorAttack?: number;
  compressorRelease?: number;
  compressorKnee?: number;
  // Limiter parameters
  limiterThreshold?: number;
  limiterRelease?: number;
  limiterLookahead?: number;
  // Arpeggiator parameters
  arpeggiatorRate?: ArpeggiatorRate;
  arpeggiatorPattern?: ArpeggiatorPattern;
  arpeggiatorGate?: number;
  arpeggiatorOctaveRange?: number;
};

export type EffectsChain = [
  EffectSlot,
  EffectSlot,
  EffectSlot,
  EffectSlot,
  EffectSlot,
  EffectSlot
];

export function createEmptyEffectSlot(): EffectSlot {
  return {
    type: "none",
    enabled: false,
    dryWet: 0.5,
  };
}

export function createDefaultEffectsChain(): EffectsChain {
  return [
    createEmptyEffectSlot(),
    createEmptyEffectSlot(),
    createEmptyEffectSlot(),
    createEmptyEffectSlot(),
    createEmptyEffectSlot(),
    createEmptyEffectSlot(),
  ];
}

export function getDefaultParamsForEffect(
  type: EffectType
): Partial<EffectSlot> {
  switch (type) {
    case "reverb":
      return {
        dryWet: 0.3,
        reverbSize: 2,
        reverbDecay: 0.5,
      };
    case "delay":
      return {
        dryWet: 0.3,
        delayTime: "16th",
        delayFeedback: 0.4,
        delayLeft: 0.5,
        delayRight: 0.5,
        delayPingPong: false,
      };
    case "distortion":
      return {
        dryWet: 0.5,
        distortionAmount: 0.5,
        distortionTone: 0.5,
      };
    case "saturation":
      return {
        dryWet: 0.5,
        distortionAmount: 0.3,
        distortionTone: 0.5,
      };
    case "phaser":
      return {
        dryWet: 0.5,
        phaserRate: 0.5,
        phaserDepth: 0.5,
        phaserStages: 4,
      };
    case "chorus":
      return {
        dryWet: 0.5,
        chorusRate: 0.5,
        chorusDepth: 0.5,
        chorusDelay: 0.02,
      };
    case "compressor":
      return {
        dryWet: 1.0,
        compressorThreshold: -24,
        compressorRatio: 4,
        compressorAttack: 0.003,
        compressorRelease: 0.25,
        compressorKnee: 30,
      };
    case "limiter":
      return {
        dryWet: 1.0,
        limiterThreshold: -3,
        limiterRelease: 0.01,
        limiterLookahead: 0.005,
      };
    case "arpeggiator":
      return {
        dryWet: 1.0,
        arpeggiatorRate: "1/16",
        arpeggiatorPattern: "up",
        arpeggiatorGate: 0.8,
        arpeggiatorOctaveRange: 1,
      };
    default:
      return { dryWet: 0.5 };
  }
}
