import { useEffect, useRef, useState } from 'react'
import * as S from './MixerChannel.styles'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  color?: 'default' | 'accent' | 'alt'
  muted?: boolean
  onMuteToggle?: () => void
  meterLevel?: number // 0-1 range for VU meter
  waveform?: Uint8Array | Float32Array
  pan?: number // -1 (left) to 1 (right), 0 is center
  onPanChange?: (pan: number) => void
}

export function MixerChannel({ label, value, onChange, color = 'default', muted = false, onMuteToggle, meterLevel = 0, waveform, pan = 0, onPanChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isPanDragging, setIsPanDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const panKnobRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateValue(e.clientY)
  }

  const updateValue = (clientY: number) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const y = clientY - rect.top
    const height = rect.height
    const newValue = Math.max(0, Math.min(1, 1 - y / height))
    onChange(newValue)
  }

  const handlePanMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPanDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientY)
      }
      if (isPanDragging && onPanChange) {
        const sensitivity = 0.005
        const delta = -e.movementY * sensitivity
        const newPan = Math.max(-1, Math.min(1, pan + delta))
        onPanChange(newPan)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsPanDragging(false)
    }

    if (isDragging || isPanDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isPanDragging, pan, onPanChange])

  // Draw waveform in the meter area
  useEffect(() => {
    const canvas = canvasRef.current
    const track = sliderRef.current
    if (!canvas || !track) return
    const ctx = canvas.getContext('2d')!
    const width = (canvas.width = track.clientWidth)
    const height = (canvas.height = track.clientHeight)

    // Background
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, width, height)

    const data = waveform
    if (!data || data.length === 0) return

    ctx.lineWidth = 1.5
    ctx.strokeStyle = '#21c7beaa'
    ctx.beginPath()

    const len = data.length
    for (let i = 0; i < len; i++) {
      const x = (i / (len - 1)) * width
      let yNorm: number
      if (data instanceof Uint8Array) {
        yNorm = data[i] / 255 // 0..1
      } else {
        // Float32Array -1..1 -> 0..1
        const val = (data as Float32Array)[i]
        yNorm = (val + 1) / 2
      }
      const y = yNorm * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }, [waveform])

  const percentage = value * 100
  const meterPercentage = muted ? 0 : meterLevel * 100
  const db = value === 0 ? -Infinity : 20 * Math.log10(value)
  const dbDisplay = db === -Infinity ? '-∞' : db.toFixed(1)
  const panRotation = pan * 135 // -135 to +135 degrees
  const panDisplay = pan === 0 ? 'C' : pan > 0 ? `R${Math.abs(pan * 100).toFixed(0)}` : `L${Math.abs(pan * 100).toFixed(0)}`

  return (
    <S.Container>
      <S.Label>{label}</S.Label>
      <S.SliderTrack ref={sliderRef} onMouseDown={handleMouseDown}>
        <S.WaveCanvas ref={canvasRef} />
        <S.MeterFill style={{ height: `${meterPercentage}%` }} $color={color} />
        <S.SliderFill style={{ height: `${percentage}%` }} $color={color} $muted={muted} />
        <S.SliderThumb style={{ bottom: `${percentage}%` }} $isDragging={isDragging} $color={color} />
      </S.SliderTrack>
      <S.ValueDisplay $color={color}>{muted ? 'MUTE' : `${dbDisplay} dB`}</S.ValueDisplay>
      <S.PercentDisplay>{percentage.toFixed(0)}%</S.PercentDisplay>
      {onPanChange && (
        <S.PanControl>
          <S.PanKnob 
            ref={panKnobRef}
            onMouseDown={handlePanMouseDown}
            $rotation={panRotation}
            $isDragging={isPanDragging}
          >
            <S.PanIndicator />
          </S.PanKnob>
          <S.PanLabel>{panDisplay}</S.PanLabel>
        </S.PanControl>
      )}
      {onMuteToggle && (
        <S.MuteButton $muted={muted} onClick={onMuteToggle}>
          {muted ? 'M' : 'M'}
        </S.MuteButton>
      )}
    </S.Container>
  )
}

export default MixerChannel

