import { useCallback, useRef, useState } from 'react';
import * as S from './Timeline.styles';

type Clip = { startBar: number; lengthBars: number; label: string; patternIndex?: number }

type Track = { name: string; clips: Clip[] }

type Props = {
  tracks: Track[]
  onAddClip?: (trackIndex: number, startBar: number, lengthBars: number, label: string) => void
  onUpdateClips?: (trackIndex: number, clips: Clip[]) => void
}

export function Timeline({ tracks, onAddClip, onUpdateClips }: Props) {
  const [ghost, setGhost] = useState<{ track: number; startBar: number; lengthBars: number } | null>(null)
  const [drag, setDrag] = useState<{ track: number; clipIndex: number; type: 'move' | 'resize-right' | 'resize-left'; startX: number; startBar: number; startLen: number } | null>(null)
  const gridRefs = useRef<Array<HTMLDivElement | null>>([])

  const pxPerBar = 40
  const bars = 64
  const snap = 1

  const barFromX = useCallback((x: number) => {
    const b = Math.max(0, Math.min(bars, Math.round(x / (pxPerBar * snap)) * snap))
    return b
  }, [])

  return (
    <S.Container>
      <S.Tracks>
        {tracks.map((t, i) => (
          <S.TrackRow key={i}>
            <S.TrackName>{t.name}</S.TrackName>
            <S.Grid
              ref={(el) => (gridRefs.current[i] = el)}
              onMouseDown={(e) => {
                const rect = gridRefs.current[i]!.getBoundingClientRect()
                const start = barFromX(e.clientX - rect.left)
                setGhost({ track: i, startBar: start, lengthBars: 1 })
              }}
              onMouseMove={(e) => {
                const rect = gridRefs.current[i]!.getBoundingClientRect()
                const x = e.clientX - rect.left
                if (drag && drag.track === i) {
                  const dxBars = barFromX(x) - barFromX(drag.startX)
                  if (drag.type === 'move') {
                    const newStart = Math.max(0, drag.startBar + dxBars)
                    const clip = t.clips[drag.clipIndex]
                    clip.startBar = newStart
                  } else if (drag.type === 'resize-right') {
                    const newLen = Math.max(1, drag.startLen + dxBars)
                    const clip = t.clips[drag.clipIndex]
                    clip.lengthBars = newLen
                  } else if (drag.type === 'resize-left') {
                    const newStart = Math.max(0, drag.startBar + dxBars)
                    const newLen = Math.max(1, drag.startLen - dxBars)
                    const clip = t.clips[drag.clipIndex]
                    clip.startBar = newStart
                    clip.lengthBars = newLen
                  }
                } else if (ghost && ghost.track === i) {
                  const end = barFromX(x)
                  const len = Math.max(1, end - ghost.startBar)
                  setGhost({ ...ghost, lengthBars: len })
                }
              }}
              onMouseUp={() => {
                if (drag && drag.track === i) {
                  setDrag(null)
                  onUpdateClips?.(i, t.clips.map(c => ({ ...c })))
                } else if (ghost && ghost.track === i) {
                  onAddClip?.(i, ghost.startBar, ghost.lengthBars, 'New')
                  setGhost(null)
                }
              }}
              onMouseLeave={() => setGhost(null)}
            >
              {t.clips.map((c, ci) => (
                <S.Clip
                  key={ci}
                  style={{ left: `${c.startBar * pxPerBar}px`, width: `${c.lengthBars * pxPerBar}px` }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    const rect = gridRefs.current[i]!.getBoundingClientRect()
                    const x = e.clientX - rect.left
                    const clipLeft = c.startBar * pxPerBar
                    const clipRight = clipLeft + c.lengthBars * pxPerBar
                    const edgeThreshold = 6
                    let type: 'move' | 'resize-right' | 'resize-left' = 'move'
                    if (Math.abs(x - clipRight) <= edgeThreshold) type = 'resize-right'
                    else if (Math.abs(x - clipLeft) <= edgeThreshold) type = 'resize-left'
                    setDrag({ track: i, clipIndex: ci, type, startX: x, startBar: c.startBar, startLen: c.lengthBars })
                  }}
                >
                  {c.patternIndex ? `Pat ${c.patternIndex}` : c.label}
                </S.Clip>
              ))}
              {ghost && ghost.track === i && (
                <S.ClipGhost style={{ left: `${ghost.startBar * pxPerBar}px`, width: `${ghost.lengthBars * pxPerBar}px` }}>New</S.ClipGhost>
              )}
            </S.Grid>
          </S.TrackRow>
        ))}
      </S.Tracks>
    </S.Container>
  )
}

export default Timeline


