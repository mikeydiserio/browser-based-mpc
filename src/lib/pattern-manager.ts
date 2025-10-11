import type { Clip } from "./audio-engine"
import { TrackManager } from "./track-manager"

export interface Pattern {
  id: string
  name: string
  clips: Clip[]
  length: number // in bars
}

export class PatternManager {
  private static instance: PatternManager
  private patterns: Pattern[] = []
  private trackManager: TrackManager
  private listeners: Set<() => void> = new Set()

  private constructor() {
    this.trackManager = TrackManager.getInstance()
    this.createDefaultPatterns()
  }

  static getInstance(): PatternManager {
    if (!PatternManager.instance) {
      PatternManager.instance = new PatternManager()
    }
    return PatternManager.instance
  }

  private createDefaultPatterns() {
    // Create 8 empty patterns (scenes)
    for (let i = 0; i < 8; i++) {
      this.patterns.push({
        id: `pattern-${i}`,
        name: `Scene ${i + 1}`,
        clips: [],
        length: 4,
      })
    }
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((cb) => cb())
  }

  getPatterns(): Pattern[] {
    return [...this.patterns]
  }

  getPattern(id: string): Pattern | undefined {
    return this.patterns.find((p) => p.id === id)
  }

  createClip(trackId: string, patternId: string, name: string): Clip {
    const track = this.trackManager.getTrack(trackId)
    if (!track) throw new Error("Track not found")

    const clip: Clip = {
      id: `clip-${Date.now()}-${Math.random()}`,
      name,
      trackId,
      startTime: 0,
      duration: 4, // 4 bars default
      color: track.color,
    }

    // Initialize based on track type
    if (track.type === "midi") {
      clip.midiNotes = []
    } else if (track.type === "audio") {
      // Audio clips default to looping and quantized to 1 bar
      clip.loop = true
      clip.quantize = true
      clip.quantizeValue = 4 // 1 bar in 4/4 time (4 beats)
    }

    const pattern = this.patterns.find((p) => p.id === patternId)
    if (pattern) {
      pattern.clips.push(clip)
    }

    this.trackManager.addClip(trackId, clip)
    this.notify()

    return clip
  }

  deleteClip(clipId: string) {
    this.patterns.forEach((pattern) => {
      pattern.clips = pattern.clips.filter((c) => c.id !== clipId)
    })

    // Also remove from tracks
    const tracks = this.trackManager.getTracks()
    tracks.forEach((track) => {
      this.trackManager.removeClip(track.id, clipId)
    })

    this.notify()
  }

  updateClip(clipId: string, updates: Partial<Clip>) {
    this.patterns.forEach((pattern) => {
      const clip = pattern.clips.find((c) => c.id === clipId)
      if (clip) {
        Object.assign(clip, updates)
      }
    })

    this.notify()
  }

  getClipForTrackInPattern(trackId: string, patternId: string): Clip | undefined {
    const pattern = this.patterns.find((p) => p.id === patternId)
    if (!pattern) return undefined

    return pattern.clips.find((c) => c.trackId === trackId)
  }
}
