import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import * as S from './Sequencer.styles'

type SequencerProps = {
  matrix: boolean[][]
  currentStep: number
  steps: number
  onToggle: (row: number, col: number) => void
  patternNumber?: number
  onPatternChange?: (pattern: number) => void
  padNames?: Record<number, string | undefined>
  isLoading?: boolean
}

export function Sequencer({ matrix, currentStep, steps, onToggle, patternNumber = 1, onPatternChange, padNames = {}, isLoading }: SequencerProps) {
  // Filter rows to only show pads that have samples assigned
  const rows = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => i).filter(i => padNames[i] !== undefined)
  }, [padNames])
  const cols = useMemo(() => Array.from({ length: steps }, (_, i) => i), [steps])
  const [litIndex, setLitIndex] = useState<number>(0)
  const [localPatternStr, setLocalPatternStr] = useState<string>(String(patternNumber))
  type CSSVars = React.CSSProperties & { ['--cols']?: string }

  // sync when external pattern changes
  useEffect(() => {
    setLocalPatternStr(String(patternNumber))
  }, [patternNumber])

  useEffect(() => {
    setLitIndex(currentStep)
  }, [currentStep])

  const gridTemplate = useMemo(() => `repeat(${steps}, 1fr)`, [steps])

  return (
    <S.Container style={{ ['--cols']: gridTemplate } as CSSVars}>
      <S.Header>
        <S.HeaderSpacer />
        <S.HeaderBeats>
          {cols.map((c) => {
            const accent = (c % 4) === 0
            const subdivisionNumber = Math.floor(c / 4) + 1
            return (
              <S.BeatContainer key={`h-${c}`}>
                <S.BeatLight $lit={litIndex === c} $accent={accent} />
                {accent && (
                  <>
                    <S.SubdivisionNumber>{subdivisionNumber}</S.SubdivisionNumber>
                    <S.BorderLine />
                  </>
                )}
              </S.BeatContainer>
            )
          })}
        </S.HeaderBeats>
      </S.Header>
      {rows.map((r) => (
        <S.Row key={`r-${r}`}>
          <S.RowLabel title={padNames[r]}>
            {padNames[r] || `Pad ${r + 1}`}
          </S.RowLabel>
          <S.RowSteps>
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
          </S.RowSteps>
        </S.Row>
      ))}
      <S.Footer>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ opacity: 0.8 }}>Pat</span>
          <S.PatternInput
            type="number"
            min={1}
            max={99}
            value={localPatternStr}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value
              setLocalPatternStr(val)
              const parsed = parseInt(val, 10)
              if (isNaN(parsed)) return
              const clamped = Math.max(1, Math.min(99, parsed))
              if (clamped !== patternNumber) onPatternChange?.(clamped)
            }}
            inputMode="numeric"
          />
        </div>
      </S.Footer>
      {isLoading && <LoadingSpinner message="Loading kit..." />}
    </S.Container>
  )
}

export default Sequencer
