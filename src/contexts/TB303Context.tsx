import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { EffectsChain } from '../audio/effects'
import { createDefaultEffectsChain } from '../audio/effects'
import type { TB303Note, TB303Patch } from '../audio/TB303Synth'
import { defaultTB303Patch, TB303Synth } from '../audio/TB303Synth'

interface TB303ContextValue {
  // State
  tb303Volume: number
  tb303Muted: boolean
  tb303MeterLevel: number
  tb303Patch: TB303Patch
  tb303Notes: TB303Note[]
  tb303Playing: boolean
  tb303Fx: EffectsChain
  
  // Refs (exposed for external access)
  tb303SynthRef: React.RefObject<TB303Synth | null>
  tb303AnalyserRef: React.RefObject<AnalyserNode | null>
  
  // Setters
  setTb303Volume: (volume: number) => void
  setTb303Muted: (muted: boolean) => void
  setTb303Patch: (patch: TB303Patch | ((prev: TB303Patch) => TB303Patch)) => void
  setTb303Notes: (notes: TB303Note[] | ((prev: TB303Note[]) => TB303Note[])) => void
  setTb303Fx: (fx: EffectsChain | ((prev: EffectsChain) => EffectsChain)) => void
  toggleTb303Play: () => void
  
  // Internal refs for scheduling (exposed for engine callbacks)
  tb303PlayingRef: React.RefObject<boolean>
  tb303MutedRef: React.RefObject<boolean>
  tb303NotesRef: React.RefObject<TB303Note[]>
  tb303PatchRef: React.RefObject<TB303Patch>
  
  // Initialization method (call this after audio engine is ready)
  initialize: (audioContext: AudioContext, masterGain: GainNode, engineRef?: { getTb303BusGain?: () => GainNode; attachTb303Analyser?: (analyser: AnalyserNode) => void; setTb303BusVolume?: (volume: number) => void; setTb303BusMute?: (muted: boolean) => void; }) => void
}

const TB303Context = createContext<TB303ContextValue | null>(null)

interface TB303ProviderProps {
  children: ReactNode
}

export function TB303Provider({ children }: TB303ProviderProps) {
  // State
  const [tb303Volume, setTb303Volume] = useState<number>(0.7)
  const [tb303Muted, setTb303Muted] = useState<boolean>(false)
  const [tb303MeterLevel, setTb303MeterLevel] = useState<number>(0)
  const [tb303Patch, setTb303Patch] = useState<TB303Patch>(defaultTB303Patch)
  const [tb303Notes, setTb303Notes] = useState<TB303Note[]>([])
  const [tb303Playing, setTb303Playing] = useState<boolean>(false)
  const [tb303Fx, setTb303Fx] = useState<EffectsChain>(createDefaultEffectsChain())
  
  // Refs for scheduling and audio nodes
  const tb303SynthRef = useRef<TB303Synth | null>(null)
  const tb303PlayingRef = useRef<boolean>(false)
  const tb303MutedRef = useRef<boolean>(false)
  const tb303NotesRef = useRef<TB303Note[]>([])
  const tb303PatchRef = useRef<TB303Patch>(defaultTB303Patch)
  const tb303AnalyserRef = useRef<AnalyserNode | null>(null)
  const meterIntervalRef = useRef<number | null>(null)
  const engineRefStored = useRef<{ getTb303BusGain?: () => GainNode; attachTb303Analyser?: (analyser: AnalyserNode) => void; setTb303BusVolume?: (volume: number) => void; setTb303BusMute?: (muted: boolean) => void; } | null>(null)
  
  // Initialize TB-303 synth (called from AppContent after audio engine is ready)
  const initialize = useCallback((audioContext: AudioContext, masterGain: GainNode, engineRef?: { getTb303BusGain?: () => GainNode; attachTb303Analyser?: (analyser: AnalyserNode) => void; setTb303BusVolume?: (volume: number) => void; setTb303BusMute?: (muted: boolean) => void; }) => {
    // Prevent double initialization
    if (tb303SynthRef.current) return
    
    engineRefStored.current = engineRef || null
    
    // Initialize TB-303 synth - connect to AudioEngine's TB-303 bus gain
    // Use the TB-303 bus gain if available, otherwise fall back to master gain
    const tb303BusGain = engineRef?.getTb303BusGain?.() || masterGain
    const tb303 = new TB303Synth(audioContext, defaultTB303Patch, tb303BusGain)
    tb303SynthRef.current = tb303
    tb303.setEffectsChain(tb303Fx)
    
    // Setup audio analyser for metering
    const tb303Analyser = audioContext.createAnalyser()
    tb303Analyser.fftSize = 256
    tb303AnalyserRef.current = tb303Analyser
    
    // Connect analyser to engine if available
    if (engineRef?.attachTb303Analyser) {
      engineRef.attachTb303Analyser(tb303Analyser)
    }
    
    // Start metering loop
    const meterInterval = window.setInterval(() => {
      if (tb303AnalyserRef.current) {
        const dataArray = new Uint8Array(tb303AnalyserRef.current.frequencyBinCount)
        tb303AnalyserRef.current.getByteTimeDomainData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128
          sum += normalized * normalized
        }
        const rms = Math.sqrt(sum / dataArray.length)
        const level = Math.min(1, rms * 4)
        setTb303MeterLevel(level)
      }
    }, 50)
    meterIntervalRef.current = meterInterval
  }, [tb303Fx])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (meterIntervalRef.current) {
        clearInterval(meterIntervalRef.current)
      }
      if (tb303SynthRef.current) {
        tb303SynthRef.current.disconnect()
      }
    }
  }, [])
  
  // Keep refs in sync for sample-accurate scheduling in step callback
  useEffect(() => { tb303PlayingRef.current = tb303Playing }, [tb303Playing])
  useEffect(() => { tb303MutedRef.current = tb303Muted }, [tb303Muted])
  useEffect(() => { tb303NotesRef.current = tb303Notes }, [tb303Notes])
  useEffect(() => { tb303PatchRef.current = tb303Patch }, [tb303Patch])
  
  // Update synth when effects chain changes
  useEffect(() => {
    if (tb303SynthRef.current) {
      tb303SynthRef.current.setEffectsChain(tb303Fx)
    }
  }, [tb303Fx])
  
  // Apply TB-303 bus volume changes
  useEffect(() => {
    if (engineRefStored.current?.setTb303BusVolume) {
      engineRefStored.current.setTb303BusVolume(tb303Volume)
    }
  }, [tb303Volume])
  
  // Apply TB-303 bus mute changes
  useEffect(() => {
    if (engineRefStored.current?.setTb303BusMute) {
      engineRefStored.current.setTb303BusMute(tb303Muted)
    }
  }, [tb303Muted])
  
  // Update TB-303 synth when patch changes
  useEffect(() => {
    if (tb303SynthRef.current) {
      tb303SynthRef.current.setPatch(tb303Patch)
    }
  }, [tb303Patch])
  
  const toggleTb303Play = () => {
    setTb303Playing(prev => !prev)
  }
  
  const value: TB303ContextValue = {
    tb303Volume,
    tb303Muted,
    tb303MeterLevel,
    tb303Patch,
    tb303Notes,
    tb303Playing,
    tb303Fx,
    tb303SynthRef,
    tb303AnalyserRef,
    setTb303Volume,
    setTb303Muted,
    setTb303Patch,
    setTb303Notes,
    setTb303Fx,
    toggleTb303Play,
    tb303PlayingRef,
    tb303MutedRef,
    tb303NotesRef,
    tb303PatchRef,
    initialize,
  }
  
  return (
    <TB303Context.Provider value={value}>
      {children}
    </TB303Context.Provider>
  )
}

export const useTB303 = () => {
  const context = useContext(TB303Context)
  if (!context) throw new Error('useTB303 must be used within TB303Provider')
  return context
}
