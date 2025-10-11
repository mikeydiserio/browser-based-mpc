import { useTracks } from '@/hooks/use-tracks'
import { MPCSampleControls } from '../MPCSampleControls/MPCSampleControls'
import { getSendTrackInfo } from '../session-view-constants'
import { TrackFXPanel } from '../TrackFXPanel/TrackFXPanel'
import * as S from './MixerFooter.styles'

interface SampleMeta {
  duration?: number
  sampleRate?: number
  channels?: number
  pcm?: Float32Array | null
  pitch?: number
  gain?: number
  attack?: number
  decay?: number
  sustain?: number
  release?: number
}

interface MixerFooterProps {
  selectedTrackId: string | null
  selectedPad?: number
  sampleMeta?: SampleMeta
  padName?: string
  onUpdateSample?: (changes: Partial<SampleMeta>) => void
  onLoadSample?: (padIndex: number, file: File) => void
}

export function MixerFooter({ 
  selectedTrackId, 
  selectedPad = 0,
  sampleMeta,
  padName,
  onUpdateSample,
  onLoadSample
}: MixerFooterProps) {
  const { tracks } = useTracks()

  const getSelectedTrackInfo = () => {
    if (!selectedTrackId) return null

    // Check if it's a send track
    if (selectedTrackId.startsWith('send-')) {
      return getSendTrackInfo(selectedTrackId)
    }

    // Otherwise, it's a regular track
    const track = tracks.find(t => t.id === selectedTrackId)
    return track ? {
      name: track.name,
      color: track.color,
      type: track.type
    } : null
  }

  const selectedTrackInfo = getSelectedTrackInfo()

  if (!selectedTrackInfo) {
    return (
      <S.FooterContainer>
        <S.PanelWrapper>
          <S.EmptyState>
            Click on a track header to view its effects and controls
          </S.EmptyState>
        </S.PanelWrapper>
      </S.FooterContainer>
    )
  }

  const renderTrackContent = () => {
    // MPC Instrument (MIDI 1 / midi-0)
    if (selectedTrackId === 'midi-0') {
      // Convert sampleMeta to sample format expected by MPCSampleControls
      const sample = sampleMeta?.duration ? {
        buffer: {
          duration: sampleMeta.duration,
          sampleRate: sampleMeta.sampleRate || 44100,
          numberOfChannels: sampleMeta.channels || 1,
        } as AudioBuffer,
        name: padName || 'No sample loaded',
        pitch: sampleMeta.pitch,
        gain: sampleMeta.gain,
        attack: sampleMeta.attack,
        decay: sampleMeta.decay,
        sustain: sampleMeta.sustain,
        release: sampleMeta.release,
      } : null

      return (
        <MPCSampleControls
          selectedPad={selectedPad}
          sample={sample}
          onUpdateSample={onUpdateSample}
          onLoadSample={onLoadSample}
        />
      )
    }

    // TB-303 (MIDI 2 / midi-1) - Special handling for TB-303
    if (selectedTrackId === 'midi-1') {
      return (
        <S.PanelWrapper>
          <div style={{ padding: '12px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>
              🎛️ TB-303 Bass Synthesizer
            </div>
            <small style={{ color: '#666', fontSize: '11px' }}>
              Click the TB-303 icon in the right sidebar to open controls
            </small>
          </div>
        </S.PanelWrapper>
      )
    }

    // All other tracks: MIDI 3-4, Audio 1-4, Send 1-2 get FX panel
    if (selectedTrackInfo) {
      return (
        <TrackFXPanel
          trackId={selectedTrackId!}
          trackName={selectedTrackInfo.name}
          trackColor={selectedTrackInfo.color}
          // TODO: Get actual effect slots from track
          onUpdateEffect={(slotIndex, effect) => {
            console.log('Update effect:', selectedTrackId, slotIndex, effect)
          }}
        />
      )
    }

    return null
  }

  return (
    <S.FooterContainer>
      <S.PanelWrapper>
        {renderTrackContent()}
      </S.PanelWrapper>
    </S.FooterContainer>
  )
}
