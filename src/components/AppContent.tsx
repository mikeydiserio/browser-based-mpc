import Shaders from '@/shaders/shaders'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioEngine } from '../audio/AudioEngine'
import type { EffectSlot, EffectsChain } from '../audio/effects'
import { createDefaultEffectsChain } from '../audio/effects'
import type { EQBand, EQSettings } from '../audio/eq'
import { createDefaultEQSettings } from '../audio/eq'
import type { TB303Note, TB303Patch } from '../audio/TB303Synth'
import { useTB303 } from '../contexts/TB303Context'
import type { PersistedSample, TimelineTrack } from '../storage/local'
import { arrayBufferToBase64, base64ToArrayBuffer, loadAllKitNames, loadBpm, loadMetronomeEnabled, loadPatternByIndex, loadSamples, loadSamplesForSet, loadSwing, loadTimeline, saveBpm, saveKitName, saveMetronomeEnabled, savePatternByIndex, saveSamples, saveSamplesForSet, saveSwing, saveSynthsForSet, saveTimeline } from '../storage/local'
import { getDrumKitPreset, getDrumKitSampleUrls } from '../utils/drumKits'
import Chat from './Chat/Chat'
import FX from './FX/FX'
import KitSelector from './KitSelector/KitSelector'
import * as L from './layout/AppShell.styles'
import MasterWaveform from './MasterWaveform/MasterWaveform'
import { MixerFooter } from './MixerFooter/MixerFooter'
import PadBrowser from './PadBrowser/PadBrowser'
import PadGrid from './PadGrid/PadGrid'
import ParametricEQ from './ParametricEQ/ParametricEQ'
import PianoRoll from './PianoRoll/PianoRoll'
import { RightSidebar } from './RightSidebar/RightSidebar'
import SampleEditor from './SampleEditor/SampleEditor'
import SampleInfo from './SampleInfo/SampleInfo'
import Sequencer from './Sequencer/Sequencer'
import { SequencerPopup } from './SequencerPopup/SequencerPopup'
import { SessionView } from './session-view'
import { TB303Popup } from './TB303Popup/TB303Popup'
import Timeline from './Timeline/Timeline'
import Transport from './Transport/Transport'

// Panel Header Component
type PanelHeaderProps = {
  title: string
  icon: string
  currentPad?: number
  assignedPads?: number[]
  onPadChange?: (padIndex: number) => void
  padNames?: Record<number, string | undefined>
  collapsed?: boolean
  onToggleCollapse?: () => void
}

function PanelHeader({ title, icon, currentPad, assignedPads, onPadChange, padNames, collapsed, onToggleCollapse }: PanelHeaderProps) {
  return (
    <L.PanelHeader>
      <L.PanelTitle>
        <L.PanelIcon>{icon}</L.PanelIcon>
        <L.PanelName>{title}</L.PanelName>
      </L.PanelTitle>
      <L.PanelRight>
        {currentPad !== undefined && assignedPads && assignedPads.length > 1 && onPadChange && assignedPads.includes(currentPad) && (
          <L.PadSelector>
            <L.PadDropdown>
              <L.PadDropdownButton>
                {padNames && padNames[currentPad] ? `Pad ${currentPad + 1}: ${padNames[currentPad]}` : `Pad ${currentPad + 1}`}
                <L.DropdownArrow>▼</L.DropdownArrow>
              </L.PadDropdownButton>
              <L.PadDropdownContent>
                {assignedPads.map(padIndex => (
                  <L.PadDropdownItem
                    key={padIndex}
                    onClick={() => onPadChange(padIndex)}
                  >
                    {padNames && padNames[padIndex] ? `Pad ${padIndex + 1}: ${padNames[padIndex]}` : `Pad ${padIndex + 1}`}
                  </L.PadDropdownItem>
                ))}
              </L.PadDropdownContent>
            </L.PadDropdown>
          </L.PadSelector>
        )}
        {onToggleCollapse && (
          <L.PanelChevronButton onClick={onToggleCollapse} aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}>
            {collapsed ? '▸' : '▾'}
          </L.PanelChevronButton>
        )}
      </L.PanelRight>
    </L.PanelHeader>
  )
}

export function AppContent() {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState<number>(() => loadBpm(120))
  const [swing, setSwing] = useState<number>(() => loadSwing(0))
  const [metronomeOn, setMetronomeOn] = useState<boolean>(() => loadMetronomeEnabled(true))
  const [currentStep, setCurrentStep] = useState(0)
  const [activePad, setActivePad] = useState<number | undefined>(undefined)
  const [activePads, setActivePads] = useState<number[]>([])
  const [padNames, setPadNames] = useState<Record<number, string | undefined>>({})
  const [matrix, setMatrix] = useState<boolean[][]>(() => Array.from({ length: 16 }, () => Array(16).fill(false)))
  const [steps, setSteps] = useState<number>(16)
  const [patternIndex, setPatternIndex] = useState<number>(1)
  const [arrangementOn, setArrangementOn] = useState<boolean>(false)
  const [sequencerMode, setSequencerMode] = useState<boolean>(true)
  const [timelineBar, setTimelineBar] = useState<number>(0)
  const [kitIndex, setKitIndex] = useState<number>(1)
  const [kitNames, setKitNames] = useState<string[]>(() => loadAllKitNames())
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>(undefined)
  const [isLoadingKit, setIsLoadingKit] = useState<boolean>(false)
  const [selectedPad, setSelectedPad] = useState<number>(0)
  const [controls, setControls] = useState({ warp: false, quantize: true, loop: false, hold: false })
  const [view] = useState<'mpc' | 'session' | 'timeline' | 'chat'>('session')
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>('midi-0') // Default to MIDI 1 (MPC instrument)
  const [showSplash, setShowSplash] = useState(true)
  const [tracks, setTracks] = useState<TimelineTrack[]>(() => loadTimeline().length ? loadTimeline() : [
    { name: 'Drums', clips: [] },
    { name: 'Bass', clips: [] },
    { name: 'Synth', clips: [] },
  ])
  const [isTB303PopupOpen, setIsTB303PopupOpen] = useState(false)
  const [isSequencerPopupOpen, setIsSequencerPopupOpen] = useState(false)
  const bpmRef = useRef<number>(bpm)
  
  // Get TB-303 state and refs from context
  const {
    tb303Patch,
    tb303Notes,
    tb303Playing,
    tb303Fx,
    tb303SynthRef,
    setTb303Patch,
    setTb303Notes,
    setTb303Fx,
    toggleTb303Play,
    tb303PlayingRef,
    tb303MutedRef,
    tb303NotesRef,
    tb303PatchRef,
    initialize: initializeTB303,
  } = useTB303()
  
  const [selectedMeta, setSelectedMeta] = useState<{
    duration?: number; 
    sampleRate?: number; 
    channels?: number; 
    pcm?: Float32Array | null;
    pitch?: number;
    gain?: number;
    attack?: number; 
    decay?: number; 
    sustain?: number; 
    release?: number;
    eq?: EQSettings;
    effectsChain?: EffectsChain;
  }>({})

  // Collapsed state per panel
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    'Sample Info': false,
    'Parametric EQ': false,
    'Pad Grid': false,
    'Effects': false,
    'Sequencer': false,
    'TB-303 Controls': false,
    'Piano Roll': false,
    'Sample Editor': false,
    'Timeline': false,
    'Chat': false,
  })

  const togglePanel = useCallback((key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(t)
  }, [])

  // Setup audio engine on mount
  useEffect(() => {
    ;(async () => {
      const e = new AudioEngine()
      // Ensure AudioContext resumes after the first user gesture
      e.enableAutoResume()
    e.setBpm(bpm)
    e.setMetronome(metronomeOn)
    e.setSequencerEnabled(sequencerMode)
    const stepCb = ({ stepIndex, time }: { stepIndex: number; time: number }) => {
      setCurrentStep(stepIndex)
      // Schedule TB-303 notes at precise engine time to avoid UI latency
      const synth = tb303SynthRef.current
      if (!synth || !tb303PlayingRef.current || tb303MutedRef.current) return
      const notesAtStep = tb303NotesRef.current.filter((n: TB303Note) => n.startStep === stepIndex)
      if (notesAtStep.length === 0) return

      const secondsPerBeat = 60.0 / bpmRef.current
      const stepDuration = secondsPerBeat / 4 // 16th note

      for (const note of notesAtStep) {
        const baseDuration = note.duration * stepDuration
        const noteDuration = baseDuration * (tb303PatchRef.current.noteLength ?? 1)

        // Check if previous note has slide flag
        let slideFrom: number | undefined
        if (note.slide && stepIndex > 0) {
          const prevNotes = tb303NotesRef.current.filter((n: TB303Note) => n.startStep < stepIndex)
          if (prevNotes.length > 0) {
            const lastNote = prevNotes.reduce((a: TB303Note, b: TB303Note) => a.startStep > b.startStep ? a : b)
            slideFrom = lastNote.note
          }
        }

        synth.triggerNote(note.note, time, noteDuration, note.accent, slideFrom)
      }
    }
    e.onStep(stepCb)
    const onBar = (barIdx: number) => {
      // track current bar for timeline progress indicator
      setTimelineBar(barIdx)
      if (!arrangementOn || !isPlaying) return
      for (const t of tracks) {
        const clip = t.clips.find(c => barIdx >= c.startBar && barIdx < c.startBar + c.lengthBars)
        if (clip?.patternIndex) {
          if (clip.patternIndex !== patternIndex) onPatternChange(clip.patternIndex)
          break
        }
      }
    }
    e.onBar(onBar)
    engineRef.current = e

      // Setup audio context
      const audioContext = e['audioContext']

      // Initialize TB-303 synth through context
      initializeTB303(audioContext, e['masterGain'], e)

      // Restore persisted state: pattern 1 with empty fallback sized to current steps
    const makeEmpty = (n: number) => Array.from({ length: 16 }, () => Array(n).fill(false))
    const initial = loadPatternByIndex(1, makeEmpty(steps))
    // normalize to current steps length
    const normalized = initial.map(r => {
      const row = r.slice(0, steps)
      while (row.length < steps) row.push(false)
      return row
    })
    setMatrix(normalized)
    e.setSteps(steps)
    e.setPattern(normalized)
    const persistedSamples = loadSamples()
    if (persistedSamples.length) {
      ;(async () => {
        for (const s of persistedSamples) {
          const padIndex = Number(s.id.replace('pad-', ''))
          const arrayBuffer = base64ToArrayBuffer(s.arrayBufferBase64)
          await e.loadArrayBufferToPad(padIndex, arrayBuffer, s.name)
          setPadNames((prev) => ({ ...prev, [padIndex]: s.name }))
        }
      })()
        }

      return () => {
        e.stop()
      }
      })()
    // We intentionally only run on mount to initialize engine; subsequent state updates are handled by other effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engineRef.current?.setBpm(bpm)
    saveBpm(bpm)
  }, [bpm])

  useEffect(() => {
    engineRef.current?.setMetronome(metronomeOn)
    saveMetronomeEnabled(metronomeOn)
  }, [metronomeOn])

  useEffect(() => {
    engineRef.current?.setSequencerEnabled(sequencerMode)
  }, [sequencerMode])

  useEffect(() => {
    engineRef.current?.setSwing(swing)
    saveSwing(swing)
  }, [swing])

  useEffect(() => { bpmRef.current = bpm }, [bpm])

  const togglePlay = useCallback(() => {
    const e = engineRef.current!
    if (!isPlaying) {
      e.start()
      setIsPlaying(true)
    } else {
      e.stop()
      setIsPlaying(false)
    }
  }, [isPlaying])

  const onPatternChange = useCallback((idx: number) => {
    setPatternIndex(idx)
    setMatrix(() => {
      const makeEmpty = (n: number) => Array.from({ length: 16 }, () => Array(n).fill(false))
      const fallback = makeEmpty(steps)
      const loaded = loadPatternByIndex(idx, fallback)
      // ensure matrix matches current steps
      const normalized = loaded.map(r => {
        const row = r.slice(0, steps)
        while (row.length < steps) row.push(false)
        return row
      })
      engineRef.current?.setSteps(steps)
      engineRef.current?.setPattern(normalized)
      return normalized
    })
  }, [steps])

  const toggleTimelinePlay = useCallback(() => {
    const e = engineRef.current!
    if (isPlaying && arrangementOn) {
      e.stop()
      setIsPlaying(false)
      setArrangementOn(false)
      setTimelineBar(0)
    } else {
      // If currently playing the pattern loop, stop to reset transport and bar counter
      if (isPlaying) {
        e.stop()
        setIsPlaying(false)
      }
      setArrangementOn(true)
      setTimelineBar(0)
      // Ensure we start with the pattern for bar 0 if defined
      for (const t of tracks) {
        const clip = t.clips.find(c => 0 >= c.startBar && 0 < c.startBar + c.lengthBars)
        if (clip?.patternIndex) {
          if (clip.patternIndex !== patternIndex) onPatternChange(clip.patternIndex)
          break
        }
      }
      e.start()
      setIsPlaying(true)
    }
  }, [isPlaying, arrangementOn, tracks, patternIndex, onPatternChange])

  const onDropSample = useCallback(async (padIndex: number, file: File) => {
    const e = engineRef.current!
    const sample = await e.loadSampleToPad(padIndex, file)
    setPadNames((prev) => ({ ...prev, [padIndex]: file.name }))
    // Persist
    const current = loadSamples()
    const base64 = arrayBufferToBase64(sample.arrayBuffer)
    const updated = [
      ...current.filter((s) => s.id !== sample.id),
      { id: sample.id, name: sample.name, arrayBufferBase64: base64, pitchSemitones: 0, warp: false, quantize: true, loop: false, hold: false } as PersistedSample
    ]
    saveSamples(updated)
  }, [])

  const onTriggerPad = useCallback((padIndex: number) => {
    setActivePad(padIndex)
    engineRef.current?.triggerPad(padIndex)
    setActivePads((prev) => Array.from(new Set([...prev, padIndex])))
    setTimeout(() => {
      setActivePad(undefined)
      setActivePads((prev) => prev.filter((i) => i !== padIndex))
    }, 120)
  }, [])

  useEffect(() => {
    const sample = engineRef.current?.getSampleForPad(selectedPad)
    if (sample?.audioBuffer) {
      const ch0 = sample.audioBuffer.getChannelData(0)
      setSelectedMeta({ 
        duration: sample.audioBuffer.duration, 
        sampleRate: sample.audioBuffer.sampleRate, 
        channels: sample.audioBuffer.numberOfChannels, 
        pcm: ch0,
        pitch: sample.pitchSemitones,
        gain: sample.gain,
        attack: sample.attack, 
        decay: sample.decay, 
        sustain: sample.sustain, 
        release: sample.release,
        eq: sample.eq,
        effectsChain: sample.effectsChain,
      })
    } else {
      setSelectedMeta({})
    }
  }, [selectedPad, padNames])

  // Flash pads on sequencer step
  useEffect(() => {
    const step = currentStep
    const toFlash: number[] = []
    for (let r = 0; r < matrix.length; r++) {
      if (matrix[r]?.[step]) toFlash.push(r)
    }
    if (toFlash.length === 0) return
    setActivePads((prev) => Array.from(new Set([...prev, ...toFlash])))
    const t = setTimeout(() => {
      setActivePads((prev) => prev.filter((i) => !toFlash.includes(i)))
    }, 120)
    return () => clearTimeout(t)
  }, [currentStep, matrix])

  const onToggleStep = useCallback((row: number, col: number) => {
    setMatrix((prev) => {
      const next = prev.map((r) => r.slice())
      next[row][col] = !next[row][col]
      engineRef.current?.setPattern(next)
      savePatternByIndex(patternIndex, next)
      return next
    })
  }, [patternIndex])

  const handleStepsChange = useCallback((n: number) => {
    setSteps(n)
    engineRef.current?.setSteps(n)
    setMatrix(prev => {
      const next = prev.map(r => {
        const row = r.slice(0, n)
        while (row.length < n) row.push(false)
        return row
      })
      engineRef.current?.setPattern(next)
      savePatternByIndex(patternIndex, next)
      return next
    })
  }, [patternIndex])

  // Arrow keys change pattern by ±5
  // Keyboard: pattern up/down and kit switch
  const patternRef = useRef(patternIndex)
  const kitRef = useRef(kitIndex)
  useEffect(() => { patternRef.current = patternIndex }, [patternIndex])
  useEffect(() => { kitRef.current = kitIndex }, [kitIndex])

  const onChangeControls = useCallback((changes: Partial<typeof controls>) => {
    setControls((prev) => ({ ...prev, ...changes }))
    // TODO: wire into AudioEngine per-pad settings if needed
  }, [])

  const onChangeSampleInfo = useCallback((changes: Partial<{ pitch: number; gain: number; attack: number; decay: number; sustain: number; release: number }>) => {
    const e = engineRef.current
    if (!e) return
    if (changes.pitch !== undefined) {
      e.setPadPitch(selectedPad, changes.pitch)
      // Immediately update state
      setSelectedMeta((prev) => ({ ...prev, pitch: changes.pitch }))
    }
    if (changes.gain !== undefined) {
      e.setPadGain(selectedPad, changes.gain)
      // Immediately update state
      setSelectedMeta((prev) => ({ ...prev, gain: changes.gain }))
    }
    if (changes.attack !== undefined || changes.decay !== undefined || changes.sustain !== undefined || changes.release !== undefined) {
      e.setPadAdsr(selectedPad, { attack: changes.attack, decay: changes.decay, sustain: changes.sustain, release: changes.release })
      // Immediately update state with the values we just set
      setSelectedMeta((prev) => ({
        ...prev,
        attack: changes.attack ?? prev.attack,
        decay: changes.decay ?? prev.decay,
        sustain: changes.sustain ?? prev.sustain,
        release: changes.release ?? prev.release,
      }))
    }
  }, [selectedPad])

  const onChangeEffectSlot = useCallback((slotIndex: number, effect: EffectSlot) => {
    const e = engineRef.current
    if (!e) return
    e.updatePadEffectSlot(selectedPad, slotIndex, effect)
    // Force state update with new reference
    const sample = e.getSampleForPad(selectedPad)
    if (sample) {
      // Create new array reference to ensure React detects change
      setSelectedMeta((prev) => ({
        ...prev,
        effectsChain: [...sample.effectsChain] as EffectsChain,
      }))
    }
  }, [selectedPad])

  const onChangeEQBand = useCallback((bandIndex: number, band: EQBand) => {
    const e = engineRef.current
    if (!e) return
    e.updatePadEQBand(selectedPad, bandIndex, band)
    // Force state update with new reference - deep copy to ensure React detects change
    const sample = e.getSampleForPad(selectedPad)
    if (sample) {
      setSelectedMeta((prev) => ({
        ...prev,
        eq: sample.eq.map(b => ({ ...b })) as EQSettings,
      }))
    }
  }, [selectedPad])

  const saveCurrentKit = useCallback((kitId: number) => {
    const e = engineRef.current
    if (!e) return
    const samples: PersistedSample[] = []

    for (let i = 0; i < 16; i++) {
      const s = e.getSampleForPad(i)
      if (s && s.arrayBuffer) {
        samples.push({
          id: `pad-${i}`,
          name: s.name,
          arrayBufferBase64: arrayBufferToBase64(s.arrayBuffer),
          pitchSemitones: s.pitchSemitones ?? 0,
          attack: s.attack ?? 0.005,
          decay: s.decay ?? 0.05,
          sustain: s.sustain ?? 0.8,
          release: s.release ?? 0.08,
          warp: s.warp ?? false,
          quantize: s.quantize ?? true,
          loop: s.loop ?? false,
          hold: s.hold ?? false,
        })
      }
    }
    saveSamplesForSet(kitId, samples)
    saveSynthsForSet(kitId, []) // Save empty synths array to clear any old synth data
  }, [])

  const loadKit = useCallback((kitId: number) => {
    const e = engineRef.current
    if (!e) return
    
    // Clear all pads from the engine and state
    e.clearAllPads()
    setPadNames({})
    
    const sampleList = loadSamplesForSet(kitId)
    
    // Load samples
    if (sampleList.length > 0) {
      ;(async () => {
        for (const s of sampleList) {
          const padIndex = Number(s.id.replace('pad-', ''))
          const ab = base64ToArrayBuffer(s.arrayBufferBase64)
          await e.loadArrayBufferToPad(padIndex, ab, s.name)
          e.setPadPitch(padIndex, s.pitchSemitones ?? 0)
          e.setPadAdsr(padIndex, { attack: (s as PersistedSample).attack, decay: (s as PersistedSample).decay, sustain: (s as PersistedSample).sustain, release: (s as PersistedSample).release })
          setPadNames((prev) => ({ ...prev, [padIndex]: s.name }))
        }
      })()
    }
  }, [])

  // Arrangement playback: switch pattern at bar boundaries
  useEffect(() => {
    if (!arrangementOn || !isPlaying) return
    if (currentStep !== 0) return
    const barsElapsed = Math.floor((performance.now() / 1000) * (bpm / 60) / 1) // rough fallback
    const bar = barsElapsed // not accurate without transport position; placeholder
    for (const t of tracks) {
      const clip = t.clips.find(c => bar >= c.startBar && bar < c.startBar + c.lengthBars)
      if (clip?.patternIndex) {
        if (clip.patternIndex !== patternIndex) onPatternChange(clip.patternIndex)
        break
      }
    }
  }, [arrangementOn, isPlaying, currentStep, bpm, tracks, patternIndex, onPatternChange])

  const onAssignSlice = useCallback((padIndex: number, name: string, startSec: number, durationSec: number) => {
    const e = engineRef.current
    if (!e) return
    // We don't have the source arrayBuffer here; reuse existing if present
    const existing = e.getSampleForPad(padIndex)
    if (!existing?.audioBuffer || !existing?.arrayBuffer) return
    e.assignSliceToPad(padIndex, name, existing.audioBuffer, existing.arrayBuffer, startSec, durationSec)
    setPadNames((prev) => ({ ...prev, [padIndex]: name }))
  }, [])

  // Install key handlers (after callbacks are defined)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const delta = e.key === 'ArrowUp' ? 5 : -5
        const next = Math.max(1, Math.min(99, patternRef.current + delta))
        onPatternChange(next)
      } else if (e.ctrlKey && ['1','2','3','4','5','6','7','8'].includes(e.key)) {
        e.preventDefault()
        const nextKit = Number(e.key)
        saveCurrentKit(kitRef.current)
        loadKit(nextKit)
        setKitIndex(nextKit)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPatternChange, saveCurrentKit, loadKit])

  const handleKitChange = useCallback((newKitIndex: number) => {
    saveCurrentKit(kitIndex)
    loadKit(newKitIndex)
    setKitIndex(newKitIndex)
  }, [kitIndex, saveCurrentKit, loadKit])

  const handleKitNameChange = useCallback((kitIdx: number, name: string) => {
    saveKitName(kitIdx, name)
    setKitNames(prev => {
      const next = [...prev]
      next[kitIdx - 1] = name
      return next
    })
  }, [])

  const handleLoadPreset = useCallback(async (presetId: string) => {
    const e = engineRef.current
    if (!e) return

    // Set loading state
    setIsLoadingKit(true)

    try {
      // Check if this is a user kit
      if (presetId.startsWith('user-kit-')) {
        const kitNumber = parseInt(presetId.replace('user-kit-', ''))
        loadKit(kitNumber)
        setCurrentPresetId(presetId)
      } else {
        // Handle preset kits
        const preset = getDrumKitPreset(presetId)
        if (!preset) return

        // Clear all pads from the engine and state
        e.clearAllPads()
        setPadNames({})

        // Get sample URLs for this preset
        const sampleUrls = getDrumKitSampleUrls(presetId)

        // Load samples from URLs
        const loadedPads = await e.loadSamplesFromUrls(sampleUrls)

        // Update pad names in state
        const newPadNames: Record<number, string | undefined> = {}
        loadedPads.forEach((name, padIndex) => {
          newPadNames[padIndex] = name
        })
        setPadNames(newPadNames)

        // Update the current kit name to match the preset
        handleKitNameChange(kitIndex, preset.name)

        // Track the current preset ID
        setCurrentPresetId(presetId)
      }
    } finally {
      // Clear loading state
      setIsLoadingKit(false)
    }
  }, [kitIndex, handleKitNameChange, loadKit])

  return (
    <L.Shell>
      {showSplash && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#000' }}>
          <Shaders />
        </div>
      )}
      <L.Sidebar>
        <KitSelector
          currentKit={kitIndex}
          kitNames={kitNames}
          onKitChange={handleKitChange}
          onKitNameChange={handleKitNameChange}
          onLoadPreset={handleLoadPreset}
          currentPresetId={currentPresetId}
          isLoading={isLoadingKit}
        />
        <PadBrowser padNames={padNames} activePads={activePads} onSelectPad={setSelectedPad} onTriggerPad={onTriggerPad} />
      </L.Sidebar>
      <L.Header>
        <Transport
          isPlaying={isPlaying}
          bpm={bpm}
          metronomeOn={metronomeOn}
          steps={steps}
          swing={swing}
          onTogglePlay={togglePlay}
          onTempoChange={setBpm}
          onToggleMetronome={() => setMetronomeOn(v => !v)}
          onStepsChange={handleStepsChange}
          onSwingChange={setSwing}
          arrangementOn={arrangementOn}
          onToggleArrangement={() => setArrangementOn(v => !v)}
        />
        <MasterWaveform />
      </L.Header>
      <L.Main>
        {view === 'session' && (
          <L.FullRow>
            <SessionView 
              selectedTrackId={selectedTrackId}
              onTrackSelect={setSelectedTrackId}
            />
          </L.FullRow>
        )}

        {view === 'mpc' && (
          <>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '12px' }}>
          <div>
            <PanelHeader
              title="Sample Info"
              icon="♪"
              currentPad={selectedPad}
              assignedPads={Object.keys(padNames).filter(key => padNames[Number(key)]).map(Number)}
              onPadChange={setSelectedPad}
              padNames={padNames}
              collapsed={collapsed['Sample Info']}
              onToggleCollapse={() => togglePanel('Sample Info')}
            />
            {!collapsed['Sample Info'] && (
            <SampleInfo
              padIndex={selectedPad ?? null}
              name={padNames[selectedPad]}
              durationSec={selectedMeta.duration}
              sampleRate={selectedMeta.sampleRate}
              channels={selectedMeta.channels}
              pcmData={selectedMeta.pcm ?? null}
              pitch={selectedMeta.pitch ?? 0}
              gain={selectedMeta.gain ?? 1.0}
              attack={selectedMeta.attack ?? 0.005}
              decay={selectedMeta.decay ?? 0.05}
              sustain={selectedMeta.sustain ?? 0.8}
              release={selectedMeta.release ?? 0.08}
              warp={controls.warp}
              quantize={controls.quantize}
              loop={controls.loop}
              hold={controls.hold}
              onChange={onChangeSampleInfo}
              onControlsChange={onChangeControls}
            />)}
          </div>
          <div>
            <PanelHeader
              title="Parametric EQ"
              icon="≡"
              currentPad={selectedPad}
              assignedPads={Object.keys(padNames).filter(key => padNames[Number(key)]).map(Number)}
              onPadChange={setSelectedPad}
              padNames={padNames}
              collapsed={collapsed['Parametric EQ']}
              onToggleCollapse={() => togglePanel('Parametric EQ')}
            />
            {!collapsed['Parametric EQ'] && (
            <ParametricEQ
              eqBands={selectedMeta.eq ?? createDefaultEQSettings()}
              onChange={onChangeEQBand}
            />)}
          </div>
        </div>
        <L.HalfRow>
          <div>
            <PanelHeader
              title="Pad Grid"
              icon="⊞"
              collapsed={collapsed['Pad Grid']}
              onToggleCollapse={() => togglePanel('Pad Grid')}
            />
            {!collapsed['Pad Grid'] && (
            <PadGrid activePad={activePad} activePads={activePads} padNames={padNames} onDropSample={onDropSample} onTriggerPad={onTriggerPad} />
            )}
          </div>
        </L.HalfRow>
        <L.HalfRow>
          <div>
            <PanelHeader
              title="Effects"
              icon="✨"
              currentPad={selectedPad}
              assignedPads={Object.keys(padNames).filter(key => padNames[Number(key)]).map(Number)}
              onPadChange={setSelectedPad}
              collapsed={collapsed['Effects']}
              onToggleCollapse={() => togglePanel('Effects')}
            />
            {!collapsed['Effects'] && (
            <FX
              effectSlots={selectedMeta.effectsChain ?? createDefaultEffectsChain()}
              onChange={onChangeEffectSlot}
            />)}
          </div>
        </L.HalfRow>
        <div>
          <PanelHeader
            title="Sequencer"
            icon="⬡"
            collapsed={collapsed['Sequencer']}
            onToggleCollapse={() => togglePanel('Sequencer')}
          />
          {!collapsed['Sequencer'] && (
          <Sequencer
            matrix={matrix}
            currentStep={currentStep}
            steps={steps}
            onToggle={onToggleStep}
            patternNumber={patternIndex}
            padNames={padNames}
            onPatternChange={onPatternChange}
            isLoading={isLoadingKit}
          />)}
        </div>
        <L.FullRow>
          <div>
            <PanelHeader
              title="Piano Roll"
              icon="🎹"
              collapsed={collapsed['Piano Roll']}
              onToggleCollapse={() => togglePanel('Piano Roll')}
            />
            {!collapsed['Piano Roll'] && (
            <PianoRoll
              notes={tb303Notes}
              patch={tb303Patch}
              steps={steps}
              currentStep={currentStep}
              onNotesChange={setTb303Notes}
              onPatchChange={(changes) => setTb303Patch((prev: TB303Patch) => ({ ...prev, ...changes }))}
              isPlaying={tb303Playing}
              onTogglePlay={toggleTb303Play}
              bpm={bpm}
            />)}
          </div>
        </L.FullRow>
        <L.FullRow>
          <div>
            <PanelHeader
              title="Sample Editor"
              icon="✂️"
              collapsed={collapsed['Sample Editor']}
              onToggleCollapse={() => togglePanel('Sample Editor')}
            />
            {!collapsed['Sample Editor'] && (
            <SampleEditor onAssignSlice={onAssignSlice} />
            )}
          </div>
        </L.FullRow>
          </>
        )}
        {view === 'timeline' && (
          <L.FullRow>
            <div>
              <PanelHeader
                title="Timeline"
                icon="⏱️"
                collapsed={collapsed['Timeline']}
                onToggleCollapse={() => togglePanel('Timeline')}
              />
              {!collapsed['Timeline'] && (
              <Timeline
                tracks={tracks}
                isPlaying={isPlaying && arrangementOn}
                currentBar={timelineBar}
                onTogglePlay={toggleTimelinePlay}
                onAddClip={(trackIndex, startBar, lengthBars, label) => {
                  setTracks(prev => {
                    const next = prev.map(t => ({ ...t, clips: t.clips.slice() }))
                    next[trackIndex].clips.push({ startBar, lengthBars, label, patternIndex })
                    saveTimeline(next)
                    return next
                  })
                }}
                onUpdateClips={(trackIndex, clips) => {
                  setTracks(prev => {
                    const next: TimelineTrack[] = prev.map(t => ({ ...t, clips: t.clips.map(c => ({ ...c })) }))
                    // Ensure patternIndex is a number (default to 0 meaning none)
                    next[trackIndex].clips = clips.map(c => ({ ...c, patternIndex: c.patternIndex ?? 0 }))
                    saveTimeline(next)
                    return next
                  })
                }}
              />)}
            </div>
          </L.FullRow>
        )}
        {view === 'chat' && (
          <L.FullRow>
            <div>
              <PanelHeader
                title="Chat"
                icon="💬"
                collapsed={collapsed['Chat']}
                onToggleCollapse={() => togglePanel('Chat')}
              />
              {!collapsed['Chat'] && (<Chat />)}
            </div>
          </L.FullRow>
        )}
      </L.Main>
      <L.Footer>© {new Date().getFullYear()} Browser MPC</L.Footer>
      <RightSidebar
        onTB303Open={() => setIsTB303PopupOpen(true)}
        onSequencerOpen={() => setIsSequencerPopupOpen(true)}
      />
      <MixerFooter
        selectedTrackId={selectedTrackId}
        selectedPad={selectedPad}
        sampleMeta={selectedMeta}
        padName={padNames[selectedPad]}
        onUpdateSample={onChangeSampleInfo}
        onLoadSample={onDropSample}
      />
      <TB303Popup
        isOpen={isTB303PopupOpen}
        onClose={() => setIsTB303PopupOpen(false)}
      />
      <SequencerPopup
        isOpen={isSequencerPopupOpen}
        onClose={() => setIsSequencerPopupOpen(false)}
        matrix={matrix}
        currentStep={currentStep}
        steps={steps}
        onToggle={onToggleStep}
        patternNumber={patternIndex}
        padNames={padNames}
        onPatternChange={onPatternChange}
        isLoading={isLoadingKit}
      />
    </L.Shell>
  )
}
