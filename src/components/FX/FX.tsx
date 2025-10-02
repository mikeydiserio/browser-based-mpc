import { useCallback } from 'react'
import type { DelayTime, EffectSlot, EffectType } from '../../audio/effects'
import { getDefaultParamsForEffect } from '../../audio/effects'
import { Knob } from '../Knob/Knob'
import * as S from './FX.styles'

type Props = {
  effectSlots: [EffectSlot, EffectSlot, EffectSlot, EffectSlot, EffectSlot, EffectSlot]
  onChange?: (slotIndex: number, effect: EffectSlot) => void
}

export function FX({ effectSlots, onChange }: Props) {
  const handleTypeChange = useCallback((slotIndex: number, type: EffectType) => {
    const defaults = getDefaultParamsForEffect(type)
    const newEffect: EffectSlot = {
      ...effectSlots[slotIndex],
      type,
      enabled: type !== 'none',
      ...defaults,
    }
    onChange?.(slotIndex, newEffect)
  }, [effectSlots, onChange])

  const handleParamChange = useCallback((slotIndex: number, param: Partial<EffectSlot>) => {
    const newEffect: EffectSlot = {
      ...effectSlots[slotIndex],
      ...param,
    }
    onChange?.(slotIndex, newEffect)
  }, [effectSlots, onChange])

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
            <S.DelayTimeButtons>
              {(['8th', '16th', '32nd', 'triplet'] as DelayTime[]).map((time) => (
                <S.DelayTimeButton
                  key={time}
                  $active={effect.delayTime === time}
                  onClick={() => handleParamChange(slotIndex, { delayTime: time })}
                >
                  {time === 'triplet' ? '3' : time.replace('th', '')}
                </S.DelayTimeButton>
              ))}
            </S.DelayTimeButtons>
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
        {effect.type === 'phaser' && (
          <>
            <Knob
              label="Rate"
              min={0}
              max={1}
              step={0.01}
              value={effect.phaserRate ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { phaserRate: v })}
              format={(v) => `${(v * 2).toFixed(2)}Hz`}
            />
            <Knob
              label="Depth"
              min={0}
              max={1}
              step={0.01}
              value={effect.phaserDepth ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { phaserDepth: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </>
        )}
        {effect.type === 'chorus' && (
          <>
            <Knob
              label="Rate"
              min={0}
              max={1}
              step={0.01}
              value={effect.chorusRate ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { chorusRate: v })}
              format={(v) => `${(v * 5).toFixed(2)}Hz`}
            />
            <Knob
              label="Depth"
              min={0}
              max={1}
              step={0.01}
              value={effect.chorusDepth ?? 0.5}
              onChange={(v) => handleParamChange(slotIndex, { chorusDepth: v })}
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
            <Knob
              label="Attack"
              min={0}
              max={1}
              step={0.001}
              value={effect.compressorAttack ?? 0.003}
              onChange={(v) => handleParamChange(slotIndex, { compressorAttack: v })}
              format={(v) => `${(v * 1000).toFixed(0)}ms`}
            />
            <Knob
              label="Release"
              min={0}
              max={1}
              step={0.01}
              value={effect.compressorRelease ?? 0.25}
              onChange={(v) => handleParamChange(slotIndex, { compressorRelease: v })}
              format={(v) => `${(v * 1000).toFixed(0)}ms`}
            />
            <Knob
              label="Knee"
              min={0}
              max={40}
              step={1}
              value={effect.compressorKnee ?? 30}
              onChange={(v) => handleParamChange(slotIndex, { compressorKnee: v })}
              format={(v) => `${v.toFixed(0)}dB`}
            />
          </>
        )}
        {effect.type === 'limiter' && (
          <>
            <Knob
              label="Threshold"
              min={-60}
              max={0}
              step={0.1}
              value={effect.limiterThreshold ?? -3}
              onChange={(v) => handleParamChange(slotIndex, { limiterThreshold: v })}
              format={(v) => `${v.toFixed(1)}dB`}
            />
            <Knob
              label="Release"
              min={0.001}
              max={1}
              step={0.001}
              value={effect.limiterRelease ?? 0.01}
              onChange={(v) => handleParamChange(slotIndex, { limiterRelease: v })}
              format={(v) => `${(v * 1000).toFixed(0)}ms`}
            />
            <Knob
              label="Lookahead"
              min={0}
              max={0.05}
              step={0.001}
              value={effect.limiterLookahead ?? 0.005}
              onChange={(v) => handleParamChange(slotIndex, { limiterLookahead: v })}
              format={(v) => `${(v * 1000).toFixed(1)}ms`}
            />
          </>
        )}
      </S.EffectParams>
    )
  }

  return (
    <S.Container>
      <S.Title>FX Chain (6 Slots)</S.Title>
      <S.SlotsGrid>
        {effectSlots.map((effect, index) => (
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
            </S.SlotHeader>
            {renderEffectControls(effect, index)}
          </S.EffectSlot>
        ))}
      </S.SlotsGrid>
    </S.Container>
  )
}

export default FX
