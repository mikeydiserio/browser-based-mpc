import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panelRaised};
  border: 1px solid ${({ theme }) => theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 6px 8px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  gap: 4px;
  max-width: 400px;
  max-height: 300px;
  width: fit-content;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Title = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ShowCurveToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: ${({ theme }) => theme.colors.textSecondary};

  input[type="checkbox"] {
    cursor: pointer;
    width: 12px;
    height: 12px;
  }

  label {
    cursor: pointer;
    user-select: none;
  }
`;

export const BandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
`;

export const Band = styled.div<{ $enabled: boolean }>`
  background: ${({ theme, $enabled }) =>
    $enabled ? theme.colors.panel : "transparent"};
  border: 1px solid
    ${({ theme, $enabled }) =>
      $enabled ? theme.colors.accentAlt : theme.colors.gridLine};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 3px;
  display: grid;
  gap: 1px;
  opacity: ${({ $enabled }) => ($enabled ? 1 : 0.4)};
  transition: all 0.15s ease;
  min-width: 0;
`;

export const BandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  margin-bottom: 1px;
  min-width: 0;
`;

export const BandLabel = styled.div`
  font-size: 7px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BandToggle = styled.input.attrs({ type: "checkbox" })`
  cursor: pointer;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
`;

export const KnobsGrid = styled.div`
  display: grid;
  gap: 1px;
`;
