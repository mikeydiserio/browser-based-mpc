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
