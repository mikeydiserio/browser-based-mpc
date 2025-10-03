import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${(p) => p.theme.colors.panel};
  border: 1px solid ${(p) => p.theme.colors.gridLine};
  border-radius: 4px;
  min-height: 250px;
`;

export const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SliderTrack = styled.div`
  position: relative;
  width: 40px;
  height: 150px;
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.gridLine};
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
`;

export const SliderFill = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    ${(p) => p.theme.colors.accentAlt},
    ${(p) => p.theme.colors.accent}
  );
  transition: height 0.05s ease-out;
  pointer-events: none;
`;

export const SliderThumb = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  left: 50%;
  transform: translate(-50%, 50%);
  width: ${(p) => (p.$isDragging ? "48px" : "44px")};
  height: 8px;
  background: ${(p) => p.theme.colors.textPrimary};
  border: 2px solid ${(p) => p.theme.colors.accentAlt};
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s ease;
  box-shadow: ${(p) =>
    p.$isDragging ? "0 0 8px rgba(33, 199, 190, 0.6)" : "none"};
`;

export const ValueDisplay = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.accent};
  font-family: "Courier New", monospace;
  min-width: 60px;
  text-align: center;
`;

export const PercentDisplay = styled.div`
  font-size: 10px;
  color: ${(p) => p.theme.colors.textSecondary};
  font-family: "Courier New", monospace;
`;
