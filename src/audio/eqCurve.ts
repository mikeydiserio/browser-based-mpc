import type { EQBand, EQSettings } from "./eq";

/**
 * Calculate the frequency response of a biquad filter at a given frequency
 */
function calculateBiquadResponse(
  freq: number,
  sampleRate: number,
  band: EQBand
): number {
  if (!band.enabled || band.gain === 0) return 1;

  const f0 = band.frequency;
  const gain = band.gain;
  const Q = band.q;

  // Convert to normalized frequency
  const w0 = (2 * Math.PI * f0) / sampleRate;
  const w = (2 * Math.PI * freq) / sampleRate;

  // Calculate peaking EQ response (simplified)
  const A = Math.pow(10, gain / 40); // amplitude
  const alpha = Math.sin(w0) / (2 * Q);

  // Peaking filter coefficients (simplified approximation)
  const b0 = 1 + alpha * A;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a2 = 1 - alpha / A;

  // Calculate magnitude response at frequency w
  const phi = Math.sin(w / 2);
  const b_mag_sq = b0 * b0 + 4 * b0 * b2 * phi * phi + b2 * b2;
  const a_mag_sq = a0 * a0 + 4 * a0 * a2 * phi * phi + a2 * a2;

  const magnitude = Math.sqrt(b_mag_sq / a_mag_sq);

  return magnitude;
}

/**
 * Calculate the combined EQ curve response across all bands
 * Returns gain values in dB for each frequency point
 */
export function calculateEQCurve(
  eqSettings: EQSettings,
  numPoints: number = 200,
  sampleRate: number = 44100
): { frequencies: number[]; gains: number[] } {
  const frequencies: number[] = [];
  const gains: number[] = [];

  // Generate logarithmic frequency scale from 20Hz to 20kHz
  const minFreq = Math.log10(20);
  const maxFreq = Math.log10(20000);

  for (let i = 0; i < numPoints; i++) {
    const logFreq = minFreq + (i / (numPoints - 1)) * (maxFreq - minFreq);
    const freq = Math.pow(10, logFreq);
    frequencies.push(freq);

    // Calculate combined response from all bands
    let totalMagnitude = 1;
    for (const band of eqSettings) {
      const magnitude = calculateBiquadResponse(freq, sampleRate, band);
      totalMagnitude *= magnitude;
    }

    // Convert to dB
    const gainDb = 20 * Math.log10(totalMagnitude);
    gains.push(gainDb);
  }

  return { frequencies, gains };
}

/**
 * Map frequency to canvas X position (logarithmic scale)
 */
export function freqToX(freq: number, width: number): number {
  const minFreq = Math.log10(20);
  const maxFreq = Math.log10(20000);
  const logFreq = Math.log10(freq);
  return ((logFreq - minFreq) / (maxFreq - minFreq)) * width;
}

/**
 * Map gain (dB) to canvas Y position
 */
export function gainToY(
  gainDb: number,
  height: number,
  maxDb: number = 12
): number {
  // Center is 0dB, top is +maxDb, bottom is -maxDb
  const center = height / 2;
  const scale = height / 2 / maxDb;
  return center - gainDb * scale;
}
