"use client"

import { useClipPlayer } from "@/hooks/use-clip-player"
import { usePatterns } from "@/hooks/use-patterns"
import { useTracks } from "@/hooks/use-tracks"
import type { Clip } from "@/lib/audio-engine"
import { AudioEngine } from "@/lib/audio-engine"
import { TrackManager } from "@/lib/track-manager"
import { Circle, Download, Edit, Grid3X3, Play, Plus, Repeat, Trash2 } from "lucide-react"
import type React from "react"
import { Fragment, useEffect, useState } from "react"
import styled from "styled-components"
import { PianoRoll } from "./piano-roll"
import { MASTER_COLOR, SEND_COLOR, SEND_TRACKS } from "./session-view-constants"

const SessionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
  overflow: auto;
`

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(8, 1fr) 1px repeat(2, 1fr) 2fr;
  grid-template-rows: auto 1fr auto;
  gap: 2px;
  padding: 16px;
  min-width: min-content;
  height: 100%;
`


const SceneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #1a1a1a;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
  min-height: 80px;
`

const TrackHeader = styled.div<{ $color: string; $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: ${(props) => (props.$selected ? '#2a2a2a' : '#1a1a1a')};
  border-radius: 4px;
  border-bottom: 3px solid ${(props) => props.$color};
  min-height: 60px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2a2a2a;
  }

  &:active {
    background: #333;
  }
`

const TrackName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
  text-align: center;
`

const TrackType = styled.div`
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  margin-top: 4px;
`

const ClipSlot = styled.div<{ $hasClip: boolean; $color?: string; $isPlaying?: boolean; $selected?: boolean }>`
  position: relative;
  min-height: 80px;
  background: ${(props) => {
    if (props.$selected) return "#2a2a2a";
    if (props.$hasClip) return props.$color;
    return "#1a1a1a";
  }};
  border: 2px solid ${(props) => {
    if (props.$isPlaying) return "#00d9ff";
    if (props.$hasClip) return props.$color;
    if (props.$selected) return "#555";
    return "#2a2a2a";
  }};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${(props) => (props.$hasClip ? "#00d9ff" : "#555")};
    background: ${(props) => {
      if (props.$selected) return "#333";
      if (props.$hasClip) return props.$color;
      return "#2a2a2a";
    }};
  }

  ${(props) =>
    props.$isPlaying &&
    `
    animation: pulse 0.5s ease-in-out infinite alternate;
  `}

  @keyframes pulse {
    from {
      box-shadow: 0 0 5px #00d9ff;
    }
    to {
      box-shadow: 0 0 15px #00d9ff;
    }
  }
`

const ClipContent = styled.div`
  padding: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ClipName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #0a0a0a;
  text-align: center;
  word-break: break-word;
`

const ClipActions = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;

  ${ClipSlot}:hover & {
    opacity: 1;
  }

  &.clip-actions {
    opacity: 1;
  }
`

const ClipActionButton = styled.button`
  padding: 4px;
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(10, 10, 10, 0.95);
    border-color: #00d9ff;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`

const EmptySlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 24px;
`

const SceneLaunchButton = styled.button`
  padding: 8px 16px;
  background: #00d9ff;
  color: #0a0a0a;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;

  &:hover {
    background: #00eaff;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`

const ClipBadges = styled.div`
  display: flex;
  gap: 2px;
  position: absolute;
  top: 4px;
  right: 4px;
`

const ClipBadge = styled.div<{ $active: boolean }>`
  padding: 2px 4px;
  background: rgba(10, 10, 10, 0.8);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$active ? 1 : 0.3)};

  svg {
    width: 10px;
    height: 10px;
    color: ${(props) => (props.$active ? "#00d9ff" : "#888")};
  }
`

const DropZone = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$isDragging ? "rgba(0, 217, 255, 0.2)" : "transparent")};
  border: ${(props) => (props.$isDragging ? "2px dashed #00d9ff" : "2px dashed transparent")};
  border-radius: 4px;
  pointer-events: ${(props) => (props.$isDragging ? "all" : "none")};
  transition: all 0.2s;
  
  span {
    color: #00d9ff;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: ${(props) => (props.$isDragging ? 1 : 0)};
  }
`

const MixerChannel = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 4px;
  padding: 12px 8px;
  gap: 8px;
  border-top: 3px solid ${(props) => props.$color};
  min-height: 280px;
`

const MixerLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-align: center;
  margin-bottom: 4px;
`

const ControlButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ControlButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 6px;
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

  &:hover {
    background: ${(props) => (props.$active ? props.$color || "#00eaff" : "#1a1a1a")};
    border-color: ${(props) => (props.$active ? props.$color || "#00eaff" : "#555")};
  }
`

const FaderContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`

const VolumeSlider = styled.input`
  writing-mode: bt-lr;
  -webkit-appearance: slider-vertical;
  width: 32px;
  height: 100px;
  cursor: pointer;
  background: transparent;
  margin: 0;

  &::-webkit-slider-runnable-track {
    width: 4px;
    height: 100%;
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
    margin: 0; /* ensure the thumb can reach both extremes */
  }

  &::-moz-range-track {
    width: 4px;
    height: 100%;
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

const VolumeDisplay = styled.div`
  font-size: 9px;
  color: #00d9ff;
  font-family: 'Geist Mono', monospace;
  text-align: center;
  min-height: 14px;
`

const MeterContainer = styled.div`
  width: 12px;
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

const PanContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`

const PanSlider = styled.input`
  width: 60px;
  cursor: pointer;
`

const PanLabel = styled.div`
  font-size: 9px;
  color: #888;
`

const MixerSpacer = styled.div`
  background: #0a0a0a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  span {
    font-size: 11px;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const SendSeparator = styled.div`
  background: #333;
  width: 1px;
  margin: 0 2px;
  height: 100%;
`

const SendTrackHeader = styled.div<{ $color: string; $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: ${(props) => (props.$selected ? '#2a2a2a' : '#1a1a1a')};
  border-radius: 4px;
  border-bottom: 3px solid ${(props) => props.$color};
  min-height: 60px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2a2a2a;
  }

  &:active {
    background: #333;
  }
`

const SendTrackSlot = styled.div<{ $selected?: boolean }>`
  position: relative;
  min-height: 80px;
  background: ${(props) => (props.$selected ? '#2a2a2a' : '#1a1a1a')};
  border: 2px solid ${(props) => (props.$selected ? '#555' : '#2a2a2a')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    background: ${(props) => (props.$selected ? '#333' : '#2a2a2a')};
    border-color: ${(props) => (props.$selected ? '#666' : '#555')};
  }
`

const SendLabel = styled.div`
  font-size: 10px;
  color: #888;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SendName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
  text-align: center;
`

const MasterChannel = styled.div`
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 4px;
  padding: 16px 12px;
  gap: 12px;
  border-top: 4px solid ${MASTER_COLOR};
  min-height: 280px;
  position: relative;
`

const MasterHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`

const MasterTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${MASTER_COLOR};
  text-transform: uppercase;
  letter-spacing: 1px;
`

const MasterSubtitle = styled.div`
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
`

const MasterFaderContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
`

const MasterMeterContainer = styled.div`
  width: 24px;
  height: 140px;
  background: #0a0a0a;
  border: 2px solid #333;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
`

const MasterMeterFill = styled.div<{ $level: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${(props) => props.$level}%;
  background: linear-gradient(
    to top,
    #00d9ff 0%,
    #00d9ff 70%,
    #f9ca24 70%,
    #f9ca24 85%,
    #ff4444 85%,
    #ff4444 100%
  );
  transition: height 0.05s;
`

const RecordButton = styled.button<{ $recording: boolean }>`
  padding: 10px;
  background: ${(props) => (props.$recording ? "#ff4444" : "#0a0a0a")};
  color: ${(props) => (props.$recording ? "#fff" : "#888")};
  border: 2px solid ${(props) => (props.$recording ? "#ff4444" : "#333")};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: ${(props) => (props.$recording ? "#ff3333" : "#1a1a1a")};
    border-color: ${(props) => (props.$recording ? "#ff3333" : "#00d9ff")};
  }

  ${(props) =>
    props.$recording &&
    `
    animation: recordPulse 1s ease-in-out infinite;
  `}

  @keyframes recordPulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const MasterVolumeDisplay = styled.div`
  font-size: 12px;
  color: #00d9ff;
  font-family: 'Geist Mono', monospace;
  text-align: center;
  font-weight: 600;
  min-height: 18px;
`

const EmptyMasterSlot = styled.div<{ $selected?: boolean }>`
  background: ${(props) => (props.$selected ? "#2a2a2a" : "#0a0a0a")};
  border: 2px solid ${(props) => (props.$selected ? "#555" : "transparent")};
  border-radius: 4px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$selected ? "#333" : "#1a1a1a")};
    border-color: ${(props) => (props.$selected ? "#666" : "#333")};
  }
`

interface SessionViewProps {
  selectedTrackId: string | null
  onTrackSelect: (trackId: string) => void
}

export function SessionView({ selectedTrackId, onTrackSelect }: SessionViewProps) {
  const { tracks, updateTrack, toggleMute, toggleSolo, toggleArm } = useTracks()
  const { patterns, createClip, deleteClip, getClipForTrackInPattern, updateClip } = usePatterns()
  const { playClip, stopClip, isPlaying } = useClipPlayer()
  const [editingClip, setEditingClip] = useState<Clip | null>(null)
  const [dragTarget, setDragTarget] = useState<{ trackId: string; patternId: string } | null>(null)
  const [trackManager] = useState(() => TrackManager.getInstance())
  const [audioEngine] = useState(() => AudioEngine.getInstance())
  const [meterLevels, setMeterLevels] = useState<Map<string, number>>(new Map())
  const [masterMeterLevel, setMasterMeterLevel] = useState(0)
  const [masterVolume, setMasterVolume] = useState(0.8)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const handleSlotDoubleClick = (trackId: string, patternId: string) => {
    const track = tracks.find((t) => t.id === trackId)
    const existingClip = getClipForTrackInPattern(trackId, patternId)
    
    // Open piano roll for MIDI clips (both existing and new)
    if (track?.type === "midi") {
    if (existingClip) {
      setEditingClip(existingClip)
      } else {
        // Create a new MIDI clip and open piano roll
        const newClip = createClip(trackId, patternId, `${track.name} Clip`)
        setEditingClip(newClip)
      }
    }
  }

  const handleSlotClick = async (trackId: string, patternId: string) => {
    const existingClip = getClipForTrackInPattern(trackId, patternId)

    if (existingClip) {
      if (isPlaying(existingClip.id)) {
        stopClip(existingClip.id)
      } else {
        await playClip(existingClip)
      }
    } else {
      const track = tracks.find((t) => t.id === trackId)
      if (track) {
        const clip = createClip(trackId, patternId, `${track.name} Clip`)
        await playClip(clip)
      }
    }
  }

  const handleDeleteClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation()
    stopClip(clipId)
    deleteClip(clipId)
  }

  const handleEditClip = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation()
    setEditingClip(clip)
  }

  const handleSceneLaunch = async (patternId: string) => {
    const pattern = patterns.find((p) => p.id === patternId)
    if (!pattern) return

    for (const clip of pattern.clips) {
      await playClip(clip)
    }
  }

  const handleDragOver = (e: React.DragEvent, trackId: string, patternId: string) => {
    e.preventDefault()
    const track = tracks.find((t) => t.id === trackId)
    if (track?.type === "audio") {
      setDragTarget({ trackId, patternId })
    }
  }

  const handleDragLeave = () => {
    setDragTarget(null)
  }

  const handleDrop = async (e: React.DragEvent, trackId: string, patternId: string) => {
    e.preventDefault()
    setDragTarget(null)

    const track = tracks.find((t) => t.id === trackId)
    if (track?.type !== "audio") return

    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find((f) => f.type.startsWith("audio/"))
    
    if (audioFile) {
      let clip = getClipForTrackInPattern(trackId, patternId)
      
      if (!clip) {
        clip = createClip(trackId, patternId, audioFile.name)
      }

      await trackManager.loadAudioToClip(clip.id, audioFile)
      
      // Update clip settings for audio
      updateClip(clip.id, {
        loop: true,
        quantize: true,
        quantizeValue: 4, // 1 bar quantization
      })
    }
  }

  const handleToggleLoop = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation()
    updateClip(clip.id, { loop: !clip.loop })
  }

  const handleToggleQuantize = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation()
    updateClip(clip.id, { quantize: !clip.quantize })
  }

  // format linear gain [0..2] where 1.0 = 0 dB and 2.0 = +6 dB
  const formatVolume = (linear: number) => {
    const db = linear === 0 ? Number.NEGATIVE_INFINITY : 20 * Math.log10(linear)
    return db === Number.NEGATIVE_INFINITY ? "-∞" : `${db.toFixed(1)}`
  }

  const formatPan = (pan: number) => {
    if (pan === 0) return "C"
    if (pan < 0) return `L${Math.abs(Math.round(pan * 100))}`
    return `R${Math.round(pan * 100)}`
  }

  const handleVolumeChange = (trackId: string, value: number) => {
    updateTrack(trackId, { volume: value })
  }

  const handlePanChange = (trackId: string, value: number) => {
    updateTrack(trackId, { pan: value })
  }

  // Real-time VU meters using AnalyserNode
  useEffect(() => {
    const interval = setInterval(() => {
      const newLevels = new Map<string, number>()
      
      // Simulate track meters (will be replaced with per-track analysers later)
      tracks.forEach((track) => {
        const hasActiveClips = track.clips.some((clip) => isPlaying(clip.id))
        
        if (hasActiveClips && !track.mute) {
          const randomLevel = 0.6 + Math.random() * 0.3
          newLevels.set(track.id, randomLevel * track.volume * 100)
        } else {
          newLevels.set(track.id, 0)
        }
      })
      
      setMeterLevels(newLevels)

      // Real master meter from AnalyserNode
      const masterAnalyser = audioEngine.getMasterAnalyser()
      if (masterAnalyser) {
        const dataArray = new Uint8Array(masterAnalyser.frequencyBinCount)
        masterAnalyser.getByteFrequencyData(dataArray)
        
        // Calculate RMS for more accurate metering
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = dataArray[i] / 255
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / dataArray.length)
        const level = Math.min(100, rms * 200) // Scale to 0-100%
        
        setMasterMeterLevel(level)
      }
    }, 50) // 20fps update rate

    return () => clearInterval(interval)
  }, [tracks, isPlaying, audioEngine])

  // Handle master volume changes
  const handleMasterVolumeChange = (linear: number) => {
    setMasterVolume(linear)
    if (audioEngine.masterGain) {
      audioEngine.masterGain.gain.setTargetAtTime(linear, audioEngine.getCurrentTime(), 0.01)
    }
  }

  // Recording functions
  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        const blob = await audioEngine.stopRecording()
        setRecordedBlob(blob)
        setIsRecording(false)
      } catch (error) {
        console.error('Failed to stop recording:', error)
      }
    } else {
      try {
        await audioEngine.startRecording()
        setIsRecording(true)
        setRecordedBlob(null)
      } catch (error) {
        console.error('Failed to start recording:', error)
      }
    }
  }

  const handleDownloadRecording = () => {
    if (recordedBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      audioEngine.downloadRecording(recordedBlob, `master-${timestamp}.webm`)
    }
  }

  return (
    <>
      <SessionContainer>
        <SessionGrid>
          {/* Header Row */}
          <div />
          {/* Main Tracks */}
          {tracks.map((track) => (
            <TrackHeader
              key={track.id}
              $color={track.color}
              $selected={selectedTrackId === track.id}
              onClick={() => onTrackSelect(track.id)}
            >
              <TrackName>{track.name}</TrackName>
              <TrackType>{track.type}</TrackType>
            </TrackHeader>
          ))}
          <SendSeparator />
          {/* Send Tracks */}
          {SEND_TRACKS.map((send) => (
            <SendTrackHeader
              key={send.id}
              $color={SEND_COLOR}
              $selected={selectedTrackId === send.id}
              onClick={() => onTrackSelect(send.id)}
            >
              <SendName>{send.name}</SendName>
              <SendLabel>{send.label}</SendLabel>
            </SendTrackHeader>
          ))}
          <TrackHeader $color={MASTER_COLOR}>
            <TrackName>MASTER</TrackName>
            <TrackType>Output</TrackType>
          </TrackHeader>

          {/* Clips Area */}
          {patterns.map((pattern) => (
            <Fragment key={`row-${pattern.id}`}>
              <SceneHeader key={`scene-${pattern.id}`}>
                <span>{pattern.name}</span>
                <SceneLaunchButton onClick={() => handleSceneLaunch(pattern.id)}>
                  <Play size={12} fill="currentColor" />
                </SceneLaunchButton>
              </SceneHeader>
              {/* Main Track Slots */}
              {tracks.map((track) => {
                const clip = getClipForTrackInPattern(track.id, pattern.id)
                const playing = clip ? isPlaying(clip.id) : false
                const isDragging =
                  dragTarget?.trackId === track.id && dragTarget?.patternId === pattern.id

                return (
                  <ClipSlot
                    key={`${pattern.id}-${track.id}`}
                    $hasClip={!!clip}
                    $color={track.color}
                    $isPlaying={playing}
                    $selected={selectedTrackId === track.id}
                    onClick={(e) => {
                      // Only select track if not clicking on clip actions
                      if (!(e.target as Element).closest('.clip-actions')) {
                        onTrackSelect(track.id);
                      }
                      handleSlotClick(track.id, pattern.id);
                    }}
                    onDoubleClick={() => handleSlotDoubleClick(track.id, pattern.id)}
                    onDragOver={(e) => handleDragOver(e, track.id, pattern.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, track.id, pattern.id)}
                  >
                    {clip ? (
                      <ClipContent>
                        {track.type === "audio" && (
                          <ClipBadges>
                            <ClipBadge
                              $active={!!clip.loop}
                              onClick={(e) => handleToggleLoop(e, clip)}
                              title={clip.loop ? "Loop enabled" : "Loop disabled"}
                            >
                              <Repeat />
                            </ClipBadge>
                            <ClipBadge
                              $active={!!clip.quantize}
                              onClick={(e) => handleToggleQuantize(e, clip)}
                              title={clip.quantize ? "Quantize enabled" : "Quantize disabled"}
                            >
                              <Grid3X3 />
                            </ClipBadge>
                          </ClipBadges>
                        )}
                        <ClipName>{clip.name}</ClipName>
                        <ClipActions className="clip-actions">
                          {track.type === "midi" && (
                            <ClipActionButton onClick={(e) => handleEditClip(e, clip)}>
                              <Edit />
                            </ClipActionButton>
                          )}
                          <ClipActionButton onClick={(e) => handleDeleteClip(e, clip.id)}>
                            <Trash2 />
                          </ClipActionButton>
                        </ClipActions>
                      </ClipContent>
                    ) : (
                      <>
                      <EmptySlot>
                        <Plus size={20} />
                      </EmptySlot>
                        {track.type === "audio" && (
                          <DropZone $isDragging={isDragging}>
                            <span>Drop Audio File</span>
                          </DropZone>
                        )}
                      </>
                    )}
                  </ClipSlot>
                )
              })}
              <SendSeparator key={`sep-${pattern.id}`} />
              {/* Send Track Slots */}
              {SEND_TRACKS.map((send) => (
                <SendTrackSlot
                  key={`${send.id}-${pattern.id}`}
                  $selected={selectedTrackId === send.id}
                  onClick={() => onTrackSelect(send.id)}
                >
                  <div style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
                    {send.name}
                    <br />
                    <small style={{ fontSize: '10px' }}>{send.label}</small>
                  </div>
                </SendTrackSlot>
              ))}
              {/* Empty master slot for this pattern */}
              <EmptyMasterSlot key={`master-${pattern.id}`}>Master Bus</EmptyMasterSlot>
            </Fragment>
          ))}

          {/* Mixer Row */}
          <MixerSpacer>
            <span>Mixer</span>
          </MixerSpacer>
          {/* Main Track Mixer Channels */}
          {tracks.map((track) => (
            <MixerChannel key={`mixer-${track.id}`} $color={track.color}>
              <ControlButtons>
                <ControlButton
                  $active={track.arm}
                  $color="#ff4444"
                  onClick={() => toggleArm(track.id)}
                  title="Arm for recording"
                >
                  <Circle size={8} fill={track.arm ? "currentColor" : "none"} /> ARM
                </ControlButton>
                <ControlButton
                  $active={track.solo}
                  $color="#f9ca24"
                  onClick={() => toggleSolo(track.id)}
                  title="Solo track"
                >
                  S
                </ControlButton>
                <ControlButton
                  $active={track.mute}
                  $color="#888"
                  onClick={() => toggleMute(track.id)}
                  title="Mute track"
                >
                  M
                </ControlButton>
              </ControlButtons>

              <FaderContainer>
                <MeterContainer>
                  <MeterFill $level={meterLevels.get(track.id) || 0} $color={track.color} />
                </MeterContainer>
                <VolumeSlider
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={track.volume}
                  onChange={(e) => handleVolumeChange(track.id, Number.parseFloat(e.target.value))}
                />
                <VolumeDisplay>{formatVolume(track.volume)} dB</VolumeDisplay>
              </FaderContainer>

              <PanContainer>
                <MixerLabel>Pan</MixerLabel>
                <PanSlider
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={track.pan}
                  onChange={(e) => handlePanChange(track.id, Number.parseFloat(e.target.value))}
                />
                <PanLabel>{formatPan(track.pan)}</PanLabel>
              </PanContainer>
            </MixerChannel>
          ))}
          <SendSeparator />
          {/* Send Mixer Channels */}
          {SEND_TRACKS.map((send) => (
            <MixerChannel key={`mixer-${send.id}`} $color={SEND_COLOR}>
              <ControlButtons>
                <ControlButton
                  $active={false}
                  $color={SEND_COLOR}
                  onClick={() => {}}
                  title={`${send.name} - ${send.label}`}
                >
                  {send.name}
                </ControlButton>
              </ControlButtons>

              <FaderContainer>
                <MeterContainer>
                  <MeterFill $level={0} $color={SEND_COLOR} />
                </MeterContainer>
                <VolumeSlider
                  type="range"
                min="0"
                max="2"
                  step="0.01"
                  value={0.8}
                  onChange={() => {}}
                />
                <VolumeDisplay>0.0 dB</VolumeDisplay>
              </FaderContainer>

              <PanContainer>
                <MixerLabel>{send.name}</MixerLabel>
                <PanSlider
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={0}
                  onChange={() => {}}
                />
                <PanLabel>C</PanLabel>
              </PanContainer>
            </MixerChannel>
          ))}
          {/* Master Channel */}
          <MasterChannel>
            <MasterHeader>
              <MasterTitle>MASTER</MasterTitle>
              <MasterSubtitle>Final Output</MasterSubtitle>
            </MasterHeader>

            <MasterFaderContainer>
              <MasterMeterContainer>
                <MasterMeterFill $level={masterMeterLevel} />
              </MasterMeterContainer>

              <VolumeSlider
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={masterVolume}
                onChange={(e) => handleMasterVolumeChange(Number.parseFloat(e.target.value))}
              />
            </MasterFaderContainer>

            <MasterVolumeDisplay>{formatVolume(masterVolume)} dB</MasterVolumeDisplay>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <RecordButton
                $recording={isRecording}
                onClick={handleToggleRecording}
                title={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <Circle size={isRecording ? 16 : 20} fill={isRecording ? 'currentColor' : 'none'} />
              </RecordButton>

              {recordedBlob && (
                <ControlButton
                  onClick={handleDownloadRecording}
                  style={{ width: '100%', padding: '8px' }}
                  title="Download recording"
                >
                  <Download size={12} /> Save
                </ControlButton>
              )}
            </div>
          </MasterChannel>
        </SessionGrid>
      </SessionContainer>
      {editingClip && <PianoRoll clip={editingClip} onClose={() => setEditingClip(null)} />}
    </>
  )
}
