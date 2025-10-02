import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as S from './Knob.styles'

type Props = {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  size?: 'small' | 'medium'
}

export function Knob({ label, min, max, step = 1, value, onChange, format, size = 'medium' }: Props) {
  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max])
  const [dragging, setDragging] = useState(false)
  const [internalValue, setInternalValue] = useState(value)
  const startYRef = useRef(0)
  const startValRef = useRef(0)

  useEffect(() => {
    if (!dragging) {
      setInternalValue(value)
    }
  }, [value, dragging])

  const angle = useMemo(() => {
    const v = dragging ? internalValue : value
    const t = (v - min) / (max - min)
    // Map to -135deg..135deg
    return -135 + t * 270
  }, [internalValue, value, dragging, min, max])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startYRef.current = e.clientY
    startValRef.current = value

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startYRef.current - e.clientY
      const sensitivity = (max - min) / 150 // pixels to full range
      let next = startValRef.current + delta * sensitivity
      if (step) next = Math.round(next / step) * step
      const clamped = clamp(next)
      setInternalValue(clamped)
      onChange(clamped)
    }

    const handleMouseUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [value, clamp, max, min, step, onChange])

  return (
    <S.Container $size={size}>
      <S.Dial $angle={angle} $size={size} onMouseDown={onMouseDown} aria-label={label} role="slider" />
      <S.Label $size={size}>{label}</S.Label>
      <S.Value $size={size}>{format ? format(dragging ? internalValue : value) : (dragging ? internalValue : value)}</S.Value>
    </S.Container>
  )
}

export default Knob
