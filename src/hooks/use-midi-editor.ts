"use client";

import type { Clip, MidiNote } from "@/lib/audio-engine";
import { MidiEditor } from "@/lib/midi-editor";
import { useEffect, useState } from "react";

export function useMidiEditor() {
  const [midiEditor] = useState(() => MidiEditor.getInstance());
  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const unsubscribe = midiEditor.subscribe(() => {
      setUpdateTrigger((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [midiEditor]);

  return {
    addNote: (
      clip: Clip,
      pitch: number,
      startTime: number,
      duration: number,
      velocity?: number
    ) => midiEditor.addNote(clip, pitch, startTime, duration, velocity),
    removeNote: (clip: Clip, noteId: string) =>
      midiEditor.removeNote(clip, noteId),
    updateNote: (clip: Clip, noteId: string, updates: Partial<MidiNote>) =>
      midiEditor.updateNote(clip, noteId, updates),
    moveNote: (clip: Clip, noteId: string, pitch: number, startTime: number) =>
      midiEditor.moveNote(clip, noteId, pitch, startTime),
    resizeNote: (clip: Clip, noteId: string, duration: number) =>
      midiEditor.resizeNote(clip, noteId, duration),
    getNoteNameFromPitch: (pitch: number) =>
      midiEditor.getNoteNameFromPitch(pitch),
  };
}
