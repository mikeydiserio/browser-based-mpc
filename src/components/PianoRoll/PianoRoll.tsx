import { useCallback, useMemo, useRef, useState } from 'react';
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
  isPlaying: boolean;
  onTogglePlay: () => void;
  bpm: number;
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

export function PianoRoll({ notes, patch, steps, currentStep, onNotesChange, onPatchChange, isPlaying, onTogglePlay }: Props) {
  const [selectedTool, setSelectedTool] = useState<'draw' | 'accent' | 'slide'>('draw');
  const [resizingNote, setResizingNote] = useState<{ note: number; step: number; initialDuration: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const getNote = useCallback((note: number, step: number) => {
    return notes.find(n => n.note === note && n.startStep === step);
  }, [notes]);

  const handleResizeStart = useCallback((e: React.MouseEvent, note: number, step: number) => {
    e.stopPropagation();
    const noteData = getNote(note, step);
    if (noteData) {
      setResizingNote({ note, step, initialDuration: noteData.duration });
    }
  }, [getNote]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!resizingNote || !gridRef.current) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / steps;
    const mouseX = e.clientX - gridRect.left;
    const currentStepPosition = Math.max(0, Math.floor(mouseX / cellWidth));
    
    const newDuration = Math.max(1, Math.min(steps - resizingNote.step, currentStepPosition - resizingNote.step + 1));
    
    const noteIndex = notes.findIndex(n => n.note === resizingNote.note && n.startStep === resizingNote.step);
    if (noteIndex >= 0 && notes[noteIndex].duration !== newDuration) {
      const updated = [...notes];
      updated[noteIndex] = { ...updated[noteIndex], duration: newDuration };
      onNotesChange(updated);
    }
  }, [resizingNote, notes, steps, onNotesChange]);

  const handleMouseUp = useCallback(() => {
    setResizingNote(null);
  }, []);

  const isNoteCell = useCallback((note: number, step: number) => {
    // Check if this cell is part of a note (either start or continuation)
    return notes.find(n => 
      n.note === note && 
      step >= n.startStep && 
      step < n.startStep + n.duration
    );
  }, [notes]);

  const isNoteStart = useCallback((note: number, step: number) => {
    // Check if this cell is the start of a note
    return notes.find(n => n.note === note && n.startStep === step);
  }, [notes]);

  return (
    <S.Container
      onMouseMove={resizingNote ? handleMouseMove : undefined}
      onMouseUp={resizingNote ? handleMouseUp : undefined}
      onMouseLeave={resizingNote ? handleMouseUp : undefined}
    >
      <S.Header>
        <S.Title>TB-303 Piano Roll</S.Title>
        <S.Controls>
          <S.Button onClick={onTogglePlay} $active={isPlaying}>
            {isPlaying ? '⏸' : '▶'} {isPlaying ? 'Stop' : 'Play'}
          </S.Button>
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

        <S.RollGrid $steps={steps} ref={gridRef}>
          {midiNotes.flatMap((note) =>
            stepIndices.map((step) => {
              const noteInCell = isNoteCell(note, step);
              const noteStart = isNoteStart(note, step);
              const isLit = step === currentStep;
              const isAccent = step % 4 === 0;
              const showAccent = !!(noteInCell?.accent && selectedTool === 'accent');
              const showSlide = !!(noteInCell?.slide && selectedTool === 'slide');
              
              // Don't render cells that are part of a note but not the start
              if (noteInCell && !noteStart) {
                return null;
              }
              
              return (
                <S.Cell
                  key={`${note}-${step}`}
                  $hasNote={!!noteInCell}
                  $lit={isLit}
                  $isAccent={isAccent}
                  $isBlack={isBlackKey(note)}
                  $duration={noteStart?.duration || 1}
                  onClick={() => toggleNote(note, step)}
                  style={{
                    opacity: showAccent ? 1 : showSlide ? 0.7 : 1,
                    borderWidth: showSlide ? '2px' : '1px',
                    cursor: resizingNote ? 'ew-resize' : 'pointer',
                  }}
                >
                  {noteStart && (
                    <S.ResizeHandle
                      onMouseDown={(e: React.MouseEvent) => handleResizeStart(e, note, step)}
                      style={{ cursor: 'ew-resize' }}
                    />
                  )}
                </S.Cell>
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
