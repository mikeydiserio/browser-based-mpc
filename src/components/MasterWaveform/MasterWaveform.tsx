import { AudioEngine } from "@/lib/audio-engine"
import { useEffect, useRef } from "react"
import styled from "styled-components"

const Canvas = styled.canvas`
  width: 260px;
  height: 48px;
  display: block;
`

export function MasterWaveform() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const engine = AudioEngine.getInstance()
    const analyser = engine.getMasterAnalyser()
    if (!analyser) return

    analyser.fftSize = 1024
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    ctx.scale(dpr, dpr)

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray)

      // Clear
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, cssW, cssH)

      // Grid baseline
      ctx.strokeStyle = "#222"
      ctx.lineWidth = 1
      ctx.beginPath()
      const mid = cssH / 2
      ctx.moveTo(0, mid)
      ctx.lineTo(cssW, mid)
      ctx.stroke()

      // Waveform
      ctx.strokeStyle = "#00d9ff"
      ctx.lineWidth = 2
      ctx.beginPath()
      const sliceWidth = cssW / bufferLength
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 - 1.0 // -1..1
        const y = mid + v * (cssH * 0.45)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
        x += sliceWidth
      }
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <Canvas ref={canvasRef} aria-label="Master output waveform" />
}

export default MasterWaveform


