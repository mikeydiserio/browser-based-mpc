import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
`

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333;
`

export const TrackIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${(props) => props.$color};
`

export const TrackName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
`

export const Subtitle = styled.div`
  font-size: 11px;
  color: #888;
  margin-left: auto;
`

export const SlotsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`

export const EffectSlot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
`

export const SlotHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const SlotNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #2a2a2a;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #888;
`

export const EffectSelect = styled.select`
  flex: 1;
  padding: 4px 8px;
  background: #0a0a0a;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  outline: none;

  &:hover {
    border-color: #555;
  }

  &:focus {
    border-color: #21c7be;
  }
`

export const EnableToggle = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #21c7be;
`

export const EffectParams = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
`

