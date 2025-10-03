import { useCallback, useState } from 'react';
import { DRUM_KIT_PRESETS } from '../../utils/drumKits';
import * as S from './KitSelector.styles';

type Props = {
  currentKit: number;
  kitNames: string[];
  onKitChange: (kitIndex: number) => void;
  onKitNameChange: (kitIndex: number, name: string) => void;
  onLoadPreset?: (presetId: string) => void;
  currentPresetId?: string;
};

export function KitSelector({ 
  currentKit, 
  kitNames, 
  onKitChange, 
  onKitNameChange, 
  onLoadPreset,
  currentPresetId 
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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

  const handlePresetClick = useCallback(
    (presetId: string) => {
      if (onLoadPreset) {
        onLoadPreset(presetId);
      }
    },
    [onLoadPreset]
  );

  const handleImageError = useCallback((presetId: string) => {
    setImageErrors(prev => ({ ...prev, [presetId]: true }));
  }, []);

  return (
    <S.Container>
      <S.Section>
        <S.Label>User Kits</S.Label>
        <S.KitRow>
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
        </S.KitRow>
      </S.Section>
      
      {onLoadPreset && (
        <S.Section>
          <S.Label>Drum Machines</S.Label>
          <S.PresetList>
            {DRUM_KIT_PRESETS.map((preset) => (
              <S.PresetItem
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                $active={currentPresetId === preset.id}
              >
                {imageErrors[preset.id] ? (
                  <S.PresetImagePlaceholder>
                    No Img
                  </S.PresetImagePlaceholder>
                ) : (
                  <S.PresetImage
                    src={preset.image}
                    alt={preset.name}
                    onError={() => handleImageError(preset.id)}
                  />
                )}
                <S.PresetName>{preset.name}</S.PresetName>
              </S.PresetItem>
            ))}
          </S.PresetList>
        </S.Section>
      )}
    </S.Container>
  );
}

export default KitSelector;

