"use client"

import type React from "react"

import type { SamplePad } from "@/lib/sample-pad-manager"
import { Upload } from "lucide-react"
import { useEffect, useRef } from "react"
import styled from "styled-components"
import { FXChainPanel } from "./fx-chain-panel"

const EditorContainer = styled.div`
  display: flex;
  gap: 16px;
  height: 100%;
`

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const RightPanel = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const SampleHeader = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px 16px;
`

const SampleName = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
`

const SampleTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
`

const ControlButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`

const ControlButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  background: ${(props) => (props.$active ? "#00d9ff" : "#1a1a1a")};
  border: 1px solid ${(props) => (props.$active ? "#00d9ff" : "#333")};
  border-radius: 4px;
  color: ${(props) => (props.$active ? "#0a0a0a" : "#e0e0e0")};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#00eaff" : "#2a2a2a")};
    border-color: #00d9ff;
  }
`

const WaveformContainer = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`

const WaveformCanvas = styled.canvas`
  width: 100%;
  height: 200px;
  background: #0a0a0a;
  border-radius: 4px;
`

const WaveformInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 10px;
  color: #888;
`

const KnobsContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
`

const KnobControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const KnobLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
`

const KnobValue = styled.div`
  font-size: 12px;
  color: #00d9ff;
  font-weight: 600;
`

const Knob = styled.div<{ $rotation: number }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #333;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #00d9ff;
  }

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 50%;
    width: 2px;
    height: 16px;
    background: #00d9ff;
    transform: translateX(-50%) rotate(${(props) => props.$rotation}deg);
    transform-origin: center 20px;
  }
`

const ADSRContainer = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 16px;
`

const ADSRTitle = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
  text-transform: uppercase;
`

const ADSRKnobs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`

const ADSRKnob = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const ADSRKnobLabel = styled.div`
  font-size: 10px;
  color: #888;
`

const ADSRKnobValue = styled.div`
  font-size: 11px;
  color: #e0e0e0;
`

const ADSRSlider = styled.input`
  width: 100%;
  height: 4px;
  background: #333;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #00d9ff;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: #00d9ff;
    border-radius: 50%;
    border: none;
    cursor: pointer;
  }
`

const EQContainer = styled.div`
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 16px;
`

const EQTitle = styled.div`
  font-size: 11px;
  color: #888;
  margin-bottom: 12px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
`

const EQBands = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`

const EQBand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const EQBandLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-align: center;
`

const EQBandValue = styled.div`
  font-size: 10px;
  color: #e0e0e0;
  text-align: center;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  gap: 16px;
`

const UploadButton = styled.label`
  padding: 12px 24px;
  background: #1a1a1a;
  border: 1px dashed #333;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  transition: all 0.2s;

  &:hover {
    background: #2a2a2a;
    border-color: #00d9ff;
    color: #00d9ff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const HiddenInput = styled.input`
  display: none;
`

interface SampleEditorProps {
  pad: SamplePad | null
  onUpdate: (id: string, updates: Partial<SamplePad>) => void
  onLoadSample: (file: File) => void
}

export function SampleEditor({ pad, onUpdate, onLoadSample }: SampleEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)


  useEffect(() => {
    if (!pad || !pad.audioBuffer || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Draw waveform
    const data = pad.audioBuffer.getChannelData(0)
    const step = Math.ceil(data.length / rect.width)
    const amp = rect.height / 2

    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw waveform
    ctx.strokeStyle = "#00d9ff"
    ctx.lineWidth = 1
    ctx.beginPath()

    for (let i = 0; i < rect.width; i++) {
      const min = Math.min(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0))
      const max = Math.max(...Array.from({ length: step }, (_, j) => data[i * step + j] || 0))

      ctx.moveTo(i, (1 + min) * amp)
      ctx.lineTo(i, (1 + max) * amp)
    }

    ctx.stroke()

    // Draw ADSR envelope overlay
    const duration = pad.audioBuffer.duration
    const attackX = (pad.adsr.attack / duration) * rect.width
    const decayX = ((pad.adsr.attack + pad.adsr.decay) / duration) * rect.width

    ctx.strokeStyle = "rgba(255, 140, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, rect.height)
    ctx.lineTo(attackX, 20)
    ctx.lineTo(decayX, 20 + (rect.height - 40) * (1 - pad.adsr.sustain))
    ctx.lineTo(rect.width - 50, 20 + (rect.height - 40) * (1 - pad.adsr.sustain))
    ctx.lineTo(rect.width, rect.height)
    ctx.stroke()
  }, [pad])

  const handleKnobDrag = (knobType: "gain" | "pitch" | "velocityToVolume", e: React.MouseEvent) => {
    if (!pad) return

    const startY = e.clientY
    const startValue = knobType === "gain" ? pad.gain : knobType === "pitch" ? pad.pitch : pad.velocityToVolume

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = (startY - moveEvent.clientY) * 0.01
      let newValue = startValue + delta

      if (knobType === "gain" || knobType === "velocityToVolume") {
        newValue = Math.max(0, Math.min(1, newValue))
      } else if (knobType === "pitch") {
        newValue = Math.max(-12, Math.min(12, newValue))
      }

      onUpdate(pad.id, { [knobType]: newValue })
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onLoadSample(file)
    }
  }

  if (!pad) {
    return (
      <EmptyState>
        <div>No sample selected</div>
        <UploadButton>
          <Upload />
          Load Sample
          <HiddenInput type="file" accept="audio/*" onChange={handleFileChange} />
        </UploadButton>
      </EmptyState>
    )
  }

  const getKnobRotation = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 270 - 135
  }

  return (
    <EditorContainer>
      <LeftPanel>
        <SampleHeader>
          <SampleName>Selected Pad</SampleName>
          <SampleTitle>{pad.name}</SampleTitle>
          <ControlButtons>
            <ControlButton $active={pad.warp} onClick={() => onUpdate(pad.id, { warp: !pad.warp })}>
              WARP
            </ControlButton>
            <ControlButton $active={pad.quantize} onClick={() => onUpdate(pad.id, { quantize: !pad.quantize })}>
              QUANTIZE
            </ControlButton>
            <ControlButton $active={pad.loop} onClick={() => onUpdate(pad.id, { loop: !pad.loop })}>
              LOOP
            </ControlButton>
            <ControlButton $active={pad.hold} onClick={() => onUpdate(pad.id, { hold: !pad.hold })}>
              HOLD
            </ControlButton>
          </ControlButtons>
        </SampleHeader>

        <WaveformContainer>
          <WaveformCanvas ref={canvasRef} />
          <WaveformInfo>
            <div>Length: {pad.audioBuffer?.duration.toFixed(2)}s</div>
            <div>Rate: {pad.audioBuffer?.sampleRate} Hz</div>
            <div>Channels: {pad.audioBuffer?.numberOfChannels}</div>
          </WaveformInfo>

          <KnobsContainer>
            <KnobControl>
              <KnobLabel>Gain</KnobLabel>
              <Knob $rotation={getKnobRotation(pad.gain, 0, 1)} onMouseDown={(e) => handleKnobDrag("gain", e)} />
              <KnobValue>{Math.round(pad.gain * 100)}%</KnobValue>
            </KnobControl>

            <KnobControl>
              <KnobLabel>Pitch</KnobLabel>
              <Knob $rotation={getKnobRotation(pad.pitch, -12, 12)} onMouseDown={(e) => handleKnobDrag("pitch", e)} />
              <KnobValue>
                {pad.pitch > 0 ? "+" : ""}
                {pad.pitch.toFixed(1)} st
              </KnobValue>
            </KnobControl>

            <KnobControl>
              <KnobLabel>Vel → Vol</KnobLabel>
              <Knob
                $rotation={getKnobRotation(pad.velocityToVolume, 0, 1)}
                onMouseDown={(e) => handleKnobDrag("velocityToVolume", e)}
              />
              <KnobValue>{Math.round(pad.velocityToVolume * 100)}%</KnobValue>
            </KnobControl>
          </KnobsContainer>
        </WaveformContainer>

        <ADSRContainer>
          <ADSRTitle>ADSR Envelope</ADSRTitle>
          <ADSRKnobs>
            <ADSRKnob>
              <ADSRKnobLabel>Attack</ADSRKnobLabel>
              <ADSRSlider
                type="range"
                min="0"
                max="2"
                step="0.001"
                value={pad.adsr.attack}
                onChange={(e) =>
                  onUpdate(pad.id, {
                    adsr: { ...pad.adsr, attack: Number.parseFloat(e.target.value) },
                  })
                }
              />
              <ADSRKnobValue>{pad.adsr.attack.toFixed(3)}s</ADSRKnobValue>
            </ADSRKnob>

            <ADSRKnob>
              <ADSRKnobLabel>Decay</ADSRKnobLabel>
              <ADSRSlider
                type="range"
                min="0"
                max="2"
                step="0.001"
                value={pad.adsr.decay}
                onChange={(e) =>
                  onUpdate(pad.id, {
                    adsr: { ...pad.adsr, decay: Number.parseFloat(e.target.value) },
                  })
                }
              />
              <ADSRKnobValue>{pad.adsr.decay.toFixed(3)}s</ADSRKnobValue>
            </ADSRKnob>

            <ADSRKnob>
              <ADSRKnobLabel>Sustain</ADSRKnobLabel>
              <ADSRSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pad.adsr.sustain}
                onChange={(e) =>
                  onUpdate(pad.id, {
                    adsr: { ...pad.adsr, sustain: Number.parseFloat(e.target.value) },
                  })
                }
              />
              <ADSRKnobValue>{pad.adsr.sustain.toFixed(2)}</ADSRKnobValue>
            </ADSRKnob>

            <ADSRKnob>
              <ADSRKnobLabel>Release</ADSRKnobLabel>
              <ADSRSlider
                type="range"
                min="0"
                max="2"
                step="0.001"
                value={pad.adsr.release}
                onChange={(e) =>
                  onUpdate(pad.id, {
                    adsr: { ...pad.adsr, release: Number.parseFloat(e.target.value) },
                  })
                }
              />
              <ADSRKnobValue>{pad.adsr.release.toFixed(3)}s</ADSRKnobValue>
            </ADSRKnob>
          </ADSRKnobs>
        </ADSRContainer>
      </LeftPanel>

      <RightPanel>
        <FXChainPanel slots={6} />

        <EQContainer>
          <EQTitle>Parametric EQ (6 Bands)</EQTitle>
          <EQBands>
            {pad.eq.bands.map((band, index) => (
              <EQBand key={index}>
                <EQBandLabel>
                  {index === 0
                    ? "LOW"
                    : index === 1
                      ? "LO-MID"
                      : index === 2
                        ? "MID"
                        : index === 3
                          ? "HI-MID"
                          : index === 4
                            ? "HIGH"
                            : "AIR"}
                </EQBandLabel>
                <EQBandValue>Freq: {band.frequency}Hz</EQBandValue>
                <ADSRSlider
                  type="range"
                  min="-12"
                  max="12"
                  step="0.1"
                  value={band.gain}
                  onChange={(e) => {
                    const newBands = [...pad.eq.bands]
                    newBands[index] = { ...band, gain: Number.parseFloat(e.target.value) }
                    onUpdate(pad.id, { eq: { bands: newBands } })
                  }}
                />
                <EQBandValue>Gain: {band.gain.toFixed(1)} dB</EQBandValue>
                <ADSRSlider
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={band.q}
                  onChange={(e) => {
                    const newBands = [...pad.eq.bands]
                    newBands[index] = { ...band, q: Number.parseFloat(e.target.value) }
                    onUpdate(pad.id, { eq: { bands: newBands } })
                  }}
                />
                <EQBandValue>Q: {band.q.toFixed(1)}</EQBandValue>
              </EQBand>
            ))}
          </EQBands>
        </EQContainer>
      </RightPanel>
    </EditorContainer>
  )
}
