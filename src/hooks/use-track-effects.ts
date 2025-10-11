"use client";

import type { Effect } from "@/lib/effects";
import { TrackManager } from "@/lib/track-manager";
import { useEffect, useState } from "react";

export function useTrackEffects(trackId: string) {
  const [trackManager] = useState(() => TrackManager.getInstance());
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    const effectsChain = trackManager.getTrackEffects(trackId);
    if (!effectsChain) return;

    setEffects(effectsChain.getEffects());

    const unsubscribe = effectsChain.subscribe(() => {
      setEffects(effectsChain.getEffects());
    });

    return () => {
      unsubscribe();
    };
  }, [trackManager, trackId]);

  const effectsChain = trackManager.getTrackEffects(trackId);

  return {
    effects,
    addEffect: (
      type: Parameters<NonNullable<typeof effectsChain>["addEffect"]>[0]
    ) => effectsChain?.addEffect(type),
    removeEffect: (effectId: string) => effectsChain?.removeEffect(effectId),
    updateEffect: (
      effectId: string,
      params: Parameters<NonNullable<typeof effectsChain>["updateEffect"]>[1]
    ) => effectsChain?.updateEffect(effectId, params),
  };
}
