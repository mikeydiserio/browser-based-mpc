import { useEffect, useMemo, useRef, useState } from 'react'
import * as S from './SampleEditor.styles'

type Props = {
  onAssignSlice?: (padIndex: number, name: string, startSec: number, durationSec: number) => void
}

export function SampleEditor({ onAssignSlice }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null)
  const [slices, setSlices] = useState<Array<{ start: number; end: number }>>([])
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [dragging, setDragging] = useState<null | { index: number; edge: 'start' | 'end' }>(null)

  useEffect(() => {
    if (!file) return
    ;(async () => {
      const ab = await file.arrayBuffer()
      setArrayBuffer(ab)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const decoded = await ctx.decodeAudioData(ab.slice(0))
      setAudioBuffer(decoded)
    })()
  }, [file])

  const waveform = useMemo(() => {
    if (!audioBuffer) return null
    const ch0 = audioBuffer.getChannelData(0)
    const target = 800
    const block = Math.max(1, Math.floor(ch0.length / target))
    const arr = new Float32Array(target)
    for (let i = 0; i < target; i++) {
      const start = i * block
      let min = 1.0
      let max = -1.0
      for (let j = 0; j < block; j++) {
        const v = ch0[start + j] ?? 0
        if (v < min) min = v
        if (v > max) max = v
      }
      arr[i] = Math.max(Math.abs(min), Math.abs(max))
    }
    return arr
  }, [audioBuffer])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !waveform) return
    const ctx = canvas.getContext('2d')!
    const w = (canvas.width = canvas.clientWidth)
    const h = (canvas.height = canvas.clientHeight)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = '#21c7be'
    ctx.lineWidth = 1
    const mid = h / 2
    ctx.beginPath()
    for (let x = 0; x < waveform.length; x++) {
      const v = waveform[x]
      const y = v * (h / 2 - 1)
      ctx.moveTo((x / waveform.length) * w, mid - y)
      ctx.lineTo((x / waveform.length) * w, mid + y)
    }
    ctx.stroke()

    // Draw slices
    ctx.strokeStyle = '#ff7a45'
    ctx.lineWidth = 2
    slices.forEach(({ start, end }) => {
      const x1 = (start / (audioBuffer?.duration || 1)) * w
      const x2 = (end / (audioBuffer?.duration || 1)) * w
      ctx.beginPath()
      ctx.moveTo(x1, 0)
      ctx.lineTo(x1, h)
      ctx.moveTo(x2, 0)
      ctx.lineTo(x2, h)
      ctx.stroke()

      // Draw draggable handles
      ctx.fillStyle = '#ff7a45'
      ctx.fillRect(x1 - 4, 2, 8, 12)
      ctx.fillRect(x2 - 4, 2, 8, 12)
    })
  }, [waveform, slices, audioBuffer])

  const addSlice = () => {
    if (!audioBuffer) return
    const dur = audioBuffer.duration
    const lastEnd = slices[slices.length - 1]?.end ?? 0
    const start = Math.min(dur - 0.1, lastEnd)
    const end = Math.min(dur, start + 0.5)
    setSlices([...slices, { start, end }])
  }

  const assignToPad = (padIndex: number, idx: number) => {
    if (!audioBuffer || !arrayBuffer) return
    const s = slices[idx]
    if (!s) return
    onAssignSlice?.(padIndex, file?.name ?? `Slice ${idx + 1}`, s.start, s.end - s.start)
  }

  // Drag slice handles on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !audioBuffer) return
    const dur = audioBuffer.duration || 1
    const pxFromSec = (sec: number) => (sec / dur) * canvas.clientWidth
    const secFromPx = (x: number) => Math.max(0, Math.min(dur, (x / canvas.clientWidth) * dur))

    const hitTest = (x: number): null | { index: number; edge: 'start' | 'end' } => {
      const threshold = 6
      for (let i = 0; i < slices.length; i++) {
        const s = slices[i]
        const x1 = pxFromSec(s.start)
        const x2 = pxFromSec(s.end)
        if (Math.abs(x - x1) <= threshold) return { index: i, edge: 'start' }
        if (Math.abs(x - x2) <= threshold) return { index: i, edge: 'end' }
      }
      return null
    }

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const hit = hitTest(x)
      if (hit) {
        e.preventDefault()
        setDragging(hit)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      if (dragging) {
        const t = secFromPx(x)
        setSlices(prev => {
          const next = prev.map(s => ({ ...s }))
          const s = next[dragging.index]
          if (!s) return prev
          const minLen = 0.01
          if (dragging.edge === 'start') {
            s.start = Math.min(Math.max(0, t), s.end - minLen)
          } else {
            s.end = Math.max(Math.min(dur, t), s.start + minLen)
          }
          return next
        })
      } else {
        const hit = hitTest(x)
        canvas.style.cursor = hit ? 'ew-resize' : 'default'
      }
    }

    const onMouseUp = () => setDragging(null)

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [audioBuffer, slices, dragging])

  return (
    <S.Panel>
      <S.Controls>
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <S.Button onClick={addSlice}>Add Slice</S.Button>
      </S.Controls>
      <S.Wave ref={canvasRef} />
      {slices.map((sl, i) => (
        <S.Controls key={i}>
          <div>Slice {i + 1}: {sl.start.toFixed(2)}s → {sl.end.toFixed(2)}s</div>
          <S.Button onClick={() => assignToPad(i, i)}>Assign to Pad {i + 1}</S.Button>
        </S.Controls>
      ))}
    </S.Panel>
  )
}

export default SampleEditor


