import styled from "styled-components";

export const Shell = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 320px 1fr 120px;
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
`;

export const RightSidebar = styled.aside`
  grid-area: rightsidebar;
  background: ${({ theme }) => theme.colors.panel};
  border-left: 1px solid ${({ theme }) => theme.colors.gridLine};
  padding: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const Header = styled.header`
  grid-area: header;
  background: ${({ theme }) => theme.colors.panelRaised};
  padding: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
  display: flex;
  align-items: center;
  justify-content: space-between;
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
