import { useCallback, useEffect, useState } from 'react';
import { loadAllKitNames } from '../../storage/local';
import { DRUM_KIT_PRESETS, type DrumKitPreset } from '../../utils/drumKits';
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
  const [allKits, setAllKits] = useState<DrumKitPreset[]>([]);

  // Create combined list of kits: presets + user kits
  useEffect(() => {
    const userKitNames = loadAllKitNames();
    const userKits: DrumKitPreset[] = [];
    for (let i = 1; i <= 8; i++) {
      if (userKitNames[i - 1] && userKitNames[i - 1] !== `Kit ${i}`) {
        userKits.push({
          id: `user-kit-${i}`,
          name: userKitNames[i - 1],
          path: '',
          samples: [],
          image: '',
        });
      }
    }

    // Combine preset kits with user kits at the end
    const combinedKits = [...DRUM_KIT_PRESETS, ...userKits];
    setAllKits(combinedKits);
  }, [kitNames]); // Update when kit names change

  // Reset carousel to start if kits change (e.g., a new kit was added)
  useEffect(() => {
    if (carouselIndex >= allKits.length) {
      setCarouselIndex(0);
    }
  }, [allKits.length, carouselIndex]);

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
    setCarouselIndex(prev => (prev === 0 ? allKits.length - 1 : prev - 1));
  }, [allKits.length]);

  const handleCarouselNext = useCallback(() => {
    setCarouselIndex(prev => (prev === allKits.length - 1 ? 0 : prev + 1));
  }, [allKits.length]);

  // Get current preset based on carousel index
  const currentPreset = allKits[carouselIndex];

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

      {onLoadPreset && allKits.length > 0 && (
        <S.Section>
          <S.Label>Drum Machines</S.Label>
          <S.CarouselContainer>
            <S.CarouselButton onClick={handleCarouselPrev}>
              ‹
            </S.CarouselButton>
            <S.CarouselContent>
              <S.PresetActions>
                <S.PresetItem
                  key={currentPreset?.id || 'empty'}
                  onClick={() => currentPreset && handlePresetClick(currentPreset.id)}
                  $active={currentPresetId === currentPreset?.id}
                >
                  {imageErrors[currentPreset?.id || ''] || !currentPreset?.image || currentPreset?.id.startsWith('user-kit-') ? (
                    <S.PresetImagePlaceholder>
                      {currentPreset?.id.startsWith('user-kit-') ? 'User' : 'No Img'}
                    </S.PresetImagePlaceholder>
                  ) : (
                    <S.PresetImage
                      src={currentPreset.image}
                      alt={currentPreset.name}
                      onError={() => handleImageError(currentPreset.id)}
                    />
                  )}
                  <S.PresetName>{currentPreset?.name || 'Loading...'}</S.PresetName>
                </S.PresetItem>
                {currentPresetId !== currentPreset?.id && (
                  <S.LoadButton onClick={() => currentPreset && handlePresetClick(currentPreset.id)}>
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
            {carouselIndex + 1} of {allKits.length}
          </S.CarouselIndicator>
        </S.Section>
      )}
    </S.Container>
  );
}

export default KitSelector;
