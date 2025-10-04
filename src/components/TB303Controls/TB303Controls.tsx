import type { TB303Patch } from '../../audio/TB303Synth'
import { Knob } from '../Knob/Knob'
import * as S from './TB303Controls.styles'

type Props = {
  padIndex: number | null
  name?: string
  patch: TB303Patch
  onChange?: (changes: Partial<TB303Patch>) => void
}

export function TB303Controls({ padIndex, name, patch, onChange }: Props) {
  return (
    <S.Container>
      <S.TitleRow>
        <div>Selected Pad: {padIndex !== null ? padIndex + 1 : '-'}</div>
      </S.TitleRow>
      <S.Name>{name ?? 'TB-303 Synth'}</S.Name>
      
      <S.Section>
        <S.SectionTitle>Oscillator</S.SectionTitle>
        <S.WaveformButtons>
          <S.WaveformButton
            $active={patch.waveform === 'sawtooth'}
            onClick={() => onChange?.({ waveform: 'sawtooth' })}
          >
            Sawtooth
          </S.WaveformButton>
          <S.WaveformButton
            $active={patch.waveform === 'square'}
            onClick={() => onChange?.({ waveform: 'square' })}
          >
            Square
          </S.WaveformButton>
        </S.WaveformButtons>
      </S.Section>

      <S.Section>
        <S.SectionTitle>Filter (VCF)</S.SectionTitle>
        <S.KnobRow>
          <Knob
            label="Cutoff"
            min={0}
            max={1}
            step={0.01}
            value={patch.cutoff}
            onChange={(v) => onChange?.({ cutoff: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Knob
            label="Resonance"
            min={0}
            max={1}
            step={0.01}
            value={patch.resonance}
            onChange={(v) => onChange?.({ resonance: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Knob
            label="Env Mod"
            min={0}
            max={1}
            step={0.01}
            value={patch.envMod}
            onChange={(v) => onChange?.({ envMod: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </S.KnobRow>
      </S.Section>

      <S.Section>
        <S.SectionTitle>Envelope & Dynamics</S.SectionTitle>
        <S.KnobRow>
          <Knob
            label="Decay"
            min={0.01}
            max={2}
            step={0.01}
            value={patch.decay}
            onChange={(v) => onChange?.({ decay: v })}
            format={(v) => `${v.toFixed(2)}s`}
          />
          <Knob
            label="Accent"
            min={0}
            max={1}
            step={0.01}
            value={patch.accent}
            onChange={(v) => onChange?.({ accent: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Knob
            label="Volume"
            min={0}
            max={1}
            step={0.01}
            value={patch.volume}
            onChange={(v) => onChange?.({ volume: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </S.KnobRow>
        <S.KnobRow>
          <Knob
            label="Note Length"
            min={0.1}
            max={2}
            step={0.05}
            value={patch.noteLength}
            onChange={(v) => onChange?.({ noteLength: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </S.KnobRow>
      </S.Section>
    </S.Container>
  )
}

export default TB303Controls

