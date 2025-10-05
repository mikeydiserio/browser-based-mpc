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
  isLoading?: boolean;
};

export function KitSelector({ 
  currentKit, 
  kitNames, 
  onKitChange, 
  onKitNameChange, 
  onLoadPreset,
  currentPresetId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  const handleCarouselPrev = useCallback(() => {
    setCarouselIndex(prev => (prev === 0 ? DRUM_KIT_PRESETS.length - 1 : prev - 1));
  }, []);

  const handleCarouselNext = useCallback(() => {
    setCarouselIndex(prev => (prev === DRUM_KIT_PRESETS.length - 1 ? 0 : prev + 1));
  }, []);

  // Get current preset based on carousel index
  const currentPreset = DRUM_KIT_PRESETS[carouselIndex];

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
          <S.CarouselContainer>
            <S.CarouselButton onClick={handleCarouselPrev}>
              ‹
            </S.CarouselButton>
            <S.CarouselContent>
              <S.PresetActions>
                <S.PresetItem
                  key={currentPreset.id}
                  onClick={() => handlePresetClick(currentPreset.id)}
                  $active={currentPresetId === currentPreset.id}
                >
                  {imageErrors[currentPreset.id] ? (
                    <S.PresetImagePlaceholder>
                      No Img
                    </S.PresetImagePlaceholder>
                  ) : (
                    <S.PresetImage
                      src={currentPreset.image}
                      alt={currentPreset.name}
                      onError={() => handleImageError(currentPreset.id)}
                    />
                  )}
                  <S.PresetName>{currentPreset.name}</S.PresetName>
                </S.PresetItem>
                {currentPresetId !== currentPreset.id && (
                  <S.LoadButton onClick={() => handlePresetClick(currentPreset.id)}>
                    Load Kit
                  </S.LoadButton>
                )}
              </S.PresetActions>
            </S.CarouselContent>
            <S.CarouselButton onClick={handleCarouselNext}>
              ›
            </S.CarouselButton>
          </S.CarouselContainer>
          <S.CarouselIndicator>
            {carouselIndex + 1} of {DRUM_KIT_PRESETS.length}
          </S.CarouselIndicator>
        </S.Section>
      )}
    </S.Container>
  );
}

export default KitSelector;
