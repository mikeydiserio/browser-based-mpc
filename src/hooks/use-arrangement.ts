"use client";

import {
  ArrangementManager,
  type ArrangementClip,
} from "@/lib/arrangement-manager";
import { useEffect, useState } from "react";

export function useArrangement() {
  const [arrangementManager] = useState(() => ArrangementManager.getInstance());
  const [clips, setClips] = useState<ArrangementClip[]>(() =>
    arrangementManager.getArrangementClips()
  );

  useEffect(() => {
    const unsubscribe = arrangementManager.subscribe(() => {
      setClips(arrangementManager.getArrangementClips());
    });

    return () => {
      unsubscribe();
    };
  }, [arrangementManager]);

  return {
    clips,
    addClip: (trackId: string, position: number, duration: number) =>
      arrangementManager.addClipToArrangement(trackId, position, duration),
    moveClip: (clipId: string, position: number) =>
      arrangementManager.moveClip(clipId, position),
    resizeClip: (clipId: string, duration: number) =>
      arrangementManager.resizeClip(clipId, duration),
    deleteClip: (clipId: string) => arrangementManager.deleteClip(clipId),
    updateClip: (clipId: string, updates: Partial<ArrangementClip>) =>
      arrangementManager.updateClip(clipId, updates),
    getClipsForTrack: (trackId: string) =>
      arrangementManager.getClipsForTrack(trackId),
  };
}
