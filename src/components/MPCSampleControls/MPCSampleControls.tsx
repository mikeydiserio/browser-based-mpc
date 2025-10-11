import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Knob } from '../Knob/Knob'
import * as S from './MPCSampleControls.styles.ts'

type MinimalAudioBuffer = {
  getChannelData: (channel: number) => Float32Array
  duration: number
  sampleRate: number
  numberOfChannels: number
}

function isAudioBufferLike(value: unknown): value is MinimalAudioBuffer {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v['getChannelData'] === 'function' &&
    typeof v['duration'] === 'number' &&
    typeof v['sampleRate'] === 'number' &&
    typeof v['numberOfChannels'] === 'number'
  )
}

interface Sample {
  buffer?: AudioBuffer
  name?: string
  pitch?: number
  gain?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
}

interface MPCSampleControlsProps {
  selectedPad: number
  sample?: Sample | null
  onUpdateSample?: (changes: Partial<Sample>) => void
  onLoadSample?: (padIndex: number, file: File) => void
}

export function MPCSampleControls({
  selectedPad,
  sample,
  onUpdateSample,
  onLoadSample
}: MPCSampleControlsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Extract waveform data from audio buffer
  const pcmData = useMemo(() => {
    const bufferLike = sample?.buffer
    if (!bufferLike || !isAudioBufferLike(bufferLike)) return null
    try {
      return bufferLike.getChannelData(0)
    } catch {
      return null
    }
  }, [sample?.buffer])

  // Downsample for waveform display
  const downsampled = useMemo(() => {
    if (!pcmData || pcmData.length === 0) return null
    const target = 300
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

  // Draw waveform with ADSR overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width = canvas.clientWidth * window.devicePixelRatio
    const h = canvas.height = canvas.clientHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const displayW = w / window.devicePixelRatio
    const displayH = h / window.devicePixelRatio

    ctx.clearRect(0, 0, displayW, displayH)

    // Draw waveform
    if (downsampled) {
      ctx.strokeStyle = '#21c7be'
      ctx.lineWidth = 1
      const mid = displayH / 2
      ctx.beginPath()
      for (let x = 0; x < downsampled.length; x++) {
        const v = downsampled[x]
        const y = v * (displayH / 2 - 2)
        const xPos = (x / downsampled.length) * displayW
        ctx.moveTo(xPos, mid - y)
        ctx.lineTo(xPos, mid + y)
      }
      ctx.stroke()
    }

    // Draw ADSR overlay (only if we have a valid duration)
    const bufferLike = sample?.buffer
    const dur = bufferLike && isAudioBufferLike(bufferLike) ? bufferLike.duration : 0
    if (dur > 0) {
      const attack = sample?.attack ?? 0.005
      const decay = sample?.decay ?? 0.05
      const sustain = sample?.sustain ?? 0.8
      const release = sample?.release ?? 0.08

      const aX = (attack / dur) * displayW
      const dX = (decay / dur) * displayW
      const rX = (release / dur) * displayW

      const startX = 0
      const peakX = Math.min(startX + aX, displayW)
      const sustainLevel = Math.max(0, Math.min(1, sustain))
      const sustainY = (1 - sustainLevel) * (displayH - 4) + 2
      const decayEndX = Math.min(peakX + dX, displayW)
      const releaseStartX = Math.max(displayW - rX, decayEndX)

      ctx.strokeStyle = '#ff7a45'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(startX, displayH - 2)
      ctx.lineTo(peakX, 2)
      ctx.lineTo(decayEndX, sustainY)
      ctx.lineTo(releaseStartX, sustainY)
      ctx.lineTo(displayW, displayH - 2)
      ctx.stroke()
    }
  }, [downsampled, sample])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(f => f.type.startsWith('audio/'))
    if (audioFile && onLoadSample) {
      onLoadSample(selectedPad, audioFile)
    }
  }, [selectedPad, onLoadSample])

  const bufferLike = sample?.buffer
  const durationSec = bufferLike && isAudioBufferLike(bufferLike) ? bufferLike.duration : 0
  const sampleRate = bufferLike && isAudioBufferLike(bufferLike) ? bufferLike.sampleRate : 0
  const channels = bufferLike && isAudioBufferLike(bufferLike) ? bufferLike.numberOfChannels : 0

  return (
    <S.Container>
      <S.Header>
        <S.PadNumber>Pad {selectedPad + 1}</S.PadNumber>
        <S.SampleName>{sample?.name || 'No sample loaded'}</S.SampleName>
      </S.Header>

      <S.WaveformContainer
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDragging={dragActive}
      >
        <S.WaveCanvas ref={canvasRef} />
        {!sample && (
          <S.DropHint>Drop audio file here or load from browser</S.DropHint>
        )}
      </S.WaveformContainer>

      <S.MetaRow>
        <S.MetaItem>
          <S.MetaLabel>Length:</S.MetaLabel>
          <S.MetaValue>{durationSec ? `${durationSec.toFixed(2)}s` : '-'}</S.MetaValue>
        </S.MetaItem>
        <S.MetaItem>
          <S.MetaLabel>Rate:</S.MetaLabel>
          <S.MetaValue>{sampleRate ? `${sampleRate}Hz` : '-'}</S.MetaValue>
        </S.MetaItem>
        <S.MetaItem>
          <S.MetaLabel>Channels:</S.MetaLabel>
          <S.MetaValue>{channels || '-'}</S.MetaValue>
        </S.MetaItem>
      </S.MetaRow>

      <S.KnobRow>
        <Knob
          label="Pitch"
          min={-12}
          max={12}
          step={1}
          value={sample?.pitch ?? 0}
          onChange={(v) => onUpdateSample?.({ pitch: v })}
          format={(v) => `${v > 0 ? '+' : ''}${v}st`}
        />
        <Knob
          label="Attack"
          min={0}
          max={1}
          step={0.005}
          value={sample?.attack ?? 0.005}
          onChange={(v) => onUpdateSample?.({ attack: v })}
          format={(v) => `${(v * 1000).toFixed(0)}ms`}
        />
        <Knob
          label="Decay"
          min={0}
          max={2}
          step={0.01}
          value={sample?.decay ?? 0.05}
          onChange={(v) => onUpdateSample?.({ decay: v })}
          format={(v) => `${(v * 1000).toFixed(0)}ms`}
        />
        <Knob
          label="Sustain"
          min={0}
          max={1}
          step={0.01}
          value={sample?.sustain ?? 0.8}
          onChange={(v) => onUpdateSample?.({ sustain: v })}
          format={(v) => v.toFixed(2)}
        />
        <Knob
          label="Release"
          min={0}
          max={2}
          step={0.01}
          value={sample?.release ?? 0.08}
          onChange={(v) => onUpdateSample?.({ release: v })}
          format={(v) => `${(v * 1000).toFixed(0)}ms`}
        />
      </S.KnobRow>
    </S.Container>
  )
}

