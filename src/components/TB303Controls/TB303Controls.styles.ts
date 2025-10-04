import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 8px;
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

export const Section = styled.div`
  display: grid;
  gap: 6px;
`;

export const SectionTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const WaveformButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

export const WaveformButton = styled.button<{ $active: boolean }>`
  padding: 6px 10px;
  font-size: 11px;
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

export const KnobRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  &:has(> :only-child) {
    grid-template-columns: auto;
    justify-content: start;
  }
`;
