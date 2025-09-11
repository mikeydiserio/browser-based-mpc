import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  justify-items: center;
  gap: 6px;
`;

export const Dial = styled.div<{ $angle: number }>`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  cursor: ns-resize;
  user-select: none;
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 2px;
    height: 18px;
    background: ${({ theme }) => theme.colors.accentAlt};
    transform-origin: 50% 16px;
    transform: translate(-50%, -16px) rotate(${({ $angle }) => $angle}deg);
    border-radius: 2px;
  }
`;

export const Label = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Value = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
`;
