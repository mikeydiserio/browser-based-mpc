import styled from "styled-components";

export const Container = styled.div<{ $size: "small" | "medium" }>`
  display: grid;
  justify-items: center;
  gap: ${({ $size }) => ($size === "small" ? "2px" : "6px")};
`;

export const Dial = styled.div<{ $angle: number; $size: "small" | "medium" }>`
  position: relative;
  width: ${({ $size }) => ($size === "small" ? "28px" : "48px")};
  height: ${({ $size }) => ($size === "small" ? "28px" : "48px")};
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
    width: ${({ $size }) => ($size === "small" ? "1.5px" : "2px")};
    height: ${({ $size }) => ($size === "small" ? "10px" : "18px")};
    background: ${({ theme }) => theme.colors.accentAlt};
    transform-origin: ${({ $size }) =>
      $size === "small" ? "50% 9px" : "50% 16px"};
    transform: translate(
        -50%,
        ${({ $size }) => ($size === "small" ? "-9px" : "-16px")}
      )
      rotate(${({ $angle }) => $angle}deg);
    border-radius: 2px;
  }
`;

export const Label = styled.div<{ $size: "small" | "medium" }>`
  font-size: ${({ $size }) => ($size === "small" ? "8px" : "10px")};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Value = styled.div<{ $size: "small" | "medium" }>`
  font-size: ${({ $size }) => ($size === "small" ? "8px" : "11px")};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
`;
