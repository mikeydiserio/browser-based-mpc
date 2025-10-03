import { useEffect, useMemo, useRef } from 'react'
import type { EQSettings } from '../../audio/eq'
import { calculateEQCurve, freqToX, gainToY } from '../../audio/eqCurve'
import { Knob } from '../Knob/Knob'
import * as S from './SampleInfo.styles'

type Props = {
  padIndex: number | null
  name?: string
  durationSec?: number
  sampleRate?: number
  channels?: number
  pcmData?: Float32Array | null
  pitch?: number
  gain?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
  eq?: EQSettings
  warp?: boolean
  quantize?: boolean
  loop?: boolean
  hold?: boolean
  onChange?: (changes: Partial<{ pitch: number; gain: number; attack: number; decay: number; sustain: number; release: number }>) => void
  onControlsChange?: (changes: Partial<{ warp: boolean; quantize: boolean; loop: boolean; hold: boolean }>) => void
}

export function SampleInfo({ padIndex, name, durationSec, sampleRate, channels, pcmData, pitch = 0, gain = 1.0, attack = 0.005, decay = 0.05, sustain = 0.8, release = 0.08, eq, warp = false, quantize = true, loop = false, hold = false, onChange, onControlsChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const downsampled = useMemo(() => {
    if (!pcmData || pcmData.length === 0) return null
    const target = 400
    const block = Math.max(1, Math.floor(pcmData.length / target))
    const arr = new Float32Array(target)
    for (let i = 0; i < target; i++) {
      const start = i * block
      let min = 1.0
      let max = -1.0
      for (let j = 0; j < block; j++) {
        const v = pcmData[start + j] ?? 0
        if (v < min) min = v
        if (v > max) max = v
      }
      arr[i] = Math.max(Math.abs(min), Math.abs(max))
    }
    return arr
  }, [pcmData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !downsampled) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width = canvas.clientWidth
    const h = canvas.height = canvas.clientHeight
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#00000000'
    
    // Waveform
    ctx.strokeStyle = '#21c7be'
    ctx.lineWidth = 1
    const mid = h / 2
    ctx.beginPath()
    for (let x = 0; x < downsampled.length; x++) {
      const v = downsampled[x]
      const y = v * (h / 2 - 1)
      ctx.moveTo((x / downsampled.length) * w, mid - y)
      ctx.lineTo((x / downsampled.length) * w, mid + y)
    }
    ctx.stroke()
    
    // EQ Curve overlay
    if (eq) {
      const { frequencies, gains } = calculateEQCurve(eq, 150, sampleRate ?? 44100)
      
      // Draw frequency response curve
      ctx.strokeStyle = '#ffd23f'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < frequencies.length; i++) {
        const x = freqToX(frequencies[i], w)
        const y = gainToY(gains[i], h, 12)
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
      
      // Draw center line (0dB reference)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Fill under/over EQ curve
      ctx.fillStyle = 'rgba(255, 210, 63, 0.15)'
      ctx.beginPath()
      ctx.moveTo(freqToX(frequencies[0], w), h / 2)
      for (let i = 0; i < frequencies.length; i++) {
        const x = freqToX(frequencies[i], w)
        const y = gainToY(gains[i], h, 12)
        ctx.lineTo(x, y)
      }
      ctx.lineTo(freqToX(frequencies[frequencies.length - 1], w), h / 2)
      ctx.closePath()
      ctx.fill()
    }
    
    // ADSR overlay
    const dur = durationSec ?? 1
    const aX = (attack / dur) * w
    const dX = (decay / dur) * w
    const rX = (release / dur) * w
    const startX = 0
    const peakX = Math.min(startX + aX, w)
    const sustainLevel = Math.max(0, Math.min(1, sustain))
    const sustainY = (1 - sustainLevel) * (h - 4) + 2
    const decayEndX = Math.min(peakX + dX, w)
    const releaseStartX = Math.max(w - rX, decayEndX)
    ctx.strokeStyle = '#ff7a45'
    ctx.lineWidth = 2
    ctx.setLineDash([2, 2])
    ctx.beginPath()
    // Attack
    ctx.moveTo(startX, h - 2)
    ctx.lineTo(peakX, 2)
    // Decay
    ctx.lineTo(decayEndX, sustainY)
    // Sustain plateau
    ctx.lineTo(releaseStartX, sustainY)
    // Release
    ctx.lineTo(w, h - 2)
    ctx.stroke()
    ctx.setLineDash([])
  }, [downsampled, attack, decay, sustain, release, durationSec, eq, sampleRate])

  return (
    <S.Container>
      <S.TitleRow>
        <div>Selected Pad: {padIndex !== null ? padIndex + 1 : '-'}</div>
      </S.TitleRow>
      <S.Name>{name ?? 'No sample loaded'}</S.Name>
      <S.ToggleRow>
        <S.ToggleButton
          $active={warp}
          onClick={() => onControlsChange?.({ warp: !warp })}
        >
          Warp
        </S.ToggleButton>
        <S.ToggleButton
          $active={quantize}
          onClick={() => onControlsChange?.({ quantize: !quantize })}
        >
          Quantize
        </S.ToggleButton>
        <S.ToggleButton
          $active={loop}
          onClick={() => onControlsChange?.({ loop: !loop })}
        >
          Loop
        </S.ToggleButton>
        <S.ToggleButton
          $active={hold}
          onClick={() => onControlsChange?.({ hold: !hold })}
        >
          Hold
        </S.ToggleButton>
      </S.ToggleRow>
      <S.WaveCanvas ref={canvasRef} />
      <S.MetaGrid>
        <S.MetaItem>Length: <span>{durationSec ? `${durationSec.toFixed(2)}s` : '-'}</span></S.MetaItem>
        <S.MetaItem>Rate: <span>{sampleRate ? `${sampleRate} Hz` : '-'}</span></S.MetaItem>
        <S.MetaItem>Channels: <span>{channels ?? '-'}</span></S.MetaItem>
      </S.MetaGrid>
      <S.KnobRow>
        <Knob label="Gain" min={0} max={2} step={0.01} value={gain} onChange={(v) => onChange?.({ gain: v })} format={(v) => `${(v * 100).toFixed(0)}%`} />
        <Knob label="Pitch" min={-24} max={24} step={1} value={pitch} onChange={(v) => onChange?.({ pitch: v })} format={(v) => `${v} st`} />
        <Knob label="Attack" min={0} max={1} step={0.005} value={attack} onChange={(v) => onChange?.({ attack: v })} format={(v) => `${v.toFixed(3)}s`} />
        <Knob label="Decay" min={0} max={2} step={0.01} value={decay} onChange={(v) => onChange?.({ decay: v })} format={(v) => `${v.toFixed(2)}s`} />
        <Knob label="Sustain" min={0} max={1} step={0.01} value={sustain} onChange={(v) => onChange?.({ sustain: v })} format={(v) => v.toFixed(2)} />
        <Knob label="Release" min={0} max={2} step={0.01} value={release} onChange={(v) => onChange?.({ release: v })} format={(v) => `${v.toFixed(2)}s`} />
      </S.KnobRow>
    </S.Container>
  )
}

export default SampleInfo
