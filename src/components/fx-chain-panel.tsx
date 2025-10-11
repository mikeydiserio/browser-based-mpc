"use client"

import styled from "styled-components"
import { useState } from "react"
import type { EffectType } from "@/lib/effects"

const PanelContainer = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 16px;
  height: 100%;
`

const PanelTitle = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
  text-transform: uppercase;
`

const SlotsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

const SlotWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SlotLabel = styled.div`
  font-size: 10px;
  color: #00d9ff;
  font-weight: 600;
`

const SlotSelect = styled.select`
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 11px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    border-color: #00d9ff;
  }

  &:focus {
    border-color: #00d9ff;
  }

  option {
    background: #1a1a1a;
    color: #e0e0e0;
  }
`

interface FXChainPanelProps {
  slots?: number
}

export function FXChainPanel({ slots = 6 }: FXChainPanelProps) {
  const [selectedEffects, setSelectedEffects] = useState<(EffectType | "none")[]>(Array(slots).fill("none"))

  const effectOptions: Array<{ value: EffectType | "none"; label: string }> = [
    { value: "none", label: "None" },
    { value: "reverb", label: "Reverb" },
    { value: "delay", label: "Delay" },
    { value: "distortion", label: "Distortion" },
    { value: "filter", label: "Filter" },
    { value: "compressor", label: "Compressor" },
  ]

  const handleEffectChange = (slotIndex: number, effect: EffectType | "none") => {
    const newEffects = [...selectedEffects]
    newEffects[slotIndex] = effect
    setSelectedEffects(newEffects)
  }

  return (
    <PanelContainer>
      <PanelTitle>FX Chain ({slots} Slots)</PanelTitle>
      <SlotsContainer>
        {Array.from({ length: slots }).map((_, index) => (
          <SlotWrapper key={index}>
            <SlotLabel>{index + 1}</SlotLabel>
            <SlotSelect
              value={selectedEffects[index]}
              onChange={(e) => handleEffectChange(index, e.target.value as EffectType | "none")}
            >
              {effectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SlotSelect>
          </SlotWrapper>
        ))}
      </SlotsContainer>
    </PanelContainer>
  )
}
