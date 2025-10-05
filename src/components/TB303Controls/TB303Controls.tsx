import { useEffect, useRef } from 'react'
import type { TB303Patch } from '../../audio/TB303Synth'
import { Knob } from '../Knob/Knob'
import * as S from './TB303Controls.styles'

type Props = {
  padIndex: number | null
  name?: string
  patch: TB303Patch
  onChange?: (changes: Partial<TB303Patch>) => void
  analyser?: AnalyserNode
}

export function TB303Controls({ padIndex, name, patch, onChange, analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Draw waveform and envelope
  useEffect(() => {
    if (!canvasRef.current || !analyser) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      const width = canvas.width
      const height = canvas.height

      // Clear with dark background
      ctx.fillStyle = 'rgba(10, 10, 15, 0.95)'
      ctx.fillRect(0, 0, width, height)

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw waveform
      ctx.lineWidth = 2
      ctx.strokeStyle = '#00ff88'
      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Draw ADSR envelope overlay
      drawEnvelope(ctx, width, height, patch)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [analyser, patch])

  const drawEnvelope = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    patch: TB303Patch
  ) => {
    const totalTime = patch.attack + patch.decay + 0.2 + patch.release
    const attackX = (patch.attack / totalTime) * width
    const decayX = ((patch.attack + patch.decay) / totalTime) * width
    const sustainX = ((patch.attack + patch.decay + 0.2) / totalTime) * width
    const releaseX = width

    const peakY = height * 0.1
    const sustainY = height * (1 - patch.sustain * 0.85)
    const baseY = height * 0.9

    // Draw envelope line
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, baseY)
    ctx.lineTo(attackX, peakY)
    ctx.lineTo(decayX, sustainY)
    ctx.lineTo(sustainX, sustainY)
    ctx.lineTo(releaseX, baseY)
    ctx.stroke()

    // Fill under envelope
    ctx.fillStyle = 'rgba(255, 200, 0, 0.15)'
    ctx.beginPath()
    ctx.moveTo(0, baseY)
    ctx.lineTo(attackX, peakY)
    ctx.lineTo(decayX, sustainY)
    ctx.lineTo(sustainX, sustainY)
    ctx.lineTo(releaseX, baseY)
    ctx.closePath()
    ctx.fill()

    // Draw labels
    ctx.fillStyle = 'rgba(255, 200, 0, 0.9)'
    ctx.font = '10px monospace'
    ctx.fillText('A', attackX - 5, height - 5)
    ctx.fillText('D', decayX - 5, height - 5)
    ctx.fillText('S', (decayX + sustainX) / 2, height - 5)
    ctx.fillText('R', sustainX + 10, height - 5)
  }

  return (
    <S.Container>
      <S.Header>
        <S.TitleRow>
          <S.Name>{name ?? 'TB-303 Bass Synthesizer'}</S.Name>
          <S.PadInfo>Pad {padIndex !== null ? padIndex + 1 : '-'}</S.PadInfo>
        </S.TitleRow>
        <S.Subtitle>Roland TB-303 Bassline Emulation</S.Subtitle>
      </S.Header>

      <S.VisualizerSection>
        <S.VisualizerTitle>Waveform & Envelope Display</S.VisualizerTitle>
        <S.VisualizerCanvas
          ref={canvasRef}
          width={600}
          height={180}
        />
      </S.VisualizerSection>

      <S.ControlGrid>
        <S.Section>
          <S.SectionTitle>Oscillator (VCO)</S.SectionTitle>
          <S.WaveformButtons>
            <S.WaveformButton
              $active={patch.waveform === 'sawtooth'}
              onClick={() => onChange?.({ waveform: 'sawtooth' })}
              title="Classic TB-303 sawtooth waveform"
            >
              <S.WaveIcon>⚡</S.WaveIcon>
              <span>Sawtooth</span>
            </S.WaveformButton>
            <S.WaveformButton
              $active={patch.waveform === 'square'}
              onClick={() => onChange?.({ waveform: 'square' })}
              title="Hollow square waveform"
            >
              <S.WaveIcon>▭</S.WaveIcon>
              <span>Square</span>
            </S.WaveformButton>
          </S.WaveformButtons>
          <S.KnobRow>
            <Knob
              label="Tune"
              min={-12}
              max={12}
              step={1}
              value={patch.tune}
              onChange={(v) => onChange?.({ tune: v })}
              format={(v) => `${v > 0 ? '+' : ''}${v}`}
            />
          </S.KnobRow>
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
          <S.SectionTitle>Envelope Generator (ADSR)</S.SectionTitle>
          <S.KnobRow>
            <Knob
              label="Attack"
              min={0.001}
              max={1}
              step={0.001}
              value={patch.attack}
              onChange={(v) => onChange?.({ attack: v })}
              format={(v) => `${(v * 1000).toFixed(0)}ms`}
            />
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
              label="Sustain"
              min={0}
              max={1}
              step={0.01}
              value={patch.sustain}
              onChange={(v) => onChange?.({ sustain: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Knob
              label="Release"
              min={0.01}
              max={2}
              step={0.01}
              value={patch.release}
              onChange={(v) => onChange?.({ release: v })}
              format={(v) => `${v.toFixed(2)}s`}
            />
          </S.KnobRow>
        </S.Section>

        <S.Section>
          <S.SectionTitle>Dynamics & Tone</S.SectionTitle>
          <S.KnobRow>
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
            <Knob
              label="Distortion"
              min={0}
              max={1}
              step={0.01}
              value={patch.distortion}
              onChange={(v) => onChange?.({ distortion: v })}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </S.KnobRow>
        </S.Section>

        <S.Section>
          <S.SectionTitle>Sequencer</S.SectionTitle>
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
      </S.ControlGrid>
    </S.Container>
  )
}

export default TB303Controls

