"use client"

import styled from "styled-components"
import { CondensedTimeline } from "./condensed-timeline"

const SwitcherContainer = styled.div`
  display: flex;
  gap: 2px;
  background: #1a1a1a;
  padding: 8px 16px;
  border-bottom: 1px solid #333;
`

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  background: ${(props) => (props.$active ? "#00d9ff" : "#0a0a0a")};
  color: ${(props) => (props.$active ? "#0a0a0a" : "#e0e0e0")};
  border: 1px solid ${(props) => (props.$active ? "#00d9ff" : "#333")};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${(props) => (props.$active ? "#00eaff" : "#1a1a1a")};
    border-color: ${(props) => (props.$active ? "#00eaff" : "#555")};
  }
`

interface ViewSwitcherProps {
  currentView: "session" | "arrangement"
  onViewChange: (view: "session" | "arrangement") => void
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <>
      <CondensedTimeline />
      <SwitcherContainer>
        <ViewButton $active={currentView === "session"} onClick={() => onViewChange("session")}>
          Session View
        </ViewButton>
        <ViewButton $active={currentView === "arrangement"} onClick={() => onViewChange("arrangement")}>
          Arrangement View
        </ViewButton>
      </SwitcherContainer>
    </>
  )
}
