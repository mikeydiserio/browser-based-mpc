"use client"

import type React from "react"

import styled from "styled-components"
import { useEffect, useRef, useState } from "react"
import { useTransport } from "@/hooks/use-transport"

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
  padding: 8px 16px;
  user-select: none;
`

const TimelineCanvas = styled.canvas`
  width: 100%;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  background: #0a0a0a;
`

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 11px;
  color: #888;
`

const CurrentTime = styled.span`
  color: #00d9ff;
  font-weight: 600;
  font-family: monospace;
`

export function CondensedTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { transport, setPosition } = useTransport()
  const [canvasWidth, setCanvasWidth] = useState(800)

  // Update canvas width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth - 32)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  // Draw timeline
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasWidth * dpr
    canvas.height = 40 * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvasWidth, 40)

    // Draw bar markers
    const beatsPerBar = 4
    const totalBars = 32 // Show 32 bars
    const pixelsPerBar = canvasWidth / totalBars

    ctx.strokeStyle = "#333"
    ctx.fillStyle = "#666"
    ctx.font = "10px monospace"

    for (let bar = 0; bar <= totalBars; bar++) {
      const x = bar * pixelsPerBar

      // Draw bar line
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, bar % 4 === 0 ? 30 : 20)
      ctx.stroke()

      // Draw bar number every 4 bars
      if (bar % 4 === 0) {
        ctx.fillText(`${bar + 1}`, x + 2, 38)
      }
    }

    // Draw playhead
    const currentBar = transport.currentBar
    const currentBeat = transport.currentBeat
    const positionInBars = currentBar + currentBeat / beatsPerBar
    const playheadX = (positionInBars / totalBars) * canvasWidth

    ctx.strokeStyle = "#00d9ff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, 40)
    ctx.stroke()

    // Draw playhead triangle
    ctx.fillStyle = "#00d9ff"
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX - 4, 8)
    ctx.lineTo(playheadX + 4, 8)
    ctx.closePath()
    ctx.fill()
  }, [transport.currentBar, transport.currentBeat, canvasWidth])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickRatio = x / rect.width

    const totalBars = 32
    const beatsPerBar = 4
    const totalBeats = totalBars * beatsPerBar
    const clickedBeat = clickRatio * totalBeats

    const bar = Math.floor(clickedBeat / beatsPerBar)
    const beat = clickedBeat % beatsPerBar

    setPosition(bar, beat)
  }

  const formatTime = (bar: number, beat: number) => {
    return `${String(bar + 1).padStart(3, "0")}:${String(Math.floor(beat) + 1).padStart(1, "0")}:${String(Math.floor((beat % 1) * 4) + 1).padStart(1, "0")}`
  }

  return (
    <TimelineContainer ref={containerRef}>
      <TimelineCanvas ref={canvasRef} width={canvasWidth} height={40} onClick={handleCanvasClick} />
      <TimeDisplay>
        <CurrentTime>{formatTime(transport.currentBar, transport.currentBeat)}</CurrentTime>
        <span>Tempo: {transport.tempo} BPM</span>
      </TimeDisplay>
    </TimelineContainer>
  )
}
