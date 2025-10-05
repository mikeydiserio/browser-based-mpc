import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  background: ${({ theme }) => theme.colors.panelRaised};
  padding: 4px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

export const Button = styled.button<{ $primary?: boolean }>`
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.accent : theme.colors.pad};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: 12px;
  min-width: auto;

  &:active {
    transform: translateY(1px);
  }
`;

export const TempoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const Label = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 48px;
`;

export const Slider = styled.input.attrs({ type: "range" })`
  -webkit-appearance: none;
  appearance: none;
  width: 180px;
  height: 4px;
  background: ${({ theme }) => theme.colors.gridLine};
  border-radius: 6px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentAlt};
    cursor: pointer;
  }
`;

export const Select = styled.select`
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 6px;
  font-size: 12px;
`;

export const BPMInput = styled.input`
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 8px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-family: ${({ theme }) => theme.typography.mono};
  width: 60px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const ToggleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
