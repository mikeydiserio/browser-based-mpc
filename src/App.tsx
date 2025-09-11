import { useCallback, useEffect, useRef, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { AudioEngine } from './audio/AudioEngine'
import * as L from './components/layout/AppShell.styles'
import PadBrowser from './components/PadBrowser/PadBrowser'
import PadGrid from './components/PadGrid/PadGrid'
import SampleControls from './components/SampleControls/SampleControls'
import SampleEditor from './components/SampleEditor/SampleEditor'
import SampleInfo from './components/SampleInfo/SampleInfo'
import Sequencer from './components/Sequencer/Sequencer'
import Timeline from './components/Timeline/Timeline'
import Transport from './components/Transport/Transport'
import { arrayBufferToBase64, base64ToArrayBuffer, loadBpm, loadMetronomeEnabled, loadPatternByIndex, loadPatterns, loadSamples, loadSamplesForSet, loadSwing, loadTimeline, saveBpm, saveMetronomeEnabled, savePatternByIndex, saveSamples, saveSamplesForSet, saveSwing, saveTimeline, TimelineTrack } from './storage/local'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/theme'

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
  const [matrix, setMatrix] = useState<boolean[][]>(() => Array.from({ length: 16 }, () => Array(16).fill(false)))
  const [steps, setSteps] = useState<number>(16)
  const [patternIndex, setPatternIndex] = useState<number>(1)
  const [arrangementOn, setArrangementOn] = useState<boolean>(false)
  const [totalSteps, setTotalSteps] = useState<number>(0)
  const [loadoutIndex, setLoadoutIndex] = useState<number>(1)
  const [selectedPad, setSelectedPad] = useState<number>(0)
  const [controls, setControls] = useState({ pitch: 0, warp: false, quantize: true, loop: false, hold: false })
  const [view, setView] = useState<'mpc' | 'timeline'>('mpc')
  const [tracks, setTracks] = useState<TimelineTrack[]>(() => loadTimeline().length ? loadTimeline() : [
    { name: 'Drums', clips: [] },
    { name: 'Bass', clips: [] },
    { name: 'Synth', clips: [] },
  ])
  const [selectedMeta, setSelectedMeta] = useState<{ duration?: number; sampleRate?: number; channels?: number; pcm?: Float32Array | null }>({})

  useEffect(() => {
    const e = new AudioEngine()
    e.setBpm(bpm)
    e.setMetronome(metronomeOn)
    e.onStep(({ stepIndex }) => {
      setCurrentStep(stepIndex)
      setTotalSteps((prev) => prev + 1)
    })
    const onBar = (barIdx: number) => {
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

    // Restore persisted state
    const persistedPatterns = loadPatterns()
    if (persistedPatterns[0]) {
      setMatrix(persistedPatterns[0].matrix)
      e.setPattern(persistedPatterns[0].matrix)
    }
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
      e.offStep(({ stepIndex }) => setCurrentStep(stepIndex))
      e.offBar(onBar)
      e.stop()
    }
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

  const onDropSample = useCallback(async (padIndex: number, file: File) => {
    const e = engineRef.current!
    const sample = await e.loadSampleToPad(padIndex, file)
    setPadNames((prev) => ({ ...prev, [padIndex]: file.name }))
    // Persist
    const current = loadSamples()
    const base64 = arrayBufferToBase64(sample.arrayBuffer)
    const updated = [
      ...current.filter((s) => s.id !== sample.id),
      { id: sample.id, name: sample.name, arrayBufferBase64: base64, pitchSemitones: 0, warp: false, quantize: true, loop: false, hold: false }
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
      setSelectedMeta({ duration: sample.audioBuffer.duration, sampleRate: sample.audioBuffer.sampleRate, channels: sample.audioBuffer.numberOfChannels, pcm: ch0 })
      setControls((prev) => ({ ...prev, pitch: sample.pitchSemitones }))
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

  const onPatternChange = useCallback((idx: number) => {
    setPatternIndex(idx)
    setMatrix(prev => {
      const loaded = loadPatternByIndex(idx, prev)
      engineRef.current?.setPattern(loaded)
      return loaded
    })
  }, [])

  // Arrow keys change pattern by ±5
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const delta = e.key === 'ArrowUp' ? 5 : -5
        const next = Math.max(1, Math.min(99, patternIndex + delta))
        onPatternChange(next)
      } else if (e.ctrlKey && ['1','2','3','4','5'].includes(e.key)) {
        e.preventDefault()
        const nextSet = Number(e.key)
        saveCurrentLoadout(loadoutIndex)
        loadLoadout(nextSet)
        setLoadoutIndex(nextSet)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [patternIndex, onPatternChange, loadoutIndex])

  const onChangeControls = useCallback((changes: Partial<typeof controls>) => {
    setControls((prev) => ({ ...prev, ...changes }))
    // TODO: wire into AudioEngine per-pad settings if needed
  }, [])

  const onChangeSampleInfo = useCallback((changes: Partial<{ pitch: number; attack: number; decay: number; sustain: number; release: number }>) => {
    const e = engineRef.current
    if (!e) return
    if (changes.pitch !== undefined) {
      e.setPadPitch(selectedPad, changes.pitch)
      setControls((prev) => ({ ...prev, pitch: changes.pitch! }))
    }
    if (changes.attack !== undefined || changes.decay !== undefined || changes.sustain !== undefined || changes.release !== undefined) {
      e.setPadAdsr(selectedPad, { attack: changes.attack, decay: changes.decay, sustain: changes.sustain, release: changes.release })
    }
  }, [selectedPad])

  const saveCurrentLoadout = useCallback((setId: number) => {
    const e = engineRef.current
    if (!e) return
    const samples: any[] = []
    for (let i = 0; i < 16; i++) {
      const s = e.getSampleForPad(i) as any
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
    saveSamplesForSet(setId, samples as any)
  }, [])

  const loadLoadout = useCallback((setId: number) => {
    const e = engineRef.current
    if (!e) return
    const list = loadSamplesForSet(setId)
    ;(async () => {
      for (const s of list) {
        const padIndex = Number(s.id.replace('pad-', ''))
        const ab = base64ToArrayBuffer(s.arrayBufferBase64)
        await e.loadArrayBufferToPad(padIndex, ab, s.name)
        e.setPadPitch(padIndex, s.pitchSemitones ?? 0)
        e.setPadAdsr(padIndex, { attack: (s as any).attack, decay: (s as any).decay, sustain: (s as any).sustain, release: (s as any).release })
        setPadNames((prev) => ({ ...prev, [padIndex]: s.name }))
      }
    })()
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
                </div>
              </L.Main>
            </L.Header>
          </div>
          <PadBrowser padNames={padNames} activePads={activePads} onSelectPad={setSelectedPad} onTriggerPad={onTriggerPad} />
        </L.Sidebar>
        <L.Header>
          <Transport isPlaying={isPlaying} bpm={bpm} metronomeOn={metronomeOn} steps={steps} swing={swing} onTogglePlay={togglePlay} onTempoChange={setBpm} onToggleMetronome={() => setMetronomeOn(v => !v)} onStepsChange={(n) => { setSteps(n); engineRef.current?.setSteps(n); setMatrix(prev => prev.map(r => { const next = r.slice(0, n); while (next.length < n) next.push(false); return next })) }} onSwingChange={setSwing} arrangementOn={arrangementOn} onToggleArrangement={() => setArrangementOn(v => !v)} />
        </L.Header>
        <L.Main>
          {view === 'mpc' && (
            <>
          <L.FullRow>
            <SampleInfo
              padIndex={selectedPad ?? null}
              name={padNames[selectedPad]}
              durationSec={selectedMeta.duration}
              sampleRate={selectedMeta.sampleRate}
              channels={selectedMeta.channels}
              pcmData={selectedMeta.pcm ?? null}
              pitch={controls.pitch}
              onChange={onChangeSampleInfo}
            />
          </L.FullRow>
          <PadGrid activePad={activePad} activePads={activePads} padNames={padNames} onDropSample={onDropSample} onTriggerPad={onTriggerPad} onSelectPad={setSelectedPad} />
          <Sequencer
            matrix={matrix}
            currentStep={currentStep}
            steps={steps}
            onToggle={onToggleStep}
            patternNumber={patternIndex}
            stepsControl={(
              <select value={steps} onChange={(e) => { const n = Number(e.target.value); setSteps(n); engineRef.current?.setSteps(n); setMatrix(prev => prev.map(r => { const next = r.slice(0, n); while (next.length < n) next.push(false); return next })) }}>
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
                <option value={64}>64</option>
              </select>
            )}
            onPatternChange={onPatternChange}
          />
          <L.FullRow>
            <SampleControls {...controls} onChange={onChangeControls} />
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
                    const next = prev.map(t => ({ ...t, clips: t.clips.slice() }))
                    next[trackIndex].clips = clips
                    saveTimeline(next)
                    return next
                  })
                }}
              />
            </L.FullRow>
          )}
        </L.Main>
        <L.Footer>© {new Date().getFullYear()} Browser MPC</L.Footer>
      </L.Shell>
    </ThemeProvider>
  )
}

export default App
