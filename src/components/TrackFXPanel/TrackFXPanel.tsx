import { useCallback } from 'react'
import type { EffectSlot, EffectType } from '../../audio/effects'
import { createDefaultEffectsChain, getDefaultParamsForEffect } from '../../audio/effects'
import { Knob } from '../Knob/Knob'
import * as S from './TrackFXPanel.styles'

interface TrackFXPanelProps {
  trackId: string
  trackName: string
  trackColor: string
  effectSlots?: [EffectSlot, EffectSlot, EffectSlot, EffectSlot, EffectSlot, EffectSlot]
  onUpdateEffect?: (slotIndex: number, effect: EffectSlot) => void
}

export function TrackFXPanel({
  trackName,
  trackColor,
  effectSlots,
  onUpdateEffect
}: TrackFXPanelProps) {
  // Use default chain if none provided (createDefaultEffectsChain returns an array)
  const slots = effectSlots ?? createDefaultEffectsChain()

  const handleTypeChange = useCallback((slotIndex: number, type: EffectType) => {
    const defaults = getDefaultParamsForEffect(type)
    const newEffect: EffectSlot = {
      ...slots[slotIndex],
      type,
      enabled: type !== 'none',
      ...defaults,
    }
    onUpdateEffect?.(slotIndex, newEffect)
  }, [slots, onUpdateEffect])

  const handleParamChange = useCallback((slotIndex: number, param: Partial<EffectSlot>) => {
    const newEffect: EffectSlot = {
      ...slots[slotIndex],
      ...param,
    }
    onUpdateEffect?.(slotIndex, newEffect)
  }, [slots, onUpdateEffect])

  const renderEffectControls = (effect: EffectSlot, slotIndex: number) => {
    if (!effect.enabled || effect.type === 'none') return null

    return (
      <S.EffectParams>
        <Knob
          label="Mix"
          min={0}
          max={1}
          step={0.01}
          value={effect.dryWet ?? 0.5}
          onChange={(v) => handleParamChange(slotIndex, { dryWet: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        {effect.type === 'reverb' && (
          <>
            <Knob
              label="Size"
              min={0.1}
              max={5}
              step={0.1}
              value={effect.reverbSize ?? 2}
              onChange={(v) => handleParamChange(slotIndex, { reverbSize: v })}
              format={(v) => v.toFixed(1)}
            />
            <Knob
              label="Decay"
              min={0}
              max={1}
              step={0.01}
              value={effect.reverbDecay ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { reverbDecay: v })}
              format={(v) => v.toFixed(2)}
            />
          </>
        )}
        {effect.type === 'delay' && (
          <>
            <Knob
              label="Feedback"
              min={0}
              max={0.9}
              step={0.01}
              value={effect.delayFeedback ?? 0.4}
              onChange={(v) => handleParamChange(slotIndex, { delayFeedback: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Knob
              label="Time"
              min={0}
              max={1}
              step={0.01}
              value={effect.delayLeft ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { delayLeft: v, delayRight: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </>
        )}
        {(effect.type === 'distortion' || effect.type === 'saturation') && (
          <>
            <Knob
              label="Drive"
              min={0}
              max={1}
              step={0.01}
              value={effect.distortionAmount ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { distortionAmount: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Knob
              label="Tone"
              min={0}
              max={1}
              step={0.01}
              value={effect.distortionTone ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { distortionTone: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </>
        )}
        {effect.type === 'compressor' && (
          <>
            <Knob
              label="Threshold"
              min={-60}
              max={0}
              step={1}
              value={effect.compressorThreshold ?? -24}
              onChange={(v) => handleParamChange(slotIndex, { compressorThreshold: v })}
              format={(v) => `${v.toFixed(0)}dB`}
            />
            <Knob
              label="Ratio"
              min={1}
              max={20}
              step={0.1}
              value={effect.compressorRatio ?? 4}
              onChange={(v) => handleParamChange(slotIndex, { compressorRatio: v })}
              format={(v) => `${v.toFixed(1)}:1`}
            />
          </>
        )}
      </S.EffectParams>
    )
  }

  return (
    <S.Container>
      <S.Header>
        <S.TrackIndicator $color={trackColor} />
        <S.TrackName>{trackName}</S.TrackName>
        <S.Subtitle>FX Chain</S.Subtitle>
      </S.Header>

      <S.SlotsGrid>
        {slots.map((effect, index) => (
          <S.EffectSlot key={index}>
            <S.SlotHeader>
              <S.SlotNumber>{index + 1}</S.SlotNumber>
              <S.EffectSelect
                value={effect.type}
                onChange={(e) => handleTypeChange(index, e.target.value as EffectType)}
              >
                <option value="none">None</option>
                <option value="reverb">Reverb</option>
                <option value="delay">Delay</option>
                <option value="distortion">Distortion</option>
                <option value="saturation">Saturation</option>
                <option value="phaser">Phaser</option>
                <option value="chorus">Chorus</option>
                <option value="compressor">Compressor</option>
                <option value="limiter">Limiter</option>
              </S.EffectSelect>
              {effect.enabled && effect.type !== 'none' && (
                <S.EnableToggle
                  type="checkbox"
                  checked={effect.enabled}
                  onChange={(e) => handleParamChange(index, { enabled: e.target.checked })}
                  title="Enable/disable effect"
                />
              )}
            </S.SlotHeader>
            {renderEffectControls(effect, index)}
          </S.EffectSlot>
        ))}
      </S.SlotsGrid>
    </S.Container>
  )
}

