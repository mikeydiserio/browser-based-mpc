import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto 1fr auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.colors.panelRaised};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

export const Button = styled.button<{ $primary?: boolean }>`
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.accent : theme.colors.pad};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
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
  padding: 6px 8px;
`;

export const BPM = styled.div`
  font-variant-numeric: tabular-nums;
  font-family: ${({ theme }) => theme.typography.mono};
  width: 56px;
  text-align: right;
`;

export const ToggleGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
