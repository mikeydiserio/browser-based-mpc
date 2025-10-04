import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
`;

export const Title = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

export const EffectSlot = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 6px;
  display: grid;
  gap: 6px;
`;

export const SlotHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const SlotNumber = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentAlt};
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.panelRaised};
  border-radius: 50%;
  flex-shrink: 0;
`;

export const EffectSelect = styled.select`
  flex: 1;
  background: ${({ theme }) => theme.colors.panelRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }
`;

export const EffectParams = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
`;

export const DelayTimeButtons = styled.div`
  grid-column: span 3;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
`;

export const DelayTimeButton = styled.button<{ $active?: boolean }>`
  padding: 4px;
  font-size: 9px;
  font-weight: 600;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accentAlt : theme.colors.panel};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.panel : theme.colors.textPrimary};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const PingPongCheckbox = styled.div`
  grid-column: span 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.accentAlt};
  }

  label {
    font-size: 10px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    cursor: pointer;
    user-select: none;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
`;
