import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 100%;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Name = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PadInfo = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.panel};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const Subtitle = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  letter-spacing: 0.3px;
`;

export const VisualizerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.panel};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const VisualizerTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "●";
    color: #00ff88;
    font-size: 12px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
`;

export const VisualizerCanvas = styled.canvas`
  width: 100%;
  height: 180px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
`;

export const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.panel};
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const SectionTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
`;

export const WaveformButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const WaveIcon = styled.span`
  font-size: 14px;
  margin-right: 4px;
`;

export const WaveformButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accentAlt : theme.colors.panelRaised};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.background : theme.colors.textSecondary};
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  box-shadow: ${({ $active }) =>
    $active ? "0 0 12px rgba(255, 107, 0, 0.3)" : "none"};

  &:hover {
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accentAlt : theme.colors.panelRaised};
    border-color: ${({ theme }) => theme.colors.accentAlt};
    transform: translateY(-1px);
    box-shadow: 0 0 12px rgba(255, 107, 0, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const KnobRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 12px;
  justify-items: center;

  &:has(> :only-child) {
    grid-template-columns: 1fr;
    justify-items: start;
  }
`;
