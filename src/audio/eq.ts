export type EQBand = {
  enabled: boolean;
  frequency: number; // Hz
  gain: number; // dB (-12 to +12)
  q: number; // Quality factor (0.1 to 10)
  type: BiquadFilterType;
};

export type EQSettings = [EQBand, EQBand, EQBand];

export function createDefaultEQBand(frequency: number): EQBand {
  return {
    enabled: false,
    frequency,
    gain: 0,
    q: 1,
    type: "peaking",
  };
}

export function createDefaultEQSettings(): EQSettings {
  return [
    createDefaultEQBand(100), // Low
    createDefaultEQBand(1000), // Mid
    createDefaultEQBand(8000), // High
  ];
}
