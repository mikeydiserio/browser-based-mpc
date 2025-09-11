import { useCallback } from 'react'
import * as S from './Transport.styles'

type TransportProps = {
  isPlaying: boolean
  bpm: number
  metronomeOn: boolean
  steps: number
  onTogglePlay: () => void
  onTempoChange: (bpm: number) => void
  onToggleMetronome: () => void
  onStepsChange: (steps: number) => void
  swing: number
  onSwingChange: (amount: number) => void
  arrangementOn?: boolean
  onToggleArrangement?: () => void
}

export function Transport({ isPlaying, bpm, metronomeOn, steps, onTogglePlay, onTempoChange, onToggleMetronome, onStepsChange, swing, onSwingChange, arrangementOn, onToggleArrangement }: TransportProps) {
  const handleTempo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTempoChange(Number(e.target.value))
  }, [onTempoChange])

  return (
    <S.Container>
      <S.Button $primary onClick={onTogglePlay}>{isPlaying ? 'Stop' : 'Play'}</S.Button>
      <S.Button onClick={() => onTempoChange(120)}>Reset</S.Button>
      <S.ToggleGroup>
        <S.Button onClick={onToggleMetronome}>{metronomeOn ? 'Metronome: On' : 'Metronome: Off'}</S.Button>
        {onToggleArrangement && (
          <S.Button onClick={onToggleArrangement}>{arrangementOn ? 'Arr: On' : 'Arr: Off'}</S.Button>
        )}
      </S.ToggleGroup>
      <S.Select value={steps} onChange={(e) => onStepsChange(Number(e.target.value))}>
        <option value={8}>8</option>
        <option value={16}>16</option>
        <option value={32}>32</option>
        <option value={64}>64</option>
      </S.Select>
      <S.TempoGroup>
        <S.Label>Swing</S.Label>
        <S.Slider min={0} max={0.8} step={0.01} value={swing} onChange={(e) => onSwingChange(Number(e.target.value))} />
      </S.TempoGroup>
      <S.TempoGroup>
        <S.Label>Tempo</S.Label>
        <S.Slider min={60} max={200} step={1} value={bpm} onChange={handleTempo} />
      </S.TempoGroup>
      <S.BPM>{Math.round(bpm)} BPM</S.BPM>
    </S.Container>
  )
}

export default Transport


