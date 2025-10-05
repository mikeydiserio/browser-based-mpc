import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  background: linear-gradient(180deg, #343840 0%, #282c32 100%);
  border: 1px solid rgba(0, 0, 0, 0.7);
  border-radius: 2px;
  min-height: 340px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 16px rgba(0, 255, 100, 0.1);
`;

export const Label = styled.div`
  font-size: 10px;
  font-weight: 800;
  color: #aabb00;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 0 6px rgba(170, 187, 0, 0.4);
  margin-bottom: 4px;
`;

export const SliderTrack = styled.div`
  position: relative;
  width: 44px;
  height: 160px;
  background: linear-gradient(180deg, #12151a 0%, #0a0c0f 100%);
  border: 1px solid rgba(0, 0, 0, 0.9);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7),
    0 2px 0 rgba(255, 255, 255, 0.02);
`;

export const SliderFill = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    #00ff44 0%,
    #00ff44 40%,
    #44ff00 55%,
    #aaff00 70%,
    #ffee00 80%,
    #ffaa00 88%,
    #ff6600 94%,
    #ff0000 100%
  );
  transition: height 0.05s linear;
  pointer-events: none;
  opacity: 0.95;
  filter: blur(0.3px);
  box-shadow: 0 0 16px rgba(0, 255, 68, 0.6),
    inset 0 -2px 0 rgba(255, 255, 255, 0.15);
`;

export const SliderThumb = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: ${(p) => (p.$isDragging ? "52px" : "50px")};
  height: 10px;
  background: linear-gradient(180deg, #55595e 0%, #3a3d42 100%);
  border: 2px solid #aaffee;
  border-radius: 2px;
  pointer-events: none;
  transition: all 0.08s ease;
  box-shadow: ${(p) =>
    p.$isDragging
      ? "0 0 16px rgba(170, 255, 238, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      : "0 3px 6px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)"};

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
  }
`;

export const ValueDisplay = styled.div`
  font-size: 11px;
  font-weight: 800;
  color: #aaffee;
  font-family: "Courier New", monospace;
  min-width: 65px;
  text-align: center;
  text-shadow: 0 0 6px rgba(170, 255, 238, 0.5);
  background: rgba(0, 0, 0, 0.4);
  padding: 5px 8px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.5);
`;

export const PercentDisplay = styled.div`
  font-size: 8px;
  color: #7a8089;
  font-family: "Courier New", monospace;
  font-weight: 600;
`;
