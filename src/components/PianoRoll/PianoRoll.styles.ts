import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const Button = styled.button<{ $active?: boolean }>`
  padding: 4px 12px;
  font-size: 12px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Grid = styled.div`
  display: flex;
  gap: 0;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
  background: #1a1a1a;
  border: 2px solid #333333;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

export const PianoKeys = styled.div`
  display: flex;
  flex-direction: column-reverse;
  background: #e0e0e0;
  border-right: 2px solid #333333;
  flex-shrink: 0;
  box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  left: 0;
  z-index: 2;
`;

export const PianoKey = styled.div<{ $isBlack: boolean; $lit?: boolean }>`
  height: 20px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $isBlack, $lit }) => {
    if ($lit) return "#ff6b35"; // Orange highlight when playing
    if ($isBlack) return "#1a1a1a"; // Dark black for black keys
    return "#f5f5f5"; // Off-white for white keys
  }};
  color: ${({ $isBlack, $lit }) => {
    if ($lit) return "#ffffff";
    if ($isBlack) return "#ffffff"; // White text on black keys
    return "#333333"; // Dark text on white keys
  }};
  border-bottom: 1px solid
    ${({ $isBlack }) => ($isBlack ? "#000000" : "#cccccc")};
  border-right: 1px solid
    ${({ $isBlack }) => ($isBlack ? "#000000" : "#cccccc")};
  user-select: none;
  transition: all 0.1s ease;
  box-shadow: ${({ $isBlack }) =>
    $isBlack
      ? "inset 0 1px 2px rgba(0,0,0,0.5)"
      : "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.1)"};

  &:hover {
    background: ${({ $isBlack }) => ($isBlack ? "#2a2a2a" : "#e8e8e8")};
  }
`;

export const RollGrid = styled.div<{ $steps: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $steps }) => $steps}, 1fr);
  flex: 1;
  min-width: 600px;
`;

export const Cell = styled.div<{
  $isAccent: boolean;
  $hasNote: boolean;
  $lit?: boolean;
  $isBlack: boolean;
  $duration?: number;
}>`
  height: 20px;
  grid-column: ${({ $duration }) => ($duration ? `span ${$duration}` : "1")};
  border-right: 1px solid
    ${({ $isAccent, $isBlack }) =>
      $isAccent
        ? "rgba(255,255,255,0.2)"
        : $isBlack
        ? "rgba(0,0,0,0.3)"
        : "rgba(0,0,0,0.05)"};
  border-bottom: 1px solid
    ${({ $isBlack }) => ($isBlack ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)")};
  background: ${({ theme, $hasNote, $lit, $isBlack }) => {
    if ($hasNote && $lit) return "#ff6b35"; // Orange when note is playing
    if ($hasNote) return theme.colors.primary; // Primary color for notes
    if ($lit)
      return $isBlack ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)"; // Subtle playhead
    return $isBlack ? "#2a2a2a" : "#f8f8f8"; // Dark for black key rows, light for white key rows
  }};
  cursor: pointer;
  transition: background 0.05s ease;
  position: relative;

  &:hover {
    background: ${({ theme, $hasNote, $isBlack }) => {
      if ($hasNote) return theme.colors.primary;
      return $isBlack ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
    }};
  }
`;

export const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.3);
  }

  ${Cell}:hover & {
    opacity: 0.7;
  }
`;

export const ParameterSection = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

export const PatternBrowserSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PatternBrowserTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.4px;
  font-weight: 600;
`;

export const PatternList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding: 4px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PatternItem = styled.button<{
  $active?: boolean;
  $hasPattern?: boolean;
}>`
  padding: 8px;
  font-size: 11px;
  background: ${({ theme, $active, $hasPattern }) =>
    $active
      ? theme.colors.primary
      : $hasPattern
      ? theme.colors.surface
      : theme.colors.background};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.text};
  border: 1px solid
    ${({ theme, $hasPattern }) =>
      $hasPattern ? theme.colors.primary : theme.colors.border};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-weight: ${({ $hasPattern }) => ($hasPattern ? "600" : "400")};

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const PatternControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
