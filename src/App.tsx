import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { AudioEngine } from './audio/AudioEngine'
import type { EffectsChain, EffectSlot } from './audio/effects'
import { createDefaultEffectsChain } from './audio/effects'
import type { EQBand, EQSettings } from './audio/eq'
import { createDefaultEQSettings } from './audio/eq'
import type { TB303Note, TB303Patch } from './audio/TB303Synth'
import { defaultTB303Patch, TB303Synth } from './audio/TB303Synth'
import Chat from './components/Chat/Chat'
import FX from './components/FX/FX'
import type { InstrumentType } from './components/InstrumentSelector/InstrumentSelector'
import InstrumentSelector from './components/InstrumentSelector/InstrumentSelector'
import KitSelector from './components/KitSelector/KitSelector'
import * as L from './components/layout/AppShell.styles'
import MasterVolume from './components/MasterVolume/MasterVolume'
import MixerChannel from './components/Mixer/MixerChannel'
import PadBrowser from './components/PadBrowser/PadBrowser'
import PadGrid from './components/PadGrid/PadGrid'
import ParametricEQ from './components/ParametricEQ/ParametricEQ'
import PianoRoll from './components/PianoRoll/PianoRoll'
import SampleEditor from './components/SampleEditor/SampleEditor'
import SampleInfo from './components/SampleInfo/SampleInfo'
import Sequencer from './components/Sequencer/Sequencer'
import TB303Controls from './components/TB303Controls/TB303Controls'
import Timeline from './components/Timeline/Timeline'
import Transport from './components/Transport/Transport'
import type { PersistedSample, TimelineTrack } from './storage/local'
import { arrayBufferToBase64, base64ToArrayBuffer, loadAllKitNames, loadBpm, loadMetronomeEnabled, loadPatternByIndex, loadSamples, loadSamplesForSet, loadSwing, loadTimeline, saveBpm, saveKitName, saveMetronomeEnabled, savePatternByIndex, saveSamples, saveSamplesForSet, saveSwing, saveSynthsForSet, saveTimeline } from './storage/local'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'
import { getDrumKitPreset, getDrumKitSampleUrls } from './utils/drumKits'

function App() {
  const engineRef = useRef<AudioEngine | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState<number>(() => loadBpm(120))
  const [swing, setSwing] = useState<number>(() => loadSwing(0))
  const [metronomeOn, setMetronomeOn] = useState<boolean>(() => loadMetronomeEnabled(true))
  const [currentStep, setCurrentStep] = useState(0)
  const [activePad, setActivePad] = useState<number | undefined>(undefined)
  const [activePads, setActivePads] = useState<number[]>([])
  const [padNames, setPadNames] = useState<Record<number, string | undefined>>({})
  const [padInstruments, setPadInstruments] = useState<Record<number, InstrumentType>>({})
  const [matrix, setMatrix] = useState<boolean[][]>(() => Array.from({ length: 16 }, () => Array(16).fill(false)))
  const [steps, setSteps] = useState<number>(16)
  const [patternIndex, setPatternIndex] = useState<number>(1)
  const [arrangementOn, setArrangementOn] = useState<boolean>(false)
  const [timelineBar, setTimelineBar] = useState<number>(0)
  // const [totalSteps, setTotalSteps] = useState<number>(0)
  const [kitIndex, setKitIndex] = useState<number>(1)
  const [kitNames, setKitNames] = useState<string[]>(() => loadAllKitNames())
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>(undefined)
  const [isLoadingKit, setIsLoadingKit] = useState<boolean>(false)
  const [selectedPad, setSelectedPad] = useState<number>(0)
  const [controls, setControls] = useState({ warp: false, quantize: true, loop: false, hold: false })
  const [view, setView] = useState<'mpc' | 'timeline' | 'chat'>('mpc')
  const [showEQCurve, setShowEQCurve] = useState<boolean>(false)
  const [tracks, setTracks] = useState<TimelineTrack[]>(() => loadTimeline().length ? loadTimeline() : [
    { name: 'Drums', clips: [] },
    { name: 'Bass', clips: [] },
    { name: 'Synth', clips: [] },
  ])
  const [masterVolume, setMasterVolume] = useState<number>(0.8)
  const [drumsBusVolume, setDrumsBusVolume] = useState<number>(0.8)
  const [drumsMuted, setDrumsMuted] = useState<boolean>(false)
  const [drumsMeterLevel, setDrumsMeterLevel] = useState<number>(0)
  const [tb303Volume, setTb303Volume] = useState<number>(0.7)
  const [tb303Muted, setTb303Muted] = useState<boolean>(false)
  const [tb303MeterLevel, setTb303MeterLevel] = useState<number>(0)
  const [tb303Patch, setTb303Patch] = useState<TB303Patch>(defaultTB303Patch)
  const [tb303Notes, setTb303Notes] = useState<TB303Note[]>([])
  const [tb303Playing, setTb303Playing] = useState<boolean>(false)
  const tb303SynthRef = useRef<TB303Synth | null>(null)
  const drumAnalyserRef = useRef<AnalyserNode | null>(null)
  const tb303AnalyserRef = useRef<AnalyserNode | null>(null)
  const meterIntervalRef = useRef<number | null>(null)
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

  // Setup audio engine on mount
  useEffect(() => {
    ;(async () => {
      const e = new AudioEngine()
    e.setBpm(bpm)
    e.setMetronome(metronomeOn)
    const stepCb = ({ stepIndex }: { stepIndex: number }) => {
      setCurrentStep(stepIndex)
      // setTotalSteps((prev) => prev + 1)
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

      // Initialize TB-303 synth - connect to AudioEngine's master gain
      const tb303 = new TB303Synth(e['audioContext'], defaultTB303Patch, e['masterGain'])
      tb303SynthRef.current = tb303

      // Setup audio analysers for metering
      const audioContext = e['audioContext']
      const drumAnalyser = audioContext.createAnalyser()
      drumAnalyser.fftSize = 256
      drumAnalyserRef.current = drumAnalyser

      const tb303Analyser = audioContext.createAnalyser()
      tb303Analyser.fftSize = 256
      tb303AnalyserRef.current = tb303Analyser

      // Start metering loop
      const meterInterval = window.setInterval(() => {
        // Drums meter
        if (drumAnalyserRef.current) {
          const dataArray = new Uint8Array(drumAnalyserRef.current.frequencyBinCount)
          drumAnalyserRef.current.getByteTimeDomainData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / dataArray.length)
          setDrumsMeterLevel(Math.min(1, rms * 4))
        }

        // TB-303 meter
        if (tb303AnalyserRef.current) {
          const dataArray = new Uint8Array(tb303AnalyserRef.current.frequencyBinCount)
          tb303AnalyserRef.current.getByteTimeDomainData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128
            sum += normalized * normalized
          }
          const rms = Math.sqrt(sum / dataArray.length)
          setTb303MeterLevel(Math.min(1, rms * 4))
        }
      }, 50)
      meterIntervalRef.current = meterInterval

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
        if (meterIntervalRef.current) {
          clearInterval(meterIntervalRef.current)
        }
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
    engineRef.current?.setSwing(swing)
    saveSwing(swing)
  }, [swing])

  // Update TB-303 synth when patch changes
  useEffect(() => {
    if (tb303SynthRef.current) {
      tb303SynthRef.current.setPatch(tb303Patch)
    }
  }, [tb303Patch])

  // TB-303 playback - schedule notes based on current step
  useEffect(() => {
    if (!tb303Playing || !isPlaying || !tb303SynthRef.current || tb303Muted) return

    const notesAtStep = tb303Notes.filter(n => n.startStep === currentStep)
    if (notesAtStep.length === 0) return

    const now = engineRef.current?.['audioContext'].currentTime ?? 0
    const secondsPerBeat = 60.0 / bpm
    const stepDuration = secondsPerBeat / 4 // 16th note

    for (const note of notesAtStep) {
      const baseDuration = note.duration * stepDuration
      const noteDuration = baseDuration * tb303Patch.noteLength
      
      // Check if previous note has slide flag
      let slideFrom: number | undefined
      if (note.slide && currentStep > 0) {
        const prevNotes = tb303Notes.filter(n => n.startStep < currentStep)
        if (prevNotes.length > 0) {
          const lastNote = prevNotes.reduce((a, b) => a.startStep > b.startStep ? a : b)
          slideFrom = lastNote.note
        }
      }

      tb303SynthRef.current.triggerNote(note.note, now, noteDuration, note.accent, slideFrom)
    }
  }, [currentStep, tb303Playing, isPlaying, tb303Notes, tb303Muted, bpm, tb303Patch.noteLength])

  const toggleTb303Play = useCallback(() => {
    setTb303Playing(prev => !prev)
  }, [])

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

  // onPatternChange moved above to avoid usage-before-definition

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
      if (s?.arrayBuffer) {
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
    setPadInstruments({})
    
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

  const onSelectInstrument = useCallback((type: InstrumentType) => {
    const e = engineRef.current
    if (!e || selectedPad === undefined) return

    // For now, only 'sample' type is supported for pads
    if (type === 'sample') {
      // Ensure pad is in sample mode
      setPadInstruments((prev) => {
        const next = { ...prev }
        delete next[selectedPad]
        return next
      })
    }
  }, [selectedPad])


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
    
    const preset = getDrumKitPreset(presetId)
    if (!preset) return
    
    // Set loading state
    setIsLoadingKit(true)
    
    try {
    // Clear all pads from the engine and state
    e.clearAllPads()
    setPadNames({})
    setPadInstruments({})
    
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
    } finally {
      // Clear loading state
      setIsLoadingKit(false)
    }
  }, [kitIndex, handleKitNameChange])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <L.Shell>
        <L.Sidebar>
          <div>
            <L.Header as="div" style={{ background: 'transparent', borderBottom: 'none', padding: 0 }}>
              <L.Main as="div" style={{ padding: 0, gap: 8 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <button onClick={() => setView('mpc')}>MPC</button>
                  <button onClick={() => setView('timeline')}>Timeline</button>
                  <button onClick={() => setView('chat')}>Chat</button>
                </div>
              </L.Main>
            </L.Header>
          </div>
          <KitSelector
            currentKit={kitIndex}
            kitNames={kitNames}
            onKitChange={handleKitChange}
            onKitNameChange={handleKitNameChange}
            onLoadPreset={handleLoadPreset}
            currentPresetId={currentPresetId}
          />
          <InstrumentSelector
            selectedPad={selectedPad}
            currentInstrument={padInstruments[selectedPad]}
            onSelectInstrument={onSelectInstrument}
          />
          <PadBrowser padNames={padNames} activePads={activePads} onSelectPad={setSelectedPad} onTriggerPad={onTriggerPad} />
        </L.Sidebar>
        <L.Header>
          <Transport isPlaying={isPlaying} bpm={bpm} metronomeOn={metronomeOn} steps={steps} swing={swing} onTogglePlay={togglePlay} onTempoChange={setBpm} onToggleMetronome={() => setMetronomeOn(v => !v)} onStepsChange={handleStepsChange} onSwingChange={setSwing} arrangementOn={arrangementOn} onToggleArrangement={() => setArrangementOn(v => !v)} />
        </L.Header>
        <L.Main>
          {view === 'mpc' && (
            <>
          <L.HalfRow>
            <div style={{ display: 'grid', gap: '12px' }}>
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
                eq={showEQCurve ? selectedMeta.eq : undefined}
                warp={controls.warp}
                quantize={controls.quantize}
                loop={controls.loop}
                hold={controls.hold}
                onChange={onChangeSampleInfo}
                onControlsChange={onChangeControls}
              />
              <ParametricEQ
                eqBands={selectedMeta.eq ?? createDefaultEQSettings()}
                onChange={onChangeEQBand}
                showCurve={showEQCurve}
                onShowCurveChange={setShowEQCurve}
              />
            </div>
          </L.HalfRow>
          <L.HalfRow>
            <FX
              effectSlots={selectedMeta.effectsChain ?? createDefaultEffectsChain()}
              onChange={onChangeEffectSlot}
            />
          </L.HalfRow>
          <PadGrid activePad={activePad} activePads={activePads} padNames={padNames} onDropSample={onDropSample} onTriggerPad={onTriggerPad} isLoading={isLoadingKit} />
          <Sequencer
            matrix={matrix}
            currentStep={currentStep}
            steps={steps}
            onToggle={onToggleStep}
            patternNumber={patternIndex}
            padNames={padNames}
            onPatternChange={onPatternChange}
          />
          <L.FullRow>
            <div style={{ display: 'grid', gap: '12px' }}>
              <TB303Controls
                padIndex={null}
                name="TB-303 Synth"
                patch={tb303Patch}
                onChange={(changes) => setTb303Patch(prev => ({ ...prev, ...changes }))}
              />
              <PianoRoll
                notes={tb303Notes}
                patch={tb303Patch}
                steps={steps}
                currentStep={currentStep}
                onNotesChange={setTb303Notes}
                onPatchChange={(changes) => setTb303Patch(prev => ({ ...prev, ...changes }))}
                isPlaying={tb303Playing}
                onTogglePlay={toggleTb303Play}
                bpm={bpm}
              />
            </div>
          </L.FullRow>
          <L.FullRow>
            <SampleEditor onAssignSlice={onAssignSlice} />
          </L.FullRow>
            </>
          )}
          {view === 'timeline' && (
            <L.FullRow>
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
              />
            </L.FullRow>
          )}
          {view === 'chat' && (
            <L.FullRow>
              <Chat />
            </L.FullRow>
          )}
        </L.Main>
        <L.RightSidebar>
          <MixerChannel
            label="Drums"
            value={drumsBusVolume}
            onChange={setDrumsBusVolume}
            color="default"
            muted={drumsMuted}
            onMuteToggle={() => setDrumsMuted(v => !v)}
            meterLevel={drumsMeterLevel}
          />
          <MixerChannel
            label="TB-303"
            value={tb303Volume}
            onChange={setTb303Volume}
            color="alt"
            muted={tb303Muted}
            onMuteToggle={() => setTb303Muted(v => !v)}
            meterLevel={tb303MeterLevel}
          />
          <MasterVolume 
            value={masterVolume} 
            onChange={(v) => {
              setMasterVolume(v)
              engineRef.current?.setMasterVolume(v)
            }} 
          />
        </L.RightSidebar>
        <L.Footer>© {new Date().getFullYear()} Browser MPC</L.Footer>
      </L.Shell>
    </ThemeProvider>
  )
}

export default App
