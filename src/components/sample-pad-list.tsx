"use client"

import type React from "react"

import styled from "styled-components"
import { Upload, Trash2 } from "lucide-react"
import type { SamplePad } from "@/lib/sample-pad-manager"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Title = styled.div`
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 4px;
`

const PadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PadItem = styled.div<{ $selected: boolean }>`
  padding: 10px 12px;
  background: ${(props) => (props.$selected ? "#1a1a1a" : "#0f0f0f")};
  border: 1px solid ${(props) => (props.$selected ? "#00d9ff" : "#333")};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
    border-color: #00d9ff;
  }
`

const PadName = styled.div`
  font-size: 12px;
  color: #e0e0e0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DeleteButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #ff4444;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const UploadButton = styled.label`
  padding: 10px 12px;
  background: #0f0f0f;
  border: 1px dashed #333;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
    border-color: #00d9ff;
    color: #00d9ff;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const HiddenInput = styled.input`
  display: none;
`

interface SamplePadListProps {
  pads: SamplePad[]
  selectedPadId: string | null
  onSelectPad: (id: string) => void
  onLoadSample: (file: File) => void
  onDeletePad: (id: string) => void
}

export function SamplePadList({ pads, selectedPadId, onSelectPad, onLoadSample, onDeletePad }: SamplePadListProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onLoadSample(file)
    }
  }

  return (
    <Container>
      <Title>Sample Pads</Title>
      <PadList>
        {pads.map((pad, index) => (
          <PadItem key={pad.id} $selected={pad.id === selectedPadId} onClick={() => onSelectPad(pad.id)}>
            <PadName>
              {index + 1}. {pad.name}
            </PadName>
            <DeleteButton
              onClick={(e) => {
                e.stopPropagation()
                onDeletePad(pad.id)
              }}
            >
              <Trash2 />
            </DeleteButton>
          </PadItem>
        ))}
      </PadList>
      <UploadButton>
        <Upload />
        Load Sample
        <HiddenInput type="file" accept="audio/*" onChange={handleFileChange} />
      </UploadButton>
    </Container>
  )
}
