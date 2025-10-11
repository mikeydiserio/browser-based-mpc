import { TrackManager } from "./track-manager"
import { PatternManager } from "./pattern-manager"
import { ArrangementManager } from "./arrangement-manager"
import { Transport } from "./transport"
import type { Track } from "./audio-engine"
import type { Pattern } from "./pattern-manager"
import type { ArrangementClip } from "./arrangement-manager"
import type { Effect } from "./effects"
import type { SynthSettings } from "./synthesizer"

export interface ProjectData {
  version: string
  name: string
  tempo: number
  timeSignature: [number, number]
  tracks: SerializedTrack[]
  patterns: Pattern[]
  arrangementClips: ArrangementClip[]
  createdAt: string
  modifiedAt: string
}

interface SerializedTrack extends Track {
  effects: Effect[]
  synthSettings?: SynthSettings
}

export class ProjectManager {
  private static instance: ProjectManager
  private trackManager: TrackManager
  private patternManager: PatternManager
  private arrangementManager: ArrangementManager
  private transport: Transport
  private projectName = "Untitled Project"

  private constructor() {
    this.trackManager = TrackManager.getInstance()
    this.patternManager = PatternManager.getInstance()
    this.arrangementManager = ArrangementManager.getInstance()
    this.transport = Transport.getInstance()
  }

  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager()
    }
    return ProjectManager.instance
  }

  setProjectName(name: string) {
    this.projectName = name
  }

  getProjectName(): string {
    return this.projectName
  }

  saveProject(): ProjectData {
    const tracks = this.trackManager.getTracks()
    const serializedTracks: SerializedTrack[] = tracks.map((track) => {
      const effectsChain = this.trackManager.getTrackEffects(track.id)
      const synth = this.trackManager.getTrackSynth(track.id)

      return {
        ...track,
        effects: effectsChain?.getEffects() || [],
        synthSettings: synth?.getSettings(),
      }
    })

    const projectData: ProjectData = {
      version: "1.0.0",
      name: this.projectName,
      tempo: this.transport.getState().tempo,
      timeSignature: this.transport.getState().timeSignature,
      tracks: serializedTracks,
      patterns: this.patternManager.getPatterns(),
      arrangementClips: this.arrangementManager.getArrangementClips(),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    }

    return projectData
  }

  exportProjectAsJSON(): string {
    const projectData = this.saveProject()
    return JSON.stringify(projectData, null, 2)
  }

  downloadProject() {
    const json = this.exportProjectAsJSON()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${this.projectName.replace(/\s+/g, "_")}.dawsome.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async loadProject(projectData: ProjectData) {
    try {
      // Set project name and tempo
      this.projectName = projectData.name
      this.transport.setTempo(projectData.tempo)

      // Load tracks
      projectData.tracks.forEach((trackData) => {
        const track = this.trackManager.getTrack(trackData.id)
        if (track) {
          this.trackManager.updateTrack(trackData.id, {
            name: trackData.name,
            volume: trackData.volume,
            pan: trackData.pan,
            mute: trackData.mute,
            solo: trackData.solo,
            arm: trackData.arm,
          })

          // Load effects
          const effectsChain = this.trackManager.getTrackEffects(trackData.id)
          if (effectsChain && trackData.effects) {
            trackData.effects.forEach((effect) => {
              const newEffect = effectsChain.addEffect(effect.type)
              effectsChain.updateEffect(newEffect.id, {
                enabled: effect.enabled,
                params: effect.params,
              })
            })
          }

          // Load synth settings
          if (trackData.synthSettings) {
            const synth = this.trackManager.getTrackSynth(trackData.id)
            if (synth) {
              synth.updateSettings(trackData.synthSettings)
            }
          }
        }
      })

      // Load patterns (clips)
      // Note: This is simplified - in a real implementation you'd need to handle
      // audio buffer restoration for audio clips
      projectData.patterns.forEach((pattern) => {
        const existingPattern = this.patternManager.getPattern(pattern.id)
        if (existingPattern) {
          pattern.clips.forEach((clip) => {
            this.patternManager.createClip(clip.trackId, pattern.id, clip.name)
          })
        }
      })

      // Load arrangement clips
      projectData.arrangementClips.forEach((clip) => {
        this.arrangementManager.addClipToArrangement(clip.trackId, clip.position, clip.duration)
      })

      console.log("Project loaded successfully:", projectData.name)
    } catch (error) {
      console.error("Error loading project:", error)
      throw error
    }
  }

  async loadProjectFromFile(file: File) {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const json = e.target?.result as string
          const projectData = JSON.parse(json) as ProjectData
          await this.loadProject(projectData)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  createNewProject(name = "Untitled Project") {
    this.projectName = name
    // Reset would require more complex state management
    // For now, just set the name
    console.log("New project created:", name)
  }
}
