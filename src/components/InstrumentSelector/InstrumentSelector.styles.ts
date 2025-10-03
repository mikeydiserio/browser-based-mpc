import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
  margin-bottom: 4px;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Item = styled.button<{ $active?: boolean; $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.background};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.border};
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.background : theme.colors.text};
  font-size: 13px;

  &:hover {
    background: ${({ theme, $selected }) =>
      $selected ? theme.colors.primary : theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Icon = styled.div`
  font-size: 16px;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Name = styled.div`
  flex: 1;
  text-align: left;
  font-weight: 500;
`;
