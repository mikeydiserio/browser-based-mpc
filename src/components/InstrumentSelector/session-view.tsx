"use client"

import type React from "react"
import styled from "styled-components"
import { useState } from "react"
import { useTracks } from "@/hooks/use-tracks"
import { usePatterns } from "@/hooks/use-patterns"
import { useClipPlayer } from "@/hooks/use-clip-player"
import { Play, Plus, Trash2, Edit } from "lucide-react"
import { PianoRoll } from "./piano-roll"
import type { Clip } from "@/lib/audio-engine"

const SessionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f0f0f;
  overflow: auto;
`

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(8, 1fr);
  gap: 2px;
  padding: 16px;
  min-width: min-content;
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

const TrackHeader = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #1a1a1a;
  border-radius: 4px;
  border-bottom: 3px solid ${(props) => props.$color};
  min-height: 60px;
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

const ClipSlot = styled.div<{ $hasClip: boolean; $color?: string; $isPlaying?: boolean }>`
  position: relative;
  min-height: 80px;
  background: ${(props) => (props.$hasClip ? props.$color : "#1a1a1a")};
  border: 2px solid ${(props) => (props.$isPlaying ? "#00d9ff" : props.$hasClip ? props.$color : "#2a2a2a")};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: ${(props) => (props.$hasClip ? "#00d9ff" : "#555")};
    background: ${(props) => (props.$hasClip ? props.$color : "#2a2a2a")};
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

export function SessionView() {
  const { tracks } = useTracks()
  const { patterns, createClip, deleteClip, getClipForTrackInPattern } = usePatterns()
  const { playClip, stopClip, isPlaying } = useClipPlayer()
  const [editingClip, setEditingClip] = useState<Clip | null>(null)

  const handleSlotDoubleClick = (trackId: string, patternId: string) => {
    const track = tracks.find((t) => t.id === trackId)
    if (track?.type !== "midi") return

    const existingClip = getClipForTrackInPattern(trackId, patternId)
    if (existingClip) {
      setEditingClip(existingClip)
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

  return (
    <>
      <SessionContainer>
        <SessionGrid>
          <div />
          {tracks.map((track) => (
            <TrackHeader key={track.id} $color={track.color}>
              <TrackName>{track.name}</TrackName>
              <TrackType>{track.type}</TrackType>
            </TrackHeader>
          ))}
          {patterns.map((pattern) => (
            <>
              <SceneHeader key={`scene-${pattern.id}`}>
                <span>{pattern.name}</span>
                <SceneLaunchButton onClick={() => handleSceneLaunch(pattern.id)}>
                  <Play size={12} fill="currentColor" />
                </SceneLaunchButton>
              </SceneHeader>
              {tracks.map((track) => {
                const clip = getClipForTrackInPattern(track.id, pattern.id)
                const playing = clip ? isPlaying(clip.id) : false

                return (
                  <ClipSlot
                    key={`${pattern.id}-${track.id}`}
                    $hasClip={!!clip}
                    $color={track.color}
                    $isPlaying={playing}
                    onClick={() => handleSlotClick(track.id, pattern.id)}
                    onDoubleClick={() => handleSlotDoubleClick(track.id, pattern.id)}
                  >
                    {clip ? (
                      <ClipContent>
                        <ClipName>{clip.name}</ClipName>
                        <ClipActions>
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
                      <EmptySlot>
                        <Plus size={20} />
                      </EmptySlot>
                    )}
                  </ClipSlot>
                )
              })}
            </>
          ))}
        </SessionGrid>
      </SessionContainer>
      {editingClip && <PianoRoll clip={editingClip} onClose={() => setEditingClip(null)} />}
    </>
  )
}
