import { useCallback, useState } from 'react';
import * as S from './KitSelector.styles';

type Props = {
  currentKit: number;
  kitNames: string[];
  onKitChange: (kitIndex: number) => void;
  onKitNameChange: (kitIndex: number, name: string) => void;
};

export function KitSelector({ currentKit, kitNames, onKitChange, onKitNameChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleNameClick = useCallback(() => {
    setEditValue(kitNames[currentKit - 1] || `Kit ${currentKit}`);
    setIsEditing(true);
  }, [currentKit, kitNames]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    []
  );

  const handleNameBlur = useCallback(() => {
    if (editValue.trim()) {
      onKitNameChange(currentKit, editValue.trim());
    }
    setIsEditing(false);
  }, [currentKit, editValue, onKitNameChange]);

  const handleNameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    []
  );

  return (
    <S.Container>
      {isEditing ? (
        <S.KitNameInput
          type="text"
          value={editValue}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleNameKeyDown}
          autoFocus
          onFocus={(e) => e.target.select()}
        />
      ) : (
        <S.KitNameInput
          type="text"
          value={kitNames[currentKit - 1] || `Kit ${currentKit}`}
          onClick={handleNameClick}
          readOnly
        />
      )}
      <S.KitSelector>
        {Array.from({ length: 8 }, (_, i) => i + 1).map((kitNum) => (
          <S.KitButton
            key={kitNum}
            $active={kitNum === currentKit}
            onClick={() => onKitChange(kitNum)}
          >
            {kitNum}
          </S.KitButton>
        ))}
      </S.KitSelector>
    </S.Container>
  );
}

export default KitSelector;

