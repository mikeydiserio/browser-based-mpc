"use client"

import styled from "styled-components"
import { useState } from "react"
import { useTrackEffects } from "@/hooks/use-track-effects"
import type { EffectType } from "@/lib/effects"
import { Plus, X, Power } from "lucide-react"

const PanelContainer = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #1a1a1a;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transform: translateX(100%);
  transition: transform 0.3s;

  &.open {
    transform: translateX(0);
  }
`

const PanelHeader = styled.div`
  padding: 16px;
  background: #0a0a0a;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #00d9ff;
  margin: 0;
`

const CloseButton = styled.button`
  padding: 6px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: #2a2a2a;
    border-color: #00d9ff;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const EffectsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const EffectCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
`

const EffectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const EffectName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: capitalize;
`

const EffectControls = styled.div`
  display: flex;
  gap: 4px;
`

const EffectButton = styled.button<{ $active?: boolean }>`
  padding: 4px;
  background: ${(props) => (props.$active ? "#00d9ff" : "transparent")};
  border: 1px solid ${(props) => (props.$active ? "#00d9ff" : "#333")};
  border-radius: 3px;
  color: ${(props) => (props.$active ? "#0a0a0a" : "#888")};
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    background: ${(props) => (props.$active ? "#00eaff" : "#2a2a2a")};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`

const ParamControl = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

const ParamLabel = styled.label`
  display: block;
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
  text-transform: capitalize;
`

const ParamSlider = styled.input`
  width: 100%;
  height: 4px;
  background: #333;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #00d9ff;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #00d9ff;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
`

const AddEffectButton = styled.button`
  padding: 12px;
  background: #0a0a0a;
  border: 1px dashed #333;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
    border-color: #00d9ff;
    color: #00d9ff;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const EffectTypeMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`

const EffectTypeButton = styled.button`
  padding: 8px 12px;
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 11px;
  text-align: left;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
    border-color: #00d9ff;
  }
`

interface EffectsPanelProps {
  trackId: string
  isOpen: boolean
  onClose: () => void
}

export function EffectsPanel({ trackId, isOpen, onClose }: EffectsPanelProps) {
  const { effects, addEffect, removeEffect, updateEffect } = useTrackEffects(trackId)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const effectTypes: EffectType[] = ["reverb", "delay", "distortion", "filter", "compressor"]

  const handleAddEffect = (type: EffectType) => {
    addEffect(type)
    setShowAddMenu(false)
  }

  const getParamRange = (effectType: string, paramName: string) => {
    const ranges: Record<string, Record<string, { min: number; max: number; step: number }>> = {
      reverb: {
        decay: { min: 0.1, max: 5, step: 0.1 },
        mix: { min: 0, max: 1, step: 0.01 },
      },
      delay: {
        time: { min: 0.01, max: 2, step: 0.01 },
        feedback: { min: 0, max: 0.9, step: 0.01 },
        mix: { min: 0, max: 1, step: 0.01 },
      },
      distortion: {
        amount: { min: 0, max: 100, step: 1 },
        mix: { min: 0, max: 1, step: 0.01 },
      },
      filter: {
        frequency: { min: 20, max: 20000, step: 10 },
        q: { min: 0.1, max: 20, step: 0.1 },
      },
      compressor: {
        threshold: { min: -60, max: 0, step: 1 },
        ratio: { min: 1, max: 20, step: 0.5 },
        attack: { min: 0, max: 1, step: 0.001 },
        release: { min: 0, max: 1, step: 0.01 },
      },
    }

    return ranges[effectType]?.[paramName] || { min: 0, max: 1, step: 0.01 }
  }

  return (
    <PanelContainer className={isOpen ? "open" : ""}>
      <PanelHeader>
        <Title>Effects Chain</Title>
        <CloseButton onClick={onClose}>
          <X />
        </CloseButton>
      </PanelHeader>

      <EffectsList>
        {effects.map((effect) => (
          <EffectCard key={effect.id}>
            <EffectHeader>
              <EffectName>{effect.type}</EffectName>
              <EffectControls>
                <EffectButton
                  $active={effect.enabled}
                  onClick={() => updateEffect(effect.id, { enabled: !effect.enabled })}
                >
                  <Power />
                </EffectButton>
                <EffectButton onClick={() => removeEffect(effect.id)}>
                  <X />
                </EffectButton>
              </EffectControls>
            </EffectHeader>

            {Object.entries(effect.params).map(([paramName, value]) => {
              const range = getParamRange(effect.type, paramName)
              return (
                <ParamControl key={paramName}>
                  <ParamLabel>
                    {paramName}: {typeof value === "number" ? value.toFixed(2) : value}
                  </ParamLabel>
                  <ParamSlider
                    type="range"
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    value={value}
                    onChange={(e) =>
                      updateEffect(effect.id, {
                        params: { ...effect.params, [paramName]: Number.parseFloat(e.target.value) },
                      })
                    }
                  />
                </ParamControl>
              )
            })}
          </EffectCard>
        ))}

        {showAddMenu ? (
          <EffectTypeMenu>
            {effectTypes.map((type) => (
              <EffectTypeButton key={type} onClick={() => handleAddEffect(type)}>
                {type}
              </EffectTypeButton>
            ))}
          </EffectTypeMenu>
        ) : (
          <AddEffectButton onClick={() => setShowAddMenu(true)}>
            <Plus />
            Add Effect
          </AddEffectButton>
        )}
      </EffectsList>
    </PanelContainer>
  )
}
