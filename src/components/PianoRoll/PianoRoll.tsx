import { useCallback, useMemo, useState } from 'react';
import type { TB303Note, TB303Patch } from '../../audio/TB303Synth';
import Knob from '../Knob/Knob';
import * as S from './PianoRoll.styles';

type Props = {
  notes: TB303Note[];
  patch: TB303Patch;
  steps: number;
  currentStep: number;
  onNotesChange: (notes: TB303Note[]) => void;
  onPatchChange: (patch: Partial<TB303Patch>) => void;
};

// MIDI notes for 2 octaves (C2 to B3) - good range for bass
const START_NOTE = 36; // C2
const NOTE_COUNT = 24; // 2 octaves
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function isBlackKey(note: number): boolean {
  const pitchClass = note % 12;
  return [1, 3, 6, 8, 10].includes(pitchClass);
}

function getNoteName(midiNote: number): string {
  const octave = Math.floor(midiNote / 12) - 1;
  const pitchClass = midiNote % 12;
  return `${NOTE_NAMES[pitchClass]}${octave}`;
}

export function PianoRoll({ notes, patch, steps, currentStep, onNotesChange, onPatchChange }: Props) {
  const [selectedTool, setSelectedTool] = useState<'draw' | 'accent' | 'slide'>('draw');

  const midiNotes = useMemo(() => {
    return Array.from({ length: NOTE_COUNT }, (_, i) => START_NOTE + NOTE_COUNT - 1 - i);
  }, []);

  const stepIndices = useMemo(() => Array.from({ length: steps }, (_, i) => i), [steps]);

  const toggleNote = useCallback((note: number, step: number) => {
    const existingIndex = notes.findIndex(n => n.note === note && n.startStep === step);
    
    if (existingIndex >= 0) {
      if (selectedTool === 'draw') {
        // Remove note
        onNotesChange(notes.filter((_, i) => i !== existingIndex));
      } else if (selectedTool === 'accent') {
        // Toggle accent
        const updated = [...notes];
        updated[existingIndex] = { ...updated[existingIndex], accent: !updated[existingIndex].accent };
        onNotesChange(updated);
      } else if (selectedTool === 'slide') {
        // Toggle slide
        const updated = [...notes];
        updated[existingIndex] = { ...updated[existingIndex], slide: !updated[existingIndex].slide };
        onNotesChange(updated);
      }
    } else if (selectedTool === 'draw') {
      // Add new note
      onNotesChange([...notes, { note, startStep: step, duration: 1, accent: false, slide: false }]);
    }
  }, [notes, selectedTool, onNotesChange]);

  const hasNote = useCallback((note: number, step: number) => {
    return notes.some(n => n.note === note && n.startStep === step);
  }, [notes]);

  const getNote = useCallback((note: number, step: number) => {
    return notes.find(n => n.note === note && n.startStep === step);
  }, [notes]);

  return (
    <S.Container>
      <S.Header>
        <S.Title>TB-303 Piano Roll</S.Title>
        <S.Controls>
          <S.Button $active={selectedTool === 'draw'} onClick={() => setSelectedTool('draw')}>
            Draw
          </S.Button>
          <S.Button $active={selectedTool === 'accent'} onClick={() => setSelectedTool('accent')}>
            Accent
          </S.Button>
          <S.Button $active={selectedTool === 'slide'} onClick={() => setSelectedTool('slide')}>
            Slide
          </S.Button>
        </S.Controls>
      </S.Header>

      <S.Grid>
        <S.PianoKeys>
          {midiNotes.map((note) => (
            <S.PianoKey key={note} $isBlack={isBlackKey(note)}>
              {getNoteName(note)}
            </S.PianoKey>
          ))}
        </S.PianoKeys>

        <S.RollGrid $steps={steps}>
          {midiNotes.flatMap((note) =>
            stepIndices.map((step) => {
              const noteData = getNote(note, step);
              const hasNoteHere = hasNote(note, step);
              const isLit = step === currentStep;
              const isAccent = step % 4 === 0;
              const showAccent = !!(noteData?.accent && selectedTool === 'accent');
              const showSlide = !!(noteData?.slide && selectedTool === 'slide');
              
              return (
                <S.Cell
                  key={`${note}-${step}`}
                  $hasNote={hasNoteHere || showAccent || showSlide}
                  $lit={isLit}
                  $isAccent={isAccent}
                  $isBlack={isBlackKey(note)}
                  onClick={() => toggleNote(note, step)}
                  style={{
                    opacity: showAccent ? 1 : showSlide ? 0.7 : 1,
                    borderWidth: showSlide ? '2px' : '1px',
                  }}
                />
              );
            })
          )}
        </S.RollGrid>
      </S.Grid>

      <S.ParameterSection>
        <Knob
          label="Cutoff"
          min={0}
          max={1}
          step={0.01}
          value={patch.cutoff}
          onChange={(v) => onPatchChange({ cutoff: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          size="small"
        />
        <Knob
          label="Resonance"
          min={0}
          max={1}
          step={0.01}
          value={patch.resonance}
          onChange={(v) => onPatchChange({ resonance: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          size="small"
        />
        <Knob
          label="Env Mod"
          min={0}
          max={1}
          step={0.01}
          value={patch.envMod}
          onChange={(v) => onPatchChange({ envMod: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          size="small"
        />
        <Knob
          label="Decay"
          min={0.05}
          max={2}
          step={0.01}
          value={patch.decay}
          onChange={(v) => onPatchChange({ decay: v })}
          format={(v) => `${v.toFixed(2)}s`}
          size="small"
        />
        <Knob
          label="Accent"
          min={0}
          max={1}
          step={0.01}
          value={patch.accent}
          onChange={(v) => onPatchChange({ accent: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          size="small"
        />
        <S.Button
          $active={patch.waveform === 'sawtooth'}
          onClick={() => onPatchChange({ waveform: patch.waveform === 'sawtooth' ? 'square' : 'sawtooth' })}
        >
          Wave: {patch.waveform}
        </S.Button>
      </S.ParameterSection>
    </S.Container>
  );
}

export default PianoRoll;

