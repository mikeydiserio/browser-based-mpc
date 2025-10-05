import styled from 'styled-components'

export const Panel = styled.div<{ $left: number; $top: number; $visible: boolean }>`
  position: fixed;
  left: ${({ $left }) => `${$left}px`};
  top: ${({ $top }) => `${$top}px`};
  display: ${({ $visible }) => ($visible ? 'grid' : 'none')};
  grid-template-rows: auto 1fr;
  width: 820px;
  height: 380px;
  background: linear-gradient(180deg, #2a2d31 0%, #1f2125 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
  user-select: none;
  z-index: 1000;
`;

export const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(180deg, #3a3e44 0%, #2b2f35 100%);
  border-bottom: 1px solid rgba(0,0,0,0.6);
  cursor: move;
`;

export const Title = styled.div`
  color: #cfd4da;
  font-weight: 600;
  letter-spacing: 0.4px;
`;

export const HeaderButtons = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 8px;
`;

export const IconButton = styled.button`
  background: #1f2328;
  color: #d9dee4;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  &:hover {
    background: #262a2f;
  }
`;

export const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 12px;
`;

export const Channels = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(80px, 1fr);
  gap: 12px;
  align-items: end;
  padding: 8px 4px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.00) 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
`;

export const Rack = styled.div`
  display: grid;
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
  width: 220px;
  padding: 8px;
`;

export const Slot = styled.div`
  background: #23262b;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 6px;
  height: 56px;
  display: grid;
  align-items: center;
  padding: 6px 8px;
  color: #b3bac2;
`;


