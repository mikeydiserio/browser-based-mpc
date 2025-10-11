"use client";

import type { Clip } from "@/lib/audio-engine";
import { PatternManager } from "@/lib/pattern-manager";
import { useEffect, useState } from "react";

// Define Pattern type locally since it's not exported from audio-engine
interface Pattern {
  id: string;
  name: string;
  clips: Clip[];
}

export function usePatterns() {
  const [patternManager] = useState(() => PatternManager.getInstance());
  const [patterns, setPatterns] = useState<Pattern[]>(() =>
    patternManager.getPatterns()
  );

  useEffect(() => {
    const unsubscribe = patternManager.subscribe(() => {
      setPatterns(patternManager.getPatterns());
    });

    return () => {
      unsubscribe();
    };
  }, [patternManager]);

  return {
    patterns,
    createClip: (trackId: string, patternId: string, name: string) =>
      patternManager.createClip(trackId, patternId, name),
    deleteClip: (clipId: string) => patternManager.deleteClip(clipId),
    updateClip: (clipId: string, updates: Partial<Clip>) =>
      patternManager.updateClip(clipId, updates),
    getClipForTrackInPattern: (trackId: string, patternId: string) =>
      patternManager.getClipForTrackInPattern(trackId, patternId),
  };
}
