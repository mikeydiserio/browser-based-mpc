"use client";

import { SamplePadManager, type SamplePad } from "@/lib/sample-pad-manager";
import { useEffect, useState } from "react";

let samplePadManager: SamplePadManager | null = null;

export function useSamplePads() {
  const [pads, setPads] = useState<SamplePad[]>([]);
  const [selectedPadId, setSelectedPadId] = useState<string | null>(null);

  useEffect(() => {
    if (!samplePadManager) {
      samplePadManager = new SamplePadManager();
    }

    const unsubscribe = samplePadManager.subscribe(() => {
      setPads(samplePadManager?.getAllPads() ?? []);
    });

    setPads(samplePadManager.getAllPads());

    return () => {
      unsubscribe();
    };
  }, []);

  const loadSample = async (file: File) => {
    if (!samplePadManager) return;
    const pad = await samplePadManager.loadSample(file);
    if (pad) setSelectedPadId(pad.id);
  };

  const updatePad = (id: string, updates: Partial<SamplePad>) => {
    if (!samplePadManager) return;
    samplePadManager.updatePad(id, updates);
  };

  const deletePad = (id: string) => {
    if (!samplePadManager) return;
    samplePadManager.deletePad(id);
    if (selectedPadId === id) {
      setSelectedPadId(null);
    }
  };

  const playSample = (
    padId: string,
    destination: AudioNode,
    velocity?: number
  ) => {
    if (!samplePadManager) return null;
    return samplePadManager.playSample(padId, destination, velocity);
  };

  const selectedPad = selectedPadId
    ? samplePadManager?.getPad(selectedPadId)
    : null;

  return {
    pads,
    selectedPad,
    selectedPadId,
    setSelectedPadId,
    loadSample,
    updatePad,
    deletePad,
    playSample,
  };
}
