"use client";

import type { Track } from "@/lib/audio-engine";
import { TrackManager } from "@/lib/track-manager";
import { useEffect, useState } from "react";

export function useTracks() {
  const [trackManager] = useState(() => TrackManager.getInstance());
  const [tracks, setTracks] = useState<Track[]>(() => trackManager.getTracks());

  useEffect(() => {
    const unsubscribe = trackManager.subscribe(() => {
      setTracks(trackManager.getTracks());
    });

    return () => {
      unsubscribe();
    };
  }, [trackManager]);

  return {
    tracks,
    updateTrack: (id: string, updates: Partial<Track>) =>
      trackManager.updateTrack(id, updates),
    toggleMute: (id: string) => trackManager.toggleMute(id),
    toggleSolo: (id: string) => trackManager.toggleSolo(id),
    toggleArm: (id: string) => trackManager.toggleArm(id),
  };
}
