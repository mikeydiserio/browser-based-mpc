import type { Clip } from "./audio-engine";
import { AudioEngine } from "./audio-engine";
import { Transport } from "./transport";

export class ClipPlayer {
  private static instance: ClipPlayer;
  private audioEngine: AudioEngine;
  private transport: Transport;
  private playingClips: Map<string, AudioBufferSourceNode> = new Map();
  private scheduledClips: Map<string, number> = new Map();
  private isBrowser = typeof window !== "undefined";

  private constructor() {
    this.audioEngine = AudioEngine.getInstance();
    this.transport = Transport.getInstance();
  }

  static getInstance(): ClipPlayer {
    if (!ClipPlayer.instance) {
      ClipPlayer.instance = new ClipPlayer();
    }
    return ClipPlayer.instance;
  }

  async playClip(clip: Clip, trackGain: GainNode) {
    if (!this.isBrowser) return;

    // Stop if already playing
    if (this.playingClips.has(clip.id)) {
      this.stopClip(clip.id);
      return;
    }

    if (clip.audioBuffer) {
      await this.playAudioClip(clip, trackGain);
    } else if (clip.midiNotes) {
      this.playMidiClip(clip, trackGain);
    }
  }

  private async playAudioClip(clip: Clip, trackGain: GainNode) {
    if (!clip.audioBuffer || !this.isBrowser) return;

    const source = this.audioEngine.context.createBufferSource();
    source.buffer = clip.audioBuffer;

    // Enable looping if specified (default to true for session view)
    source.loop = clip.loop !== undefined ? clip.loop : true;
    source.connect(trackGain);

    let startTime = this.audioEngine.getCurrentTime();

    // Quantize playback if enabled
    if (clip.quantize && clip.quantizeValue) {
      const transportState = this.transport.getState();
      const secondsPerBeat = 60 / transportState.tempo;
      const quantizeSeconds = clip.quantizeValue * secondsPerBeat;

      // Calculate the next quantized time
      const currentTime = this.audioEngine.getCurrentTime();
      const timeIntoQuantize = currentTime % quantizeSeconds;
      const nextQuantizedTime =
        currentTime + (quantizeSeconds - timeIntoQuantize);

      startTime = nextQuantizedTime;
    }

    source.start(startTime);

    this.playingClips.set(clip.id, source);

    source.onended = () => {
      this.playingClips.delete(clip.id);
    };
  }

  private playMidiClip(clip: Clip, _trackGain: GainNode) {
    // MIDI playback will be implemented with the synthesizer
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.log("MIDI clip playback:", clip.id);
  }

  stopClip(clipId: string) {
    const source = this.playingClips.get(clipId);
    if (source) {
      source.stop();
      this.playingClips.delete(clipId);
    }

    const scheduled = this.scheduledClips.get(clipId);
    if (scheduled) {
      clearTimeout(scheduled);
      this.scheduledClips.delete(clipId);
    }
  }

  isPlaying(clipId: string): boolean {
    return this.playingClips.has(clipId);
  }

  stopAllClips() {
    this.playingClips.forEach((source) => source.stop());
    this.playingClips.clear();
    this.scheduledClips.forEach((id) => clearTimeout(id));
    this.scheduledClips.clear();
  }
}
