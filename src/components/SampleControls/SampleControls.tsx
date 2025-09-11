import * as S from './SampleControls.styles'

type Props = {
  pitch: number
  warp: boolean
  quantize: boolean
  loop: boolean
  hold: boolean
  onChange: (changes: Partial<Pick<Props, 'pitch' | 'warp' | 'quantize' | 'loop' | 'hold'>>) => void
}

export function SampleControls({ pitch, warp, quantize, loop, hold, onChange }: Props) {
  return (
    <S.Container>
      <S.Control>
        Pitch ({pitch} st)
        <S.Slider min={-12} max={12} step={1} value={pitch} onChange={(e) => onChange({ pitch: Number(e.target.value) })} />
      </S.Control>
      <S.Control>
        Warp
        <S.Toggle checked={warp} onChange={(e) => onChange({ warp: e.target.checked })} />
      </S.Control>
      <S.Control>
        Quantize
        <S.Toggle checked={quantize} onChange={(e) => onChange({ quantize: e.target.checked })} />
      </S.Control>
      <S.Control>
        Loop
        <S.Toggle checked={loop} onChange={(e) => onChange({ loop: e.target.checked })} />
      </S.Control>
      <S.Control>
        Hold
        <S.Toggle checked={hold} onChange={(e) => onChange({ hold: e.target.checked })} />
      </S.Control>
    </S.Container>
  )
}

export default SampleControls


