"use client"

import { useEffect, useState } from "react"
import { ClipPlayer } from "@/lib/clip-player"
import { TrackManager } from "@/lib/track-manager"
import type { Clip } from "@/lib/audio-engine"

export function useClipPlayer() {
  const [clipPlayer] = useState(() => ClipPlayer.getInstance())
  const [trackManager] = useState(() => TrackManager.getInstance())
  const [playingClips, setPlayingClips] = useState<Set<string>>(new Set())

  useEffect(() => {
    const interval = setInterval(() => {
      // Update playing clips state
      const tracks = trackManager.getTracks()
      const playing = new Set<string>()

      tracks.forEach((track) => {
        track.clips.forEach((clip) => {
          if (clipPlayer.isPlaying(clip.id)) {
            playing.add(clip.id)
          }
        })
      })

      setPlayingClips(playing)
    }, 100)

    return () => clearInterval(interval)
  }, [clipPlayer, trackManager])

  const playClip = async (clip: Clip) => {
    const trackGain = trackManager.getTrackGain(clip.trackId)
    if (trackGain) {
      await clipPlayer.playClip(clip, trackGain)
    }
  }

  const stopClip = (clipId: string) => {
    clipPlayer.stopClip(clipId)
  }

  const isPlaying = (clipId: string) => {
    return playingClips.has(clipId)
  }

  return {
    playClip,
    stopClip,
    isPlaying,
  }
}
