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
}

export function MixerChannel({ label, value, onChange, color = 'default', muted = false, onMuteToggle, meterLevel = 0 }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      updateValue(e.clientY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const percentage = value * 100
  const meterPercentage = muted ? 0 : meterLevel * 100
  const db = value === 0 ? -Infinity : 20 * Math.log10(value)
  const dbDisplay = db === -Infinity ? '-∞' : db.toFixed(1)

  return (
    <S.Container>
      <S.Label>{label}</S.Label>
      <S.SliderTrack ref={sliderRef} onMouseDown={handleMouseDown}>
        <S.MeterFill style={{ height: `${meterPercentage}%` }} $color={color} />
        <S.SliderFill style={{ height: `${percentage}%` }} $color={color} $muted={muted} />
        <S.SliderThumb style={{ bottom: `${percentage}%` }} $isDragging={isDragging} $color={color} />
      </S.SliderTrack>
      <S.ValueDisplay $color={color}>{muted ? 'MUTE' : `${dbDisplay} dB`}</S.ValueDisplay>
      <S.PercentDisplay>{percentage.toFixed(0)}%</S.PercentDisplay>
      {onMuteToggle && (
        <S.MuteButton $muted={muted} onClick={onMuteToggle}>
          {muted ? 'M' : 'M'}
        </S.MuteButton>
      )}
    </S.Container>
  )
}

export default MixerChannel

