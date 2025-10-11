import { Maximize2, Minimize2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { EffectsChain } from '../../audio/effects'
import { useTB303 } from '../../contexts/TB303Context'
import { FX } from '../FX/FX'
import { TB303Controls } from '../TB303Controls/TB303Controls'
import * as S from './TB303Popup.styles'

interface TB303PopupProps {
  isOpen: boolean
  onClose: () => void
}

export function TB303Popup({ isOpen, onClose }: TB303PopupProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const popupRef = useRef<HTMLDivElement>(null)
  
  const {
    tb303Patch,
    tb303Fx,
    setTb303Patch,
    setTb303Fx,
    tb303SynthRef,
  } = useTB303()

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  // Center the popup when it opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const centerX = (window.innerWidth - 800) / 2
      const centerY = (window.innerHeight - 600) / 2
      setPosition({ x: centerX, y: centerY })
    }
  }, [isOpen, isMinimized])

  if (!isOpen) return null

  return (
    <S.Overlay>
      <S.PopupContainer
        ref={popupRef}
        $isMinimized={isMinimized}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <S.Header data-drag-handle>
          <S.TitleRow>
            <S.Title>TB-303 Bass Synthesizer</S.Title>
            <S.Controls>
              <S.ControlButton
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </S.ControlButton>
              <S.ControlButton
                onClick={onClose}
                title="Close"
              >
                <X size={14} />
              </S.ControlButton>
            </S.Controls>
          </S.TitleRow>
        </S.Header>

        {!isMinimized && (
          <S.Content>
            <S.MainSection>
              <TB303Controls
                padIndex={null}
                name="TB-303 Synth"
                patch={tb303Patch}
                onChange={(changes) => setTb303Patch((prev) => ({ ...prev, ...changes }))}
                analyser={tb303SynthRef.current?.analyser}
              />
            </S.MainSection>
            
            <S.EffectsSection>
              <S.EffectsTitle>Effects Chain</S.EffectsTitle>
               <FX
                 effectSlots={tb303Fx}
                 onChange={(slotIndex, effect) => {
                   setTb303Fx((prev) => {
                     const next = [...prev] as EffectsChain
                     next[slotIndex] = effect
                     return next
                   })
                 }}
               />
            </S.EffectsSection>
          </S.Content>
        )}
      </S.PopupContainer>
    </S.Overlay>
  )
}
