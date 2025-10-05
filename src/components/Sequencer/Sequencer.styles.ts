import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.panel};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 2px;
  grid-auto-rows: auto;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 100px var(--cols);
  gap: 6px;
  align-items: center;
  min-height: 0;
`;

export const RowLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8px;
  text-align: left;
  line-height: 1.2;
`;

export const RowSteps = styled.div`
  display: grid;
  grid-template-columns: var(--cols);
  gap: 4px;
`;

export const Step = styled.button<{
  $active?: boolean;
  $lit?: boolean;
  $accent?: boolean;
}>`
  width: 36px;
  height: 28px;
  border-radius: 4px;
  background: ${({ theme, $active, $lit, $accent }) =>
    $lit
      ? $accent
        ? theme.colors.stepAccentBeat
        : theme.colors.stepActive
      : $active
      ? theme.colors.accent
      : theme.colors.step};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  cursor: pointer;
  &:active {
    transform: translateY(1px);
  }
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 100px var(--cols);
  gap: 6px;
  align-items: center;
  margin-bottom: 2px;
`;

export const HeaderSpacer = styled.div`
  width: 100px;
`;

export const HeaderBeats = styled.div`
  display: grid;
  grid-template-columns: var(--cols);
  gap: 4px;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`;

export const PatternDisplay = styled.div`
  font-family: ${({ theme }) => theme.typography.mono};
  font-variant-numeric: tabular-nums;
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 8px;
  cursor: ns-resize;
  user-select: none;
`;

export const PatternInput = styled.input`
  width: 64px;
  font-family: ${({ theme }) => theme.typography.mono};
  font-variant-numeric: tabular-nums;
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: right;
`;

export const BeatLight = styled.div<{ $lit?: boolean; $accent?: boolean }>`
  height: 5px;
  border-radius: 4px;
  background: ${({ theme, $lit, $accent }) =>
    $lit
      ? $accent
        ? theme.colors.beatLightAccent
        : theme.colors.accentAlt
      : theme.colors.beatLight};
`;

export const BeatContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

export const SubdivisionNumber = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  line-height: 1;
  margin-top: 2px;
`;

export const BorderLine = styled.div`
  width: 1px;
  height: 12px;
  background: ${({ theme }) => theme.colors.gridLine};
  margin: 0 2px;
`;
