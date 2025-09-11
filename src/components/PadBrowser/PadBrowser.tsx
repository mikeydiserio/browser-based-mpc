import * as S from './PadBrowser.styles'

type Props = {
  padNames: Record<number, string | undefined>
  activePads?: number[]
  onSelectPad?: (index: number) => void
  onTriggerPad?: (index: number) => void
}

export function PadBrowser({ padNames, activePads = [], onSelectPad, onTriggerPad }: Props) {
  const items = Array.from({ length: 16 }, (_, i) => i)
  return (
    <S.Container>
      <S.SectionTitle>Pads</S.SectionTitle>
      <S.List>
        {items.map((i) => {
          const name = padNames[i] ?? 'Empty'
          const active = activePads.includes(i)
          return (
            <S.Item key={i} $active={active} onClick={() => onSelectPad?.(i)} onDoubleClick={() => onTriggerPad?.(i)}>
              <S.PadBadge $active={active}>{i + 1}</S.PadBadge>
              <S.Name title={name}>{name}</S.Name>
            </S.Item>
          )
        })}
      </S.List>
    </S.Container>
  )
}

export default PadBrowser


