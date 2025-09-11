import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 150px);
  grid-template-rows: repeat(4, 150px);
  gap: 10px;
  background: ${({ theme }) => theme.colors.panel};
  padding: 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  width: fit-content;
`;

export const Pad = styled.button<{ $active?: boolean; $loaded?: boolean }>`
  position: relative;
  width: 150px;
  height: 150px;
  background: ${({ theme, $active, $loaded }) =>
    $active
      ? theme.colors.padActive
      : $loaded
      ? theme.colors.padLoaded
      : theme.colors.pad};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.inset};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.mono};
  user-select: none;
  &:active {
    transform: translateY(1px);
  }
  overflow: hidden;
`;

export const PadLabel = styled.span`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.9;
`;

export const PadName = styled.span`
  max-width: 88%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
`;
