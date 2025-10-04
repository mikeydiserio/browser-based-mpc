import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: ${(p) => p.theme.colors.panel};
  border: 1px solid ${(p) => p.theme.colors.gridLine};
  border-radius: 4px;
  min-height: 250px;
`;

export const Label = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
`;

export const SliderTrack = styled.div`
  position: relative;
  width: 32px;
  height: 120px;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.gridLine};
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
`;

const getColorGradient = (color: string, theme: any) => {
  switch (color) {
    case "accent":
      return `linear-gradient(to top, ${theme.colors.accent}, ${theme.colors.accentAlt})`;
    case "alt":
      return `linear-gradient(to top, #ff7a45, #ffa45c)`;
    default:
      return `linear-gradient(to top, ${theme.colors.accentAlt}, ${theme.colors.accent})`;
  }
};

export const MeterFill = styled.div<{ $color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(p) => getColorGradient(p.$color, p.theme)};
  transition: height 0.08s ease-out;
  pointer-events: none;
  opacity: 0.6;
  filter: brightness(1.2);
`;

export const SliderFill = styled.div<{ $color: string; $muted: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  border: 2px solid
    ${(p) =>
      p.$muted
        ? p.theme.colors.gridLine
        : p.$color === "accent"
        ? p.theme.colors.accent
        : p.$color === "alt"
        ? "#ff7a45"
        : p.theme.colors.accentAlt};
  transition: height 0.05s ease-out;
  pointer-events: none;
  opacity: ${(p) => (p.$muted ? 0.3 : 0.5)};
`;

export const SliderThumb = styled.div<{ $isDragging: boolean; $color: string }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: ${(p) => (p.$isDragging ? "40px" : "36px")};
  height: 6px;
  background: ${(p) => p.theme.colors.textPrimary};
  border: 2px solid
    ${(p) =>
      p.$color === "accent"
        ? p.theme.colors.accent
        : p.$color === "alt"
        ? "#ff7a45"
        : p.theme.colors.accentAlt};
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s ease;
  box-shadow: ${(p) =>
    p.$isDragging ? "0 0 6px rgba(33, 199, 190, 0.6)" : "none"};
`;

export const ValueDisplay = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  color: ${(p) =>
    p.$color === "accent"
      ? p.theme.colors.accent
      : p.$color === "alt"
      ? "#ff7a45"
      : p.theme.colors.accentAlt};
  font-family: "Courier New", monospace;
  min-width: 55px;
  text-align: center;
`;

export const PercentDisplay = styled.div`
  font-size: 9px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-family: "Courier New", monospace;
`;

export const MuteButton = styled.button<{ $muted: boolean }>`
  width: 28px;
  height: 20px;
  font-size: 10px;
  font-weight: 700;
  background: ${(p) => (p.$muted ? "#ff4444" : p.theme.colors.panel)};
  color: ${(p) => (p.$muted ? "#ffffff" : p.theme.colors.textPrimary)};
  border: 1px solid ${(p) => (p.$muted ? "#ff4444" : p.theme.colors.gridLine)};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-transform: uppercase;

  &:hover {
    background: ${(p) => (p.$muted ? "#cc0000" : p.theme.colors.panelRaised)};
    border-color: ${(p) => (p.$muted ? "#cc0000" : p.theme.colors.accentAlt)};
  }

  &:active {
    transform: scale(0.95);
  }
`;
