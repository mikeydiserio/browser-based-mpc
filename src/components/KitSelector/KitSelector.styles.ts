import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  gap: 12px;
`;

export const KitNameInput = styled.input`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }
`;

export const KitSelector = styled.div`
  display: flex;
  gap: 2px;
`;

export const KitButton = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 28px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.panel};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.textPrimary};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:active {
    transform: translateY(1px);
  }
`;
