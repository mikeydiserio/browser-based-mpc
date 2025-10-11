"use client"

import type React from "react"
import styled from "styled-components"
import { useState, useRef, useEffect } from "react"
import { useMidiEditor } from "@/hooks/use-midi-editor"
import type { Clip, MidiNote } from "@/lib/audio-engine"
import { X } from "lucide-react"

const PianoRollContainer = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`

const PianoRollWindow = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1400px;
  max-height: 800px;
  background: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const PianoRollHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #0a0a0a;
  border-bottom: 1px solid #333;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #00d9ff;
  margin: 0;
`

const SubdivisionControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SubdivisionLabel = styled.label`
  font-size: 12px;
  color: #888;
  font-weight: 500;
`

const SubdivisionSelect = styled.select`
  padding: 6px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #00d9ff;
  }

  &:focus {
    outline: none;
    border-color: #00d9ff;
  }
`

const CloseButton = styled.button`
  padding: 8px;
  background: transparent;
  border: 1px solid #333;
  border-radius: 4px;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #2a2a2a;
    border-color: #00d9ff;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const PianoRollContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const PianoKeys = styled.div`
  width: 80px;
  background: #0a0a0a;
  border-right: 1px solid #333;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
`

const PianoKey = styled.div<{ $isBlack: boolean; $pitch: number }>`
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$isBlack ? "#0a0a0a" : "#1a1a1a")};
  border-bottom: 1px solid ${(props) => (props.$isBlack ? "#000" : "#333")};
  color: ${(props) => (props.$isBlack ? "#666" : "#888")};
  font-size: 10px;
  font-family: 'Geist Mono', monospace;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${(props) => (props.$isBlack ? "#1a1a1a" : "#2a2a2a")};
  }
`

const GridArea = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  background: #0f0f0f;
`

const GridCanvas = styled.div`
  position: relative;
  min-width: 3200px;
  height: 2560px;
`

const GridLines = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

const HorizontalLine = styled.div<{ $position: number; $isOctave?: boolean }>`
  position: absolute;
  top: ${(props) => props.$position}px;
  left: 0;
  right: 0;
  height: 1px;
  background: ${(props) => (props.$isOctave ? "#333" : "#222")};
`

const VerticalLine = styled.div<{ $position: number; $isBeat?: boolean }>`
  position: absolute;
  left: ${(props) => props.$position}px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${(props) => (props.$isBeat ? "#333" : "#222")};
`

const NotesLayer = styled.div`
  position: absolute;
  inset: 0;
`

const NoteElement = styled.div<{ $top: number; $left: number; $width: number; $color: string; $selected?: boolean }>`
  position: absolute;
  top: ${(props) => props.$top}px;
  left: ${(props) => props.$left}px;
  width: ${(props) => props.$width}px;
  height: 18px;
  background: ${(props) => props.$color};
  border: 2px solid ${(props) => (props.$selected ? "#00d9ff" : "rgba(0, 0, 0, 0.3)")};
  border-radius: 3px;
  cursor: move;
  transition: border-color 0.2s;

  &:hover {
    border-color: #00d9ff;
  }
`

const PIXELS_PER_BEAT = 80
const PIXELS_PER_NOTE = 20
const MIN_PITCH = 0
const MAX_PITCH = 127

type Subdivision = "1/4" | "1/8" | "1/16" | "1/32"

const SUBDIVISION_VALUES: Record<Subdivision, number> = {
  "1/4": 0.25,
  "1/8": 0.125,
  "1/16": 0.0625,
  "1/32": 0.03125,
}

interface PianoRollProps {
  clip: Clip
  onClose: () => void
}

export function PianoRoll({ clip, onClose }: PianoRollProps) {
  const { addNote, removeNote, moveNote, resizeNote, getNoteNameFromPitch } = useMidiEditor()
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [draggingNote, setDraggingNote] = useState<{
    id: string
    startX: number
    startY: number
    startPitch: number
    startTime: number
  } | null>(null)
  const [subdivision, setSubdivision] = useState<Subdivision>("1/16")
  const gridRef = useRef<HTMLDivElement>(null)

  const isBlackKey = (pitch: number): boolean => {
    const note = pitch % 12
    return [1, 3, 6, 8, 10].includes(note)
  }

  const subdivisionValue = SUBDIVISION_VALUES[subdivision]
  const pixelsPerSubdivision = (subdivisionValue / 0.25) * PIXELS_PER_BEAT

  const handleGridClick = (e: React.MouseEvent) => {
    if (draggingNote || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + gridRef.current.scrollLeft
    const y = e.clientY - rect.top + gridRef.current.scrollTop

    const time = Math.floor(x / pixelsPerSubdivision) * subdivisionValue
    const pitch = MAX_PITCH - Math.floor(y / PIXELS_PER_NOTE)

    addNote(clip, pitch, time, subdivisionValue)
  }

  const handleNoteMouseDown = (e: React.MouseEvent, note: MidiNote) => {
    e.stopPropagation()
    setSelectedNote(note.id)

    if (!gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    setDraggingNote({
      id: note.id,
      startX: e.clientX,
      startY: e.clientY,
      startPitch: note.pitch,
      startTime: note.startTime,
    })
  }

  const handleNoteDoubleClick = (e: React.MouseEvent, note: MidiNote) => {
    e.stopPropagation()
    removeNote(clip, note.id)
    if (selectedNote === note.id) {
      setSelectedNote(null)
    }
  }

  useEffect(() => {
    if (!draggingNote || !gridRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - draggingNote.startX
      const deltaY = e.clientY - draggingNote.startY

      const deltaTime = Math.round(deltaX / pixelsPerSubdivision) * subdivisionValue
      const deltaPitch = -Math.round(deltaY / PIXELS_PER_NOTE)

      const newStartTime = Math.max(0, draggingNote.startTime + deltaTime)
      const newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, draggingNote.startPitch + deltaPitch))

      moveNote(clip, draggingNote.id, newPitch, newStartTime)
    }

    const handleMouseUp = () => {
      setDraggingNote(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingNote, clip, moveNote, pixelsPerSubdivision, subdivisionValue])

  const horizontalLines = []
  for (let pitch = MIN_PITCH; pitch <= MAX_PITCH; pitch++) {
    const y = (MAX_PITCH - pitch) * PIXELS_PER_NOTE
    horizontalLines.push({
      position: y,
      isOctave: pitch % 12 === 0,
    })
  }

  const verticalLines = []
  const totalBeats = 128
  const totalTime = totalBeats * 0.25
  const numSubdivisions = totalTime / subdivisionValue

  for (let i = 0; i <= numSubdivisions; i++) {
    const time = i * subdivisionValue
    const position = (time / subdivisionValue) * pixelsPerSubdivision
    const isBeat = time % 1 === 0

    verticalLines.push({
      position,
      isBeat,
    })
  }

  return (
    <PianoRollContainer onClick={onClose}>
      <PianoRollWindow onClick={(e) => e.stopPropagation()}>
        <PianoRollHeader>
          <HeaderLeft>
            <Title>Piano Roll - {clip.name}</Title>
            <SubdivisionControl>
              <SubdivisionLabel>Grid:</SubdivisionLabel>
              <SubdivisionSelect value={subdivision} onChange={(e) => setSubdivision(e.target.value as Subdivision)}>
                <option value="1/4">1/4 Note</option>
                <option value="1/8">1/8 Note</option>
                <option value="1/16">1/16 Note</option>
                <option value="1/32">1/32 Note</option>
              </SubdivisionSelect>
            </SubdivisionControl>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </PianoRollHeader>

        <PianoRollContent>
          <PianoKeys>
            {Array.from({ length: MAX_PITCH - MIN_PITCH + 1 }, (_, i) => {
              const pitch = MAX_PITCH - i
              return (
                <PianoKey key={pitch} $isBlack={isBlackKey(pitch)} $pitch={pitch}>
                  {pitch % 12 === 0 ? getNoteNameFromPitch(pitch) : ""}
                </PianoKey>
              )
            })}
          </PianoKeys>

          <GridArea ref={gridRef}>
            <GridCanvas onClick={handleGridClick}>
              <GridLines>
                {horizontalLines.map((line, i) => (
                  <HorizontalLine key={i} $position={line.position} $isOctave={line.isOctave} />
                ))}
                {verticalLines.map((line, i) => (
                  <VerticalLine key={i} $position={line.position} $isBeat={line.isBeat} />
                ))}
              </GridLines>

              <NotesLayer>
                {clip.midiNotes?.map((note) => {
                  const top = (MAX_PITCH - note.pitch) * PIXELS_PER_NOTE + 1
                  const left = (note.startTime / subdivisionValue) * pixelsPerSubdivision
                  const width = (note.duration / subdivisionValue) * pixelsPerSubdivision

                  return (
                    <NoteElement
                      key={note.id}
                      $top={top}
                      $left={left}
                      $width={width}
                      $color={clip.color}
                      $selected={selectedNote === note.id}
                      onMouseDown={(e) => handleNoteMouseDown(e, note)}
                      onDoubleClick={(e) => handleNoteDoubleClick(e, note)}
                    />
                  )
                })}
              </NotesLayer>
            </GridCanvas>
          </GridArea>
        </PianoRollContent>
      </PianoRollWindow>
    </PianoRollContainer>
  )
}
