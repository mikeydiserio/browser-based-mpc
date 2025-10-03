import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRecessed};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 8px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
`;

export const Canvas = styled.canvas`
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.xs};
  background: #1e1e1e;
  cursor: crosshair;
`;

export const Legend = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  font-size: 9px;
`;

export const LegendItem = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: ${({ $enabled }) => $enabled ? 1 : 0.4};
  transition: opacity 0.2s ease;
`;

export const ColorDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 1px solid #fff;
  flex-shrink: 0;
`;

export const BandName = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  min-width: 0;
  white-space: nowrap;
`;

export const BandInfo = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;