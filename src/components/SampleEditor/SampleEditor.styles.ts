import styled from "styled-components";

export const Panel = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 10px;
`;

export const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const Button = styled.button`
  background: ${({ theme }) => theme.colors.pad};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 6px 10px;
  cursor: pointer;
`;

export const Wave = styled.canvas`
  width: 100%;
  height: 120px;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
`;


