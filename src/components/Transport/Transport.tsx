import { useCallback } from 'react'
import * as S from './Transport.styles'

// Simple play/pause icons as components
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const IconPause = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
)

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
  sequencerMode?: boolean
  onToggleSequencerMode?: () => void
}

export function Transport({ isPlaying, bpm, metronomeOn, steps, onTogglePlay, onTempoChange, onToggleMetronome, onStepsChange, swing, onSwingChange, arrangementOn, onToggleArrangement, sequencerMode, onToggleSequencerMode }: TransportProps) {
  const handleBPMInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onTempoChange(Number(e.target.value))
  }, [onTempoChange])

  return (
    <S.Container>
      <S.Button $primary onClick={onTogglePlay}>
        {isPlaying ? <IconPause /> : <IconPlay />}
      </S.Button>
      <S.Button onClick={() => onTempoChange(120)}>Reset</S.Button>
      <S.ToggleGroup>
        <S.Button onClick={onToggleMetronome}>{metronomeOn ? 'Metronome: On' : 'Metronome: Off'}</S.Button>
        {onToggleArrangement && (
          <S.Button onClick={onToggleArrangement}>{arrangementOn ? 'Arr: On' : 'Arr: Off'}</S.Button>
        )}
        {onToggleSequencerMode && (
          <S.Button onClick={onToggleSequencerMode}>{sequencerMode ? 'Seq: On' : 'Free Play'}</S.Button>
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
        <S.Label>BPM</S.Label>
        <S.BPMInput
          type="number"
          min={60}
          max={200}
          value={bpm}
          onChange={handleBPMInput}
        />
      </S.TempoGroup>
    </S.Container>
  )
}

export default Transport
