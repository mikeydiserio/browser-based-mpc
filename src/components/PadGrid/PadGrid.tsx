import { useCallback, useEffect, useMemo, useState } from 'react'
import * as S from './PadGrid.styles'

export type PadInfo = {
  index: number
  name?: string
  loaded: boolean
}

type PadGridProps = {
  activePad?: number
  activePads?: number[]
  padNames: Record<number, string | undefined>
  onDropSample: (padIndex: number, file: File) => void
  onTriggerPad: (padIndex: number) => void
  onSelectPad?: (padIndex: number) => void
}

const defaultHotkeys = [
  '1','2','3','4',
  'q','w','e','r',
  'a','s','d','f',
  'z','x','c','v'
]

export function PadGrid({ activePad, activePads, padNames, onDropSample, onTriggerPad, onSelectPad: _onSelectPad }: PadGridProps) {
  const [isActive, setIsActive] = useState<number | null>(null)

  const handleDrop = useCallback((padIndex: number, e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    const file = files[0]
    onDropSample(padIndex, file)
  }, [onDropSample])

  const preventDefaults = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = defaultHotkeys.indexOf(e.key.toLowerCase())
      if (idx !== -1) {
        setIsActive(idx)
        onTriggerPad(idx)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const idx = defaultHotkeys.indexOf(e.key.toLowerCase())
      if (idx !== -1) setIsActive(null)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [onTriggerPad])

  const pads = useMemo(() => Array.from({ length: 16 }, (_, i) => i), [])

  return (
    <S.Container>
      {pads.map((index) => {
        const name = padNames[index]
        const loaded = Boolean(name)
        const active = isActive === index || activePad === index || (activePads?.includes(index) ?? false)
        return (
          <S.Pad
            key={index}
            $active={active}
            $loaded={loaded}
            onClick={() => onTriggerPad(index)}
            onDragEnter={preventDefaults}
            onDragOver={preventDefaults}
            onDrop={(e) => handleDrop(index, e)}
          >
            <S.PadName>{name ?? 'Drop Sample'}</S.PadName>
            <S.PadLabel>{index + 1} / {defaultHotkeys[index]}</S.PadLabel>
          </S.Pad>
        )
      })}
    </S.Container>
  )
}

export default PadGrid


