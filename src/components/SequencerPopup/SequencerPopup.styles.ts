import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PopupContainer = styled.div<{ $isMinimized: boolean }>`
  position: absolute;
  width: ${(props) => (props.$isMinimized ? "300px" : "700px")};
  height: ${(props) => (props.$isMinimized ? "60px" : "400px")};
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 2px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #2a2d31 0%, #1f2125 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
  padding: 12px 16px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.3px;
`;

export const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.accentAlt};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
  overflow: hidden;
`;
