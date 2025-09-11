import styled from "styled-components";

export const Container = styled.div`
  background: ${({ theme }) => theme.colors.panel};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

export const Control = styled.label`
  display: grid;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Slider = styled.input.attrs({ type: "range" })`
  width: 100%;
  height: 4px;
`;

export const Toggle = styled.input.attrs({ type: "checkbox" })``;
