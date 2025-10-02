import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 8px;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PlayButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.accent : theme.colors.panelRaised};
  color: ${({ theme, $primary }) =>
    $primary ? "#0b0d12" : theme.colors.textPrimary};
  cursor: pointer;
`;

export const BarReadout = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Tracks = styled.div`
  display: grid;
  grid-auto-rows: 28px;
  gap: 6px;
`;

export const TrackRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 6px;
  align-items: center;
`;

export const TrackName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Grid = styled.div`
  position: relative;
  height: 28px;
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

export const Playhead = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${({ theme }) => theme.colors.accent};
  pointer-events: none;
`;

export const Clip = styled.div`
  position: absolute;
  top: 2px;
  height: 24px;
  background: ${({ theme }) => theme.colors.accentAlt};
  border-radius: 4px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  color: #0b0d12;
  font-size: 12px;
  cursor: grab;
  user-select: none;
`;

export const ClipGhost = styled(Clip)`
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.accentAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
