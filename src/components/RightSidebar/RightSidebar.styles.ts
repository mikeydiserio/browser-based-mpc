import styled from "styled-components";

export const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 60px;
  height: 100vh;
  background: linear-gradient(180deg, #2a2d31 0%, #1f2125 100%);
  border-left: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.03),
    -2px 0 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 16px;
`;

export const IconGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

export const IconButton = styled.button<{
  $color: string;
  $isHovered: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${(props) =>
    props.$isHovered ? props.$color : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${(props) => (props.$isHovered ? props.$color : "rgba(255, 255, 255, 0.1)")};
  border-radius: 8px;
  color: ${(props) => (props.$isHovered ? "#fff" : props.$color)};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$isHovered ? `0 0 20px ${props.$color}40` : "none"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
      0 0 20px ${(props) => props.$color}40;
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

export const Tooltip = styled.div`
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;

  &::after {
    content: "";
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left-color: rgba(0, 0, 0, 0.9);
  }
`;
