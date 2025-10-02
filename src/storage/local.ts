const SAMPLES_KEY = "mpc.samples.v1";
const PATTERNS_KEY = "mpc.patterns.v1";
const BPM_KEY = "mpc.bpm.v1";
const SWING_KEY = "mpc.swing.v1";
const TIMELINE_KEY = "mpc.timeline.v1";
const METRONOME_KEY = "mpc.metronome.v1";

export type PersistedSample = {
  id: string;
  name: string;
  arrayBufferBase64: string;
  pitchSemitones: number;
  attack?: number; // seconds
  decay?: number; // seconds
  sustain?: number; // 0..1
  release?: number; // seconds
  warp: boolean;
  quantize: boolean;
  loop: boolean;
  hold: boolean;
};

export type PersistedPattern = {
  id: number;
  matrix: boolean[][];
};

export function saveSamples(samples: PersistedSample[]) {
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
}

export function loadSamples(): PersistedSample[] {
  const raw = localStorage.getItem(SAMPLES_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Load/save samples per loadout set (1..5)
export function saveSamplesForSet(setId: number, samples: PersistedSample[]) {
  localStorage.setItem(`${SAMPLES_KEY}.set${setId}`, JSON.stringify(samples));
}

export function loadSamplesForSet(setId: number): PersistedSample[] {
  const raw = localStorage.getItem(`${SAMPLES_KEY}.set${setId}`);
  return raw ? JSON.parse(raw) : [];
}

export function savePatterns(patterns: PersistedPattern[]) {
  localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns));
}

export function loadPatterns(): PersistedPattern[] {
  const raw = localStorage.getItem(PATTERNS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePatternByIndex(index: number, matrix: boolean[][]) {
  const all = loadPatterns().filter((p) => p.id !== index);
  all.push({ id: index, matrix });
  savePatterns(all);
}

export function loadPatternByIndex(
  index: number,
  fallback: boolean[][]
): boolean[][] {
  const all = loadPatterns();
  const found = all.find((p) => p.id === index);
  return found ? found.matrix : fallback;
}

export function saveBpm(bpm: number) {
  localStorage.setItem(BPM_KEY, String(bpm));
}
export function loadBpm(defaultBpm = 120): number {
  const raw = localStorage.getItem(BPM_KEY);
  return raw ? Number(raw) : defaultBpm;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

export function saveMetronomeEnabled(enabled: boolean) {
  localStorage.setItem(METRONOME_KEY, enabled ? "1" : "0");
}

export function loadMetronomeEnabled(defaultOn = true): boolean {
  const raw = localStorage.getItem(METRONOME_KEY);
  return raw == null ? defaultOn : raw === "1";
}

export function saveSwing(amount: number) {
  localStorage.setItem(SWING_KEY, String(amount));
}

export function loadSwing(defaultAmount = 0): number {
  const raw = localStorage.getItem(SWING_KEY);
  return raw ? Number(raw) : defaultAmount;
}

// Timeline persistence
export type TimelineClip = {
  startBar: number;
  lengthBars: number;
  label: string;
  patternIndex: number;
};
export type TimelineTrack = { name: string; clips: TimelineClip[] };

export function saveTimeline(tracks: TimelineTrack[]) {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(tracks));
}

export function loadTimeline(): TimelineTrack[] {
  const raw = localStorage.getItem(TIMELINE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Kit names (1-8)
const KIT_NAME_KEY = "mpc.kit.name.v1";

export function saveKitName(kitIndex: number, name: string) {
  localStorage.setItem(`${KIT_NAME_KEY}.${kitIndex}`, name);
}

export function loadKitName(kitIndex: number): string {
  return (
    localStorage.getItem(`${KIT_NAME_KEY}.${kitIndex}`) ?? `Kit ${kitIndex}`
  );
}

export function loadAllKitNames(): string[] {
  return Array.from({ length: 8 }, (_, i) => loadKitName(i + 1));
}
