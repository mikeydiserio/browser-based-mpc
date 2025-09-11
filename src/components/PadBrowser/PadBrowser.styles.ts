import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.4px;
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
`;

export const Item = styled.li<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  background: ${({ theme }) => theme.colors.panel};
  box-shadow: ${({ $active, theme }) => ($active ? `0 0 0 2px ${theme.colors.accentAlt}` : 'none')};
  cursor: pointer;
`;

export const PadBadge = styled.div<{ $active?: boolean }>`
  width: 32px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.mono};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ $active, theme }) => ($active ? theme.colors.accentAlt : theme.colors.pad)};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const Name = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;


