import { useEffect, useMemo, useState } from 'react'
import * as S from './Sequencer.styles'

type SequencerProps = {
  matrix: boolean[][]
  currentStep: number
  steps: number
  onToggle: (row: number, col: number) => void
  patternNumber?: number
  stepsControl?: React.ReactNode
  onPatternChange?: (pattern: number) => void
}

export function Sequencer({ matrix, currentStep, steps, onToggle, patternNumber = 1, stepsControl, onPatternChange }: SequencerProps) {
  const rows = useMemo(() => Array.from({ length: 16 }, (_, i) => i), [])
  const cols = useMemo(() => Array.from({ length: steps }, (_, i) => i), [steps])
  const [litIndex, setLitIndex] = useState<number>(0)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragStartVal, setDragStartVal] = useState<number>(patternNumber)
  const [localPattern, setLocalPattern] = useState<number>(patternNumber)

  // sync when external pattern changes
  useEffect(() => {
    setLocalPattern(patternNumber)
    setDragStartVal(patternNumber)
  }, [patternNumber])

  useEffect(() => {
    setLitIndex(currentStep)
  }, [currentStep])

  const gridTemplate = useMemo(() => `repeat(${steps}, 1fr)`, [steps])

  return (
    <S.Container style={{ ['--cols' as any]: gridTemplate }}>
      <S.Header>
        {cols.map((c) => {
          const accent = (c % 4) === 0
          return <S.BeatLight key={`h-${c}`} $lit={litIndex === c} $accent={accent} />
        })}
      </S.Header>
      {rows.map((r) => (
        <S.Row key={`r-${r}`}>
          {cols.map((c) => {
            const active = matrix[r]?.[c] ?? false
            const lit = litIndex === c
            const accent = (c % 4) === 0
            return (
              <S.Step
                key={`s-${r}-${c}`}
                $active={active}
                $lit={lit}
                $accent={accent}
                onClick={() => onToggle(r, c)}
              />
            )
          })}
        </S.Row>
      ))}
      <S.Footer>
        <S.PatternDisplay
          onMouseDown={(e) => { setDragStartY(e.clientY); setDragStartVal(localPattern) }}
          onMouseUp={() => setDragStartY(null)}
          onMouseLeave={() => setDragStartY(null)}
          onMouseMove={(e) => {
            if (dragStartY === null) return
            const delta = dragStartY - e.clientY
            const next = Math.max(1, Math.min(99, Math.round(dragStartVal + delta / 5)))
            setLocalPattern(next)
            onPatternChange?.(next)
          }}
          title="Drag up/down to change pattern"
        >
          Pat {localPattern}
        </S.PatternDisplay>
        {stepsControl}
      </S.Footer>
    </S.Container>
  )
}

export default Sequencer


