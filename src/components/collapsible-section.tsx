"use client"

import type React from "react"

import styled from "styled-components"
import { useState, type ReactNode } from "react"

const SectionContainer = styled.div<{ $isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  margin-bottom: 8px;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  cursor: move;
  transition: opacity 0.2s;

  &:hover {
    border-color: #00d9ff;
  }
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #252525;
  border-bottom: 1px solid #333;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #2a2a2a;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const DragHandle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  span {
    width: 16px;
    height: 2px;
    background: #666;
    border-radius: 1px;
  }
`

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ChevronIcon = styled.svg<{ $isCollapsed: boolean }>`
  width: 16px;
  height: 16px;
  color: #00d9ff;
  transition: transform 0.2s;
  transform: rotate(${(props) => (props.$isCollapsed ? -90 : 0)}deg);
`

const SectionContent = styled.div<{ $isCollapsed: boolean }>`
  display: ${(props) => (props.$isCollapsed ? "none" : "flex")};
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultCollapsed?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  draggable?: boolean
}

export function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggable = true,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    if (onDragStart) onDragStart(e)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    if (onDragEnd) onDragEnd(e)
  }

  return (
    <SectionContainer
      $isDragging={isDragging}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <SectionHeader onClick={() => setIsCollapsed(!isCollapsed)}>
        <HeaderLeft>
          <DragHandle onClick={(e) => e.stopPropagation()}>
            <span />
            <span />
            <span />
          </DragHandle>
          <SectionTitle>{title}</SectionTitle>
        </HeaderLeft>
        <ChevronIcon $isCollapsed={isCollapsed} viewBox="0 0 16 16" fill="none" stroke="currentColor">
          <path d="M4 6L8 10L12 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </ChevronIcon>
      </SectionHeader>
      <SectionContent $isCollapsed={isCollapsed}>{children}</SectionContent>
    </SectionContainer>
  )
}
