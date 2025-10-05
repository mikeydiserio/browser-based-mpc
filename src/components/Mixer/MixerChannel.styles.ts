import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  background: linear-gradient(180deg, #2c3036 0%, #23262b 100%);
  border: 1px solid rgba(0, 0, 0, 0.6);
  border-radius: 2px;
  min-height: 340px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`;

export const Label = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: #8a9099;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
  margin-bottom: 4px;
`;

export const SliderTrack = styled.div`
  position: relative;
  width: 36px;
  height: 160px;
  background: linear-gradient(180deg, #1a1c20 0%, #0f1113 100%);
  border: 1px solid rgba(0, 0, 0, 0.8);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.02);
`;

export const WaveCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
  pointer-events: none;
`;

const getMeterGradient = (color: string) => {
  switch (color) {
    case "accent":
      return `linear-gradient(to top, 
        #00ff88 0%, 
        #00ff88 60%, 
        #ffdd00 75%, 
        #ff4400 90%, 
        #ff0000 100%)`;
    case "alt":
      return `linear-gradient(to top, 
        #00ddff 0%, 
        #00ddff 60%, 
        #ffaa00 75%, 
        #ff4400 90%, 
        #ff0000 100%)`;
    default:
      return `linear-gradient(to top, 
        #00cc77 0%, 
        #00ff88 60%, 
        #ffee00 75%, 
        #ff5500 90%, 
        #ff0000 100%)`;
  }
};

export const MeterFill = styled.div<{ $color: string }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(p) => getMeterGradient(p.$color)};
  transition: height 0.05s linear;
  pointer-events: none;
  opacity: 0.85;
  filter: blur(0.5px);
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.4),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
`;

export const SliderFill = styled.div<{ $color: string; $muted: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  border-left: 2px solid
    ${(p) =>
      p.$muted
        ? "#444"
        : p.$color === "accent"
        ? "#00ff88"
        : p.$color === "alt"
        ? "#00ddff"
        : "#00cc77"};
  border-right: 2px solid
    ${(p) =>
      p.$muted
        ? "#444"
        : p.$color === "accent"
        ? "#00ff88"
        : p.$color === "alt"
        ? "#00ddff"
        : "#00cc77"};
  transition: height 0.05s ease-out;
  pointer-events: none;
  opacity: ${(p) => (p.$muted ? 0.2 : 0.4)};
`;

export const SliderThumb = styled.div<{ $isDragging: boolean; $color: string }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: ${(p) => (p.$isDragging ? "44px" : "42px")};
  height: 8px;
  background: linear-gradient(180deg, #454950 0%, #2a2d32 100%);
  border: 1px solid
    ${(p) =>
      p.$color === "accent"
        ? "#00ff88"
        : p.$color === "alt"
        ? "#00ddff"
        : "#00cc77"};
  border-radius: 2px;
  pointer-events: none;
  transition: all 0.08s ease;
  box-shadow: ${(p) =>
    p.$isDragging
      ? "0 0 12px rgba(0, 255, 136, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
      : "0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"};

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
  }
`;

export const ValueDisplay = styled.div<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  color: ${(p) =>
    p.$color === "accent"
      ? "#00ff88"
      : p.$color === "alt"
      ? "#00ddff"
      : "#00cc77"};
  font-family: "Courier New", monospace;
  min-width: 60px;
  text-align: center;
  text-shadow: 0 0 4px rgba(0, 255, 136, 0.3);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 6px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.4);
`;

export const PercentDisplay = styled.div`
  font-size: 8px;
  color: #6a7079;
  font-family: "Courier New", monospace;
  font-weight: 600;
`;

export const PanControl = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin: 4px 0;
`;

export const PanKnob = styled.div<{ $rotation: number; $isDragging: boolean }>`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #3a3f45, #1e2126);
  border: 2px solid rgba(0, 0, 0, 0.8);
  cursor: pointer;
  transform: rotate(${(p) => p.$rotation}deg);
  transition: ${(p) => (p.$isDragging ? "none" : "transform 0.08s ease")};
  box-shadow: ${(p) =>
    p.$isDragging
      ? "0 0 12px rgba(0, 204, 119, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.6)"
      : "inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"};

  &:hover {
    border-color: rgba(0, 204, 119, 0.6);
    box-shadow: 0 0 8px rgba(0, 204, 119, 0.4),
      inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }
`;

export const PanIndicator = styled.div`
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 8px;
  background: linear-gradient(180deg, #00cc77 0%, #008855 100%);
  border-radius: 2px;
  box-shadow: 0 0 4px rgba(0, 204, 119, 0.6);
`;

export const PanLabel = styled.div`
  font-size: 8px;
  color: #6a7079;
  font-family: "Courier New", monospace;
  font-weight: 700;
  text-align: center;
  min-width: 30px;
`;

export const MuteButton = styled.button<{ $muted: boolean }>`
  width: 32px;
  height: 22px;
  font-size: 9px;
  font-weight: 800;
  background: ${(p) =>
    p.$muted
      ? "linear-gradient(180deg, #ff5544 0%, #dd3322 100%)"
      : "linear-gradient(180deg, #3a3e44 0%, #2b2f35 100%)"};
  color: ${(p) => (p.$muted ? "#ffffff" : "#8a9099")};
  border: 1px solid ${(p) => (p.$muted ? "#ff3322" : "rgba(0, 0, 0, 0.6)")};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.12s ease;
  text-transform: uppercase;
  box-shadow: ${(p) =>
    p.$muted
      ? "0 0 8px rgba(255, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      : "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 3px rgba(0, 0, 0, 0.3)"};

  &:hover {
    background: ${(p) =>
      p.$muted
        ? "linear-gradient(180deg, #ff6655 0%, #ee4433 100%)"
        : "linear-gradient(180deg, #454a50 0%, #34383d 100%)"};
    border-color: ${(p) => (p.$muted ? "#ff4433" : "#00cc77")};
    color: ${(p) => (p.$muted ? "#ffffff" : "#00cc77")};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${(p) =>
      p.$muted
        ? "0 0 6px rgba(255, 68, 68, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.3)"
        : "inset 0 1px 2px rgba(0, 0, 0, 0.4)"};
  }
`;
