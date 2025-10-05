import styled from "styled-components";

export const Shell = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 320px 1fr 280px;
  grid-template-areas:
    "sidebar header rightsidebar"
    "sidebar main rightsidebar"
    "sidebar footer rightsidebar";
  min-height: 100vh;
`;

export const Sidebar = styled.aside`
  grid-area: sidebar;
  background: ${({ theme }) => theme.colors.panel};
  border-right: 1px solid ${({ theme }) => theme.colors.gridLine};
  padding: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  display: grid;
  grid-auto-rows: max-content;
  gap: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
`;

export const RightSidebar = styled.aside`
  grid-area: rightsidebar;
  background: linear-gradient(180deg, #2a2d31 0%, #1f2125 100%);
  border-left: 1px solid rgba(0, 0, 0, 0.6);
  padding: 12px 8px;
  box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-around;
  gap: 6px;
`;

export const Header = styled.header`
  grid-area: header;
  background: ${({ theme }) => theme.colors.panelRaised};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const Main = styled.main`
  grid-area: main;
  padding: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: max-content;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Footer = styled.footer`
  grid-area: footer;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const FullRow = styled.div`
  grid-column: 1 / -1;
`;

export const HalfRow = styled.div`
  grid-column: span 1;
`;

// Panel Header Styles
export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.colors.panelRaised};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PanelIcon = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

export const PanelName = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const PadSelector = styled.div`
  position: relative;
`;

export const PadDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const PadDropdownButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: 4px;
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
  }
`;

export const DropdownArrow = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PadDropdownContent = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.dropdown};
  z-index: 1000;
  min-width: 120px;

  ${PadDropdown}:hover & {
    display: block;
  }
`;

export const PadDropdownItem = styled.div`
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

// Right side of panel header (pad selector + chevron)
export const PanelRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const PanelChevronButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
  }
`;

export const MixerToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
  }
`;
