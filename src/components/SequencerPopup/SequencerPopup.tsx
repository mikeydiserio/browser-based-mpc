import { Maximize2, Minimize2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Sequencer } from '../Sequencer/Sequencer'
import * as S from './SequencerPopup.styles'

interface SequencerPopupProps {
  isOpen: boolean
  onClose: () => void
  matrix: boolean[][]
  currentStep: number
  steps: number
  onToggle: (row: number, col: number) => void
  patternNumber: number
  padNames?: Record<number, string | undefined>
  onPatternChange: (patternIndex: number) => void
  isLoading?: boolean
}

export function SequencerPopup({
  isOpen,
  onClose,
  matrix,
  currentStep,
  steps,
  onToggle,
  patternNumber,
  padNames,
  onPatternChange,
  isLoading
}: SequencerPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const popupRef = useRef<HTMLDivElement>(null)

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
      const centerX = (window.innerWidth - 700) / 2
      const centerY = (window.innerHeight - 400) / 2
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
            <S.Title>MPC Sequencer</S.Title>
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
            <Sequencer
              matrix={matrix}
              currentStep={currentStep}
              steps={steps}
              onToggle={onToggle}
              patternNumber={patternNumber}
              padNames={padNames}
              onPatternChange={onPatternChange}
              isLoading={isLoading}
            />
          </S.Content>
        )}
      </S.PopupContainer>
    </S.Overlay>
  )
}
