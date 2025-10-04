import * as S from './InstrumentSelector.styles';

export type InstrumentType = 'sample' | 'tb303';

type Props = {
  selectedPad?: number;
  currentInstrument?: InstrumentType;
  onSelectInstrument: (type: InstrumentType) => void;
};

const instruments = [
  { type: 'sample' as InstrumentType, name: 'Sample', icon: '🎵' },
];

export function InstrumentSelector({ selectedPad, currentInstrument, onSelectInstrument }: Props) {
  return (
    <S.Container>
      <S.SectionTitle>
        {selectedPad !== undefined ? `Pad ${selectedPad + 1} Instrument` : 'Select a Pad'}
      </S.SectionTitle>
      <S.List>
        {instruments.map((inst) => (
          <S.Item
            key={inst.type}
            $selected={currentInstrument === inst.type}
            onClick={() => onSelectInstrument(inst.type)}
            disabled={selectedPad === undefined}
          >
            <S.Icon>{inst.icon}</S.Icon>
            <S.Name>{inst.name}</S.Name>
          </S.Item>
        ))}
      </S.List>
    </S.Container>
  );
}

export default InstrumentSelector;

