"use client"

import styled from "styled-components"
import { useTransport } from "@/hooks/use-transport"
import { Play, Pause, Square, Circle } from "lucide-react"

const TransportContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #0a0a0a;
  border-bottom: 1px solid #333;
`

const TransportButton = styled.button<{ $active?: boolean; $variant?: "stop" | "record" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background: ${(props) => {
    if (props.$variant === "stop") return "#1a1a1a"
    if (props.$variant === "record") return props.$active ? "#ff4444" : "#1a1a1a"
    return props.$active ? "#00d9ff" : "#1a1a1a"
  }};
  color: ${(props) => {
    if (props.$variant === "record" && props.$active) return "#fff"
    if (props.$active) return "#0a0a0a"
    return "#e0e0e0"
  }};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => {
      if (props.$variant === "stop") return "#2a2a2a"
      if (props.$variant === "record") return props.$active ? "#ff5555" : "#2a2a2a"
      return props.$active ? "#00eaff" : "#2a2a2a"
    }};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const TempoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 24px;
`

const TempoLabel = styled.span`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TempoInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 14px;
  font-family: 'Geist Mono', monospace;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #00d9ff;
  }
`

const BPMLabel = styled.span`
  font-size: 12px;
  color: #888;
`

const MetronomeButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.$active ? "#00d9ff" : "#1a1a1a")};
  color: ${(props) => (props.$active ? "#0a0a0a" : "#e0e0e0")};
  border: 1px solid ${(props) => (props.$active ? "#00d9ff" : "#333")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 12px;

  &:hover {
    background: ${(props) => (props.$active ? "#00eaff" : "#2a2a2a")};
  }
`

const TimeDisplay = styled.div`
  margin-left: auto;
  padding: 8px 16px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  font-family: 'Geist Mono', monospace;
  font-size: 14px;
  color: #00d9ff;
  min-width: 120px;
  text-align: center;
`

export function TransportControls() {
  const transport = useTransport()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }

  return (
    <TransportContainer>
      <TransportButton
        onClick={transport.togglePlay}
        $active={transport.isPlaying}
        title={transport.isPlaying ? "Pause" : "Play"}
      >
        {transport.isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
      </TransportButton>

      <TransportButton onClick={transport.stop} $variant="stop" title="Stop">
        <Square fill="currentColor" />
      </TransportButton>

      <TransportButton
        onClick={transport.toggleRecord}
        $active={transport.isRecording}
        $variant="record"
        title="Record"
      >
        <Circle fill="currentColor" />
      </TransportButton>

      <TempoContainer>
        <TempoLabel>Tempo</TempoLabel>
        <TempoInput
          type="number"
          min="20"
          max="999"
          value={transport.tempo}
          onChange={(e) => transport.setTempo(Number(e.target.value))}
        />
        <BPMLabel>BPM</BPMLabel>
      </TempoContainer>

      <MetronomeButton onClick={transport.toggleMetronome} $active={transport.metronomeEnabled}>
        Metronome: {transport.metronomeEnabled ? "On" : "Off"}
      </MetronomeButton>

      <TimeDisplay>{formatTime(transport.currentTime)}</TimeDisplay>
    </TransportContainer>
  )
}
