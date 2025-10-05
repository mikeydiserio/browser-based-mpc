import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  gap: 12px;
  min-width: 0;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: 0.5px;
`;

export const KitRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const KitNameInput = styled.input`
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentAlt};
  }
`;

export const KitSelector = styled.div`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`;

export const KitButton = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 28px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.panel};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.textPrimary};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.panel};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gridLine};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

export const PresetItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent + "22" : theme.colors.panel};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  min-width: 0;

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accent + "33" : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const PresetImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  flex-shrink: 0;
`;

export const PresetImagePlaceholder = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;

export const PresetName = styled.span`
  flex: 1;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CarouselContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
`;

export const CarouselContent = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
`;

export const CarouselButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.panelRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.panel};
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const CarouselIndicator = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: 4px;
`;

export const PresetActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const LoadButton = styled.button`
  height: 28px;
  padding: 0 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(1px);
  }
`;
