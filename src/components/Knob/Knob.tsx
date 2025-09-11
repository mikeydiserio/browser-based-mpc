import { useCallback, useMemo, useRef, useState } from 'react'
import * as S from './Knob.styles'

type Props = {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
}

export function Knob({ label, min, max, step = 1, value, onChange, format }: Props) {
  const clamp = useCallback((v: number) => Math.max(min, Math.min(max, v)), [min, max])
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef(0)
  const startValRef = useRef(0)

  const angle = useMemo(() => {
    const t = (value - min) / (max - min)
    // Map to -135deg..135deg
    return -135 + t * 270
  }, [value, min, max])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return
    const delta = startYRef.current - e.clientY
    const sensitivity = (max - min) / 150 // pixels to full range
    let next = startValRef.current + delta * sensitivity
    if (step) next = Math.round(next / step) * step
    onChange(clamp(next))
  }, [dragging, clamp, max, min, step, onChange])

  const onMouseUp = useCallback(() => {
    setDragging(false)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }, [onMouseMove])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startYRef.current = e.clientY
    startValRef.current = value
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [value, onMouseMove, onMouseUp])

  return (
    <S.Container>
      <S.Dial $angle={angle} onMouseDown={onMouseDown} aria-label={label} role="slider" />
      <S.Label>{label}</S.Label>
      <S.Value>{format ? format(value) : value}</S.Value>
    </S.Container>
  )
}

export default Knob


