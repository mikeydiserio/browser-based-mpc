"use client"

import type React from "react"

import { useArrangement } from "@/hooks/use-arrangement"
import { useTracks } from "@/hooks/use-tracks"
import { useTransport } from "@/hooks/use-transport"
import type { ArrangementClip } from "@/lib/arrangement-manager"
import { Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const ArrangementContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
  overflow: hidden;
`

const TimelineHeader = styled.div`
  display: flex;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 10;
`

const TrackLabels = styled.div`
  width: 120px;
  background: #1a1a1a;
  border-right: 1px solid #333;
`

const TimeRuler = styled.div`
  flex: 1;
  height: 40px;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
`

const TimeMarker = styled.div<{ $position: number }>`
  position: absolute;
  left: ${(props) => props.$position}px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 4px;
`

const TimeLabel = styled.span`
  font-size: 10px;
  color: #888;
  font-family: 'Geist Mono', monospace;
`

const TimeTick = styled.div`
  width: 1px;
  flex: 1;
  background: #333;
`

const TimelineContent = styled.div`
  flex: 1;
  display: flex;
  overflow: auto;
  position: relative;
`

const TrackList = styled.div`
  width: 120px;
  background: #1a1a1a;
  border-right: 1px solid #333;
`

const TrackLane = styled.div<{ $color: string }>`
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #333;
  border-left: 3px solid ${(props) => props.$color};
  background: #1a1a1a;
`

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TrackName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #e0e0e0;
`

const TrackType = styled.div`
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
`

const TimelineGrid = styled.div`
  flex: 1;
  position: relative;
  background: #0a0a0a;
  min-width: 4000px;
`

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const GridLine = styled.div<{ $position: number; $major?: boolean }>`
  position: absolute;
  left: ${(props) => props.$position}px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${(props) => (props.$major ? "#333" : "#222")};
`

const TrackLanes = styled.div`
  position: relative;
`

const LaneRow = styled.div`
  height: 80px;
  border-bottom: 1px solid #1a1a1a;
  position: relative;
  cursor: crosshair;

  &:hover {
    background: rgba(0, 217, 255, 0.05);
  }
`

const ClipElement = styled.div<{ $position: number; $width: number; $color: string; $selected?: boolean }>`
  position: absolute;
  left: ${(props) => props.$position}px;
  top: 8px;
  width: ${(props) => props.$width}px;
  height: 64px;
  background: ${(props) => props.$color};
  border: 2px solid ${(props) => (props.$selected ? "#00d9ff" : "transparent")};
  border-radius: 4px;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #00d9ff;
  }
`

const ClipName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #0a0a0a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`

const ClipActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  ${ClipElement}:hover & {
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

const PlayheadLine = styled.div<{ $position: number }>`
  position: absolute;
  left: ${(props) => props.$position}px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #00d9ff;
  pointer-events: none;
  z-index: 5;

  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: -6px;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid #00d9ff;
  }
`

const PIXELS_PER_BEAT = 40
const BEATS_PER_BAR = 4

export function ArrangementView() {
  const { tracks } = useTracks()
  const { addClip, moveClip, deleteClip, getClipsForTrack } = useArrangement()
  const { currentTime, tempo } = useTransport()
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [draggingClip, setDraggingClip] = useState<{ id: string; startX: number; startPosition: number } | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const beatsPerSecond = tempo / 60
  const currentBeat = currentTime * beatsPerSecond
  const playheadPosition = currentBeat * PIXELS_PER_BEAT

  const handleLaneClick = (e: React.MouseEvent, trackId: string) => {
    if (draggingClip) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const beat = Math.floor(x / PIXELS_PER_BEAT)

    addClip(trackId, beat, BEATS_PER_BAR)
  }

  const handleClipMouseDown = (e: React.MouseEvent, clip: ArrangementClip) => {
    e.stopPropagation()
    setSelectedClip(clip.id)
    setDraggingClip({
      id: clip.id,
      startX: e.clientX,
      startPosition: clip.position,
    })
  }

  useEffect(() => {
    if (!draggingClip) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - draggingClip.startX
      const deltaBeat = deltaX / PIXELS_PER_BEAT
      const newPosition = Math.max(0, Math.round(draggingClip.startPosition + deltaBeat))
      moveClip(draggingClip.id, newPosition)
    }

    const handleMouseUp = () => {
      setDraggingClip(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingClip, moveClip])

  const handleDeleteClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation()
    deleteClip(clipId)
    if (selectedClip === clipId) {
      setSelectedClip(null)
    }
  }

  // Generate time markers
  const timeMarkers = []
  for (let bar = 0; bar < 100; bar++) {
    const beat = bar * BEATS_PER_BAR
    timeMarkers.push({
      position: beat * PIXELS_PER_BEAT,
      label: `${bar + 1}`,
    })
  }

  // Generate grid lines
  const gridLines = []
  for (let beat = 0; beat < 400; beat++) {
    gridLines.push({
      position: beat * PIXELS_PER_BEAT,
      major: beat % BEATS_PER_BAR === 0,
    })
  }

  return (
    <ArrangementContainer>
      <TimelineHeader>
        <TrackLabels />
        <TimeRuler>
          {timeMarkers.map((marker) => (
            <TimeMarker key={marker.position} $position={marker.position}>
              <TimeLabel>{marker.label}</TimeLabel>
              <TimeTick />
            </TimeMarker>
          ))}
          <PlayheadLine $position={playheadPosition} />
        </TimeRuler>
      </TimelineHeader>

      <TimelineContent ref={timelineRef}>
        <TrackList>
          {tracks.map((track) => (
            <TrackLane key={track.id} $color={track.color}>
              <TrackInfo>
                <TrackName>{track.name}</TrackName>
                <TrackType>{track.type}</TrackType>
              </TrackInfo>
            </TrackLane>
          ))}
        </TrackList>

        <TimelineGrid>
          <GridLines>
            {gridLines.map((line, i) => (
              <GridLine key={i} $position={line.position} $major={line.major} />
            ))}
          </GridLines>

          <PlayheadLine $position={playheadPosition} />

          <TrackLanes>
            {tracks.map((track) => {
              const trackClips = getClipsForTrack(track.id)

              return (
                <LaneRow key={track.id} onClick={(e) => handleLaneClick(e, track.id)}>
                  {trackClips.map((clip) => (
                    <ClipElement
                      key={clip.id}
                      $position={clip.position * PIXELS_PER_BEAT}
                      $width={clip.duration * PIXELS_PER_BEAT}
                      $color={track.color}
                      $selected={selectedClip === clip.id}
                      onMouseDown={(e) => handleClipMouseDown(e, clip)}
                    >
                      <ClipName>{clip.name}</ClipName>
                      <ClipActions>
                        <ClipActionButton onClick={(e) => handleDeleteClip(e, clip.id)}>
                          <Trash2 />
                        </ClipActionButton>
                      </ClipActions>
                    </ClipElement>
                  ))}
                </LaneRow>
              )
            })}
          </TrackLanes>
        </TimelineGrid>
      </TimelineContent>
    </ArrangementContainer>
  )
}
