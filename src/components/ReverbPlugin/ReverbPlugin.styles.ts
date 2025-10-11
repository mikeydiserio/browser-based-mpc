import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #0a0a0a;
  border-radius: 8px;
  border: 1px solid #222;
  min-width: 600px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #222;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const Export = styled.button`
  padding: 6px 12px;
  background: #21c7be;
  color: #0a0a0a;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2ae6db;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const VisualizationSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

export const RoomVisualization = styled.div`
  background: #000;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #222;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RoomBox = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid #333;
  border-radius: 4px;
  background: linear-gradient(
    135deg,
    rgba(0, 102, 255, 0.05) 0%,
    rgba(204, 0, 255, 0.05) 100%
  );

  /* 3D perspective lines */
  &::before {
    content: "";
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    border: 1px solid #444;
    border-radius: 4px;
  }

  &::after {
    content: "";
    position: absolute;
    top: 20%;
    left: 20%;
    right: 20%;
    bottom: 20%;
    border: 1px solid #555;
    border-radius: 4px;
  }
`;

export const Source = styled.div<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  left: ${(props) => props.$x}%;
  top: ${(props) => props.$y}%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  box-shadow: 0 0 16px ${(props) => props.$color},
    0 0 8px ${(props) => props.$color}bb;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
`;

export const ControlColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const TypeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TypeLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TypeSelect = styled.select`
  padding: 10px 12px;
  background: #1a1a1a;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;

  &:hover {
    border-color: #21c7be;
    background: #222;
  }

  &:focus {
    border-color: #21c7be;
    box-shadow: 0 0 0 2px rgba(33, 199, 190, 0.2);
  }

  option {
    background: #1a1a1a;
    color: #e0e0e0;
  }
`;

export const RoomSizeControls = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
  background: #000;
  border-radius: 6px;
  border: 1px solid #222;
`;

export const RoomSizeKnob = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const KnobsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: #000;
  border-radius: 6px;
  border: 1px solid #222;
`;

export const KnobGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #222;
`;

export const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${(props) => props.$width}%;
  background: linear-gradient(90deg, #00ff88 0%, #21c7be 50%, #00d9ff 100%);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
`;
