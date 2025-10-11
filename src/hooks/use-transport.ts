"use client";

import { Transport } from "@/lib/transport";
import { useEffect, useState } from "react";

export function useTransport() {
  const [transport] = useState(() => Transport.getInstance());
  const [state, setState] = useState(() => transport.getState());

  useEffect(() => {
    const unsubscribe = transport.subscribe(() => {
      setState(transport.getState());
    });

    return () => {
      unsubscribe();
    };
  }, [transport]);

  return {
    transport: state,
    play: () => transport.play(),
    pause: () => transport.pause(),
    stop: () => transport.stop(),
    togglePlay: () => transport.togglePlay(),
    toggleRecord: () => transport.toggleRecord(),
    setTempo: (tempo: number) => transport.setTempo(tempo),
    toggleMetronome: () => transport.toggleMetronome(),
    setPosition: (bar: number, beat: number) =>
      transport.setPosition(bar, beat),
    // Expose transport properties directly
    currentTime: state.currentTime,
    tempo: state.tempo,
    isPlaying: state.isPlaying,
    isRecording: state.isRecording,
    metronomeEnabled: state.metronomeEnabled,
  };
}
