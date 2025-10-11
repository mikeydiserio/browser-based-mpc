import type { Clip } from "./audio-engine"
import { TrackManager } from "./track-manager"

export interface ArrangementClip extends Clip {
  position: number // position in beats on the timeline
}

export class ArrangementManager {
  private static instance: ArrangementManager
  private arrangementClips: ArrangementClip[] = []
  private trackManager: TrackManager
  private listeners: Set<() => void> = new Set()

  private constructor() {
    this.trackManager = TrackManager.getInstance()
  }

  static getInstance(): ArrangementManager {
    if (!ArrangementManager.instance) {
      ArrangementManager.instance = new ArrangementManager()
    }
    return ArrangementManager.instance
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((cb) => cb())
  }

  getArrangementClips(): ArrangementClip[] {
    return [...this.arrangementClips]
  }

  getClipsForTrack(trackId: string): ArrangementClip[] {
    return this.arrangementClips.filter((c) => c.trackId === trackId)
  }

  addClipToArrangement(trackId: string, position: number, duration: number): ArrangementClip {
    const track = this.trackManager.getTrack(trackId)
    if (!track) throw new Error("Track not found")

    const clip: ArrangementClip = {
      id: `arr-clip-${Date.now()}-${Math.random()}`,
      name: `${track.name} Clip`,
      trackId,
      startTime: 0,
      duration,
      position,
      color: track.color,
    }

    if (track.type === "midi") {
      clip.midiNotes = []
    }

    this.arrangementClips.push(clip)
    this.notify()

    return clip
  }

  moveClip(clipId: string, newPosition: number) {
    const clip = this.arrangementClips.find((c) => c.id === clipId)
    if (!clip) return

    clip.position = Math.max(0, newPosition)
    this.notify()
  }

  resizeClip(clipId: string, newDuration: number) {
    const clip = this.arrangementClips.find((c) => c.id === clipId)
    if (!clip) return

    clip.duration = Math.max(0.25, newDuration)
    this.notify()
  }

  deleteClip(clipId: string) {
    this.arrangementClips = this.arrangementClips.filter((c) => c.id !== clipId)
    this.notify()
  }

  updateClip(clipId: string, updates: Partial<ArrangementClip>) {
    const clip = this.arrangementClips.find((c) => c.id === clipId)
    if (!clip) return

    Object.assign(clip, updates)
    this.notify()
  }
}
