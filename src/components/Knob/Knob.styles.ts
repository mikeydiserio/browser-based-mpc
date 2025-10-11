import styled from "styled-components";

type KnobSize = "small" | "medium" | number;

const getSize = (size: KnobSize, small: string, medium: string) => {
  if (typeof size === "number") return `${size}px`;
  return size === "small" ? small : medium;
};

const getNumericSize = (size: KnobSize, small: number, medium: number) => {
  if (typeof size === "number") return size;
  return size === "small" ? small : medium;
};

export const Container = styled.div<{ $size: KnobSize }>`
  display: grid;
  justify-items: center;
  gap: ${({ $size }) =>
    typeof $size === "number" ? "8px" : $size === "small" ? "2px" : "6px"};
  padding: 0;
`;

export const Dial = styled.div<{
  $angle: number;
  $size: KnobSize;
  $color?: string;
}>`
  position: relative;
  width: ${({ $size }) => getSize($size, "28px", "48px")};
  height: ${({ $size }) => getSize($size, "28px", "48px")};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.panel};
  border: 3px solid ${({ $color }) => $color || "#333"};
  box-shadow: ${({ theme }) => theme.shadows.inset},
    ${({ $color }) =>
      $color ? `0 0 16px ${$color}33, 0 0 8px ${$color}22` : "none"};
  cursor: ns-resize;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $color }) => $color || "#555"};
    box-shadow: ${({ theme }) => theme.shadows.inset},
      ${({ $color }) =>
        $color ? `0 0 20px ${$color}44, 0 0 10px ${$color}33` : "none"};
  }

  &::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${({ $size }) => {
      const numSize = getNumericSize($size, 28, 48);
      return numSize < 40 ? "1.5px" : "3px";
    }};
    height: ${({ $size }) => {
      const numSize = getNumericSize($size, 28, 48);
      return `${numSize * 0.35}px`;
    }};
    background: ${({ $color, theme }) => $color || theme.colors.accentAlt};
    box-shadow: ${({ $color }) =>
      $color ? `0 0 8px ${$color}, 0 0 4px ${$color}bb` : "none"};
    transform-origin: ${({ $size }) => {
      const numSize = getNumericSize($size, 28, 48);
      return `50% ${numSize * 0.32}px`;
    }};
    transform: translate(
        -50%,
        ${({ $size }) => {
          const numSize = getNumericSize($size, 28, 48);
          return `-${numSize * 0.32}px`;
        }}
      )
      rotate(${({ $angle }) => $angle}deg);
    border-radius: 2px;
  }
`;

export const Label = styled.div<{ $size: KnobSize }>`
  font-size: ${({ $size }) =>
    typeof $size === "number" ? "11px" : $size === "small" ? "8px" : "10px"};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
  text-align: center;
  white-space: nowrap;
`;

export const Value = styled.div<{ $size: KnobSize }>`
  font-size: ${({ $size }) =>
    typeof $size === "number" ? "12px" : $size === "small" ? "8px" : "11px"};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;
