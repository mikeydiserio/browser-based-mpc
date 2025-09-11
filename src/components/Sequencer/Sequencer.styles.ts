import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 10px;
  grid-template-rows: auto 1fr;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: var(--cols);
  gap: 4px;
`;

export const Step = styled.button<{
  $active?: boolean;
  $lit?: boolean;
  $accent?: boolean;
}>`
  height: 16px;
  border-radius: 6px;
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
  grid-template-columns: var(--cols);
  gap: 4px;
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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
