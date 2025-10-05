import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.panel};
`;

export const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 600;
`;

export const CurrentPattern = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
`;

export const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const PatternList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PatternListHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.panel};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PatternRow = styled.div<{ $isCurrent?: boolean }>`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
  padding: 8px 12px;
  background: ${({ theme, $isCurrent }) =>
    $isCurrent ? theme.colors.primary + "20" : theme.colors.surface};
  border: 1px solid
    ${({ theme, $isCurrent }) =>
      $isCurrent ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $isCurrent }) =>
      $isCurrent ? theme.colors.primary + "25" : theme.colors.panel};
  }
`;

export const PatternColumn = styled.div`
  display: flex;
  align-items: center;
`;

export const UsageColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ActionsColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const PatternButton = styled.button<{ $isCurrent?: boolean }>`
  background: ${({ theme, $isCurrent }) =>
    $isCurrent ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isCurrent }) =>
    $isCurrent ? theme.colors.surface : theme.colors.text};
  border: 1px solid
    ${({ theme, $isCurrent }) =>
      $isCurrent ? theme.colors.primary : theme.colors.border};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${({ theme, $isCurrent }) =>
      $isCurrent ? theme.colors.primary : theme.colors.panel};
  }
`;

export const UsageBadge = styled.span<{ $hasUsage?: boolean }>`
  background: ${({ theme, $hasUsage }) =>
    $hasUsage ? theme.colors.success : theme.colors.panel};
  color: ${({ theme, $hasUsage }) =>
    $hasUsage ? theme.colors.surface : theme.colors.textSecondary};
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
`;

export const SelectButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AddToTimelineSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.panel};
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SectionTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.text};
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
`;

export const Select = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const NumberInput = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  width: 60px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const AddButton = styled.button`
  background: ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.warning};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TimelinePreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TimelineGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

export const TrackPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

export const TrackName = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 11px;
  font-weight: 500;
  min-width: 80px;
  text-align: right;
`;

export const TrackClips = styled.div`
  position: relative;
  height: 20px;
  background: ${({ theme }) => theme.colors.panel};
  border-radius: 2px;
  flex: 1;
  overflow: hidden;
`;

export const ClipPreview = styled.div`
  position: absolute;
  top: 2px;
  height: 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.surface};
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;
