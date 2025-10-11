import type { MidiNote, Clip } from "./audio-engine"

export class MidiEditor {
  private static instance: MidiEditor
  private listeners: Set<() => void> = new Set()

  private constructor() {}

  static getInstance(): MidiEditor {
    if (!MidiEditor.instance) {
      MidiEditor.instance = new MidiEditor()
    }
    return MidiEditor.instance
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    this.listeners.forEach((cb) => cb())
  }

  addNote(clip: Clip, pitch: number, startTime: number, duration: number, velocity = 100): MidiNote {
    if (!clip.midiNotes) {
      clip.midiNotes = []
    }

    const note: MidiNote = {
      id: `note-${Date.now()}-${Math.random()}`,
      pitch,
      velocity,
      startTime,
      duration,
    }

    clip.midiNotes.push(note)
    this.notify()

    return note
  }

  removeNote(clip: Clip, noteId: string) {
    if (!clip.midiNotes) return

    clip.midiNotes = clip.midiNotes.filter((n) => n.id !== noteId)
    this.notify()
  }

  updateNote(clip: Clip, noteId: string, updates: Partial<MidiNote>) {
    if (!clip.midiNotes) return

    const note = clip.midiNotes.find((n) => n.id === noteId)
    if (!note) return

    Object.assign(note, updates)
    this.notify()
  }

  moveNote(clip: Clip, noteId: string, newPitch: number, newStartTime: number) {
    this.updateNote(clip, noteId, {
      pitch: Math.max(0, Math.min(127, newPitch)),
      startTime: Math.max(0, newStartTime),
    })
  }

  resizeNote(clip: Clip, noteId: string, newDuration: number) {
    this.updateNote(clip, noteId, {
      duration: Math.max(0.125, newDuration),
    })
  }

  getNoteNameFromPitch(pitch: number): string {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const octave = Math.floor(pitch / 12) - 1
    const noteName = noteNames[pitch % 12]
    return `${noteName}${octave}`
  }
}
