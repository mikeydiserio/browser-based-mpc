"use client"

import { useTracks } from "@/hooks/use-tracks"
import { Circle, Sliders, Volume2 } from "lucide-react"
import { useState } from "react"
import styled from "styled-components"
import { EffectsPanel } from "./effects-panel"

const MixerContainer = styled.div`
  display: flex;
  gap: 2px;
  padding: 16px;
  background: #0a0a0a;
  overflow-x: auto;
  border-top: 1px solid #333;
  min-height: 300px;
`

const TrackChannel = styled.div`
  display: flex;
  flex-direction: column;
  width: 80px;
  background: #1a1a1a;
  border-radius: 4px;
  padding: 12px 8px;
  gap: 12px;
`

const TrackHeader = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 2px solid ${(props) => props.$color};
`

const TrackName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TrackType = styled.div`
  font-size: 9px;
  color: #888;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const FaderContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
`

// const FaderTrack = styled.div`
//   flex: 1;
//   width: 4px;
//   background: #333;
//   border-radius: 2px;
//   position: relative;
// `

// const FaderThumb = styled.div<{ $position: number }>`
//   position: absolute;
//   bottom: ${(props) => props.$position}%;
//   left: 50%;
//   transform: translateX(-50%);
//   width: 24px;
//   height: 12px;
//   background: #00d9ff;
//   border-radius: 2px;
//   cursor: pointer;
//   transition: background 0.2s;

//   &:hover {
//     background: #00eaff;
//   }
// `

const VolumeInput = styled.input`
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 32px;
  height: 120px;
  cursor: pointer;
  background: transparent;

  &::-webkit-slider-runnable-track {
    width: 4px;
    background: #333;
    border-radius: 2px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 12px;
    background: #00d9ff;
    border-radius: 2px;
    cursor: pointer;
  }

  &::-moz-range-track {
    width: 4px;
    background: #333;
    border-radius: 2px;
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 12px;
    background: #00d9ff;
    border-radius: 2px;
    border: none;
    cursor: pointer;
  }
`


const PanLabel = styled.div`
  font-size: 9px;
  color: #888;
  text-align: center;
`

const ControlButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ControlButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 4px;
  background: ${(props) => (props.$active ? props.$color || "#00d9ff" : "#0a0a0a")};
  color: ${(props) => (props.$active ? "#0a0a0a" : "#888")};
  border: 1px solid ${(props) => (props.$active ? props.$color || "#00d9ff" : "#333")};
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;

  &:hover {
    background: ${(props) => (props.$active ? props.$color || "#00eaff" : "#1a1a1a")};
    border-color: ${(props) => (props.$active ? props.$color || "#00eaff" : "#555")};
  }

  svg {
    width: 10px;
    height: 10px;
  }
`

const VolumeDisplay = styled.div`
  font-size: 10px;
  color: #00d9ff;
  font-family: 'Geist Mono', monospace;
  text-align: center;
`

const MeterContainer = styled.div`
  width: 8px;
  height: 80px;
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
`

const MeterFill = styled.div<{ $level: number; $color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.$level}%;
  background: ${(props) => props.$color};
  transition: height 0.05s;
`

export function Mixer() {
  const { tracks, updateTrack, toggleMute, toggleSolo, toggleArm } = useTracks()
  const [effectsPanelTrack, setEffectsPanelTrack] = useState<string | null>(null)

  const handleVolumeChange = (trackId: string, value: number) => {
    updateTrack(trackId, { volume: value })
  }

  const handlePanChange = (trackId: string, value: number) => {
    updateTrack(trackId, { pan: value })
  }

  const formatVolume = (volume: number) => {
    const db = volume === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(volume)
    return db === Number.NEGATIVE_INFINITY ? "-∞" : `${db.toFixed(1)}`
  }

  const formatPan = (pan: number) => {
    if (pan === 0) return "C"
    if (pan < 0) return `L${Math.abs(Math.round(pan * 100))}`
    return `R${Math.round(pan * 100)}`
  }

  return (
    <>
      <MixerContainer>
        {tracks.map((track) => (
          <TrackChannel key={track.id}>
            <TrackHeader $color={track.color}>
              <TrackName>{track.name}</TrackName>
              <TrackType>{track.type}</TrackType>
            </TrackHeader>

            <ControlButtons>
              <ControlButton $active={track.arm} $color="#ff4444" onClick={() => toggleArm(track.id)}>
                <Circle size={8} fill={track.arm ? "currentColor" : "none"} /> Arm
              </ControlButton>
              <ControlButton $active={track.solo} $color="#f9ca24" onClick={() => toggleSolo(track.id)}>
                S
              </ControlButton>
              <ControlButton $active={track.mute} $color="#888" onClick={() => toggleMute(track.id)}>
                M
              </ControlButton>
              <ControlButton
                $active={effectsPanelTrack === track.id}
                onClick={() => setEffectsPanelTrack(effectsPanelTrack === track.id ? null : track.id)}
              >
                <Sliders size={10} /> FX
              </ControlButton>
            </ControlButtons>

            <FaderContainer>
              <VolumeDisplay>{formatVolume(track.volume)} dB</VolumeDisplay>
              <VolumeInput
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={track.volume}
                onChange={(e) => handleVolumeChange(track.id, Number.parseFloat(e.target.value))}
              />
              <Volume2 size={12} color="#888" />
            </FaderContainer>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <PanLabel>Pan</PanLabel>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={track.pan}
                onChange={(e) => handlePanChange(track.id, Number.parseFloat(e.target.value))}
                style={{ width: "60px" }}
              />
              <PanLabel>{formatPan(track.pan)}</PanLabel>
            </div>

            <MeterContainer>
              <MeterFill $level={track.mute ? 0 : track.volume * 80} $color={track.color} />
            </MeterContainer>
          </TrackChannel>
        ))}
      </MixerContainer>

      {effectsPanelTrack && (
        <EffectsPanel
          trackId={effectsPanelTrack}
          isOpen={!!effectsPanelTrack}
          onClose={() => setEffectsPanelTrack(null)}
        />
      )}
    </>
  )
}
