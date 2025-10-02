import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 6px;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Name = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ToggleRow = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 3px 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accentAlt : theme.colors.panel};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.textSecondary};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px 10px;
`;

export const MetaItem = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  span {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const WaveCanvas = styled.canvas`
  width: 100%;
  height: 64px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

export const KnobRow = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;
