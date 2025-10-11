import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #1a1a1a;
  border-radius: 4px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PadNumber = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #ff6b6b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px;
  background: #2a2a2a;
  border-radius: 3px;
`;

export const SampleName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WaveformContainer = styled.div<{ $isDragging?: boolean }>`
  position: relative;
  width: 100%;
  height: 80px;
  background: #0a0a0a;
  border-radius: 4px;
  border: 2px dashed ${(props) => (props.$isDragging ? "#21c7be" : "#333")};
  transition: border-color 0.2s;
  overflow: hidden;

  &:hover {
    border-color: ${(props) => (props.$isDragging ? "#21c7be" : "#555")};
  }
`;

export const WaveCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

export const DropHint = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  color: #666;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
`;

export const MetaRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #0a0a0a;
  border-radius: 4px;
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
`;

export const MetaLabel = styled.span`
  color: #888;
  font-weight: 500;
`;

export const MetaValue = styled.span`
  color: #e0e0e0;
  font-weight: 600;
`;

export const KnobRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-around;
  padding: 8px 0;
`;
