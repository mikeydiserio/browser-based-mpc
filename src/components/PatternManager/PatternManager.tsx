import { useCallback, useState } from 'react'
import * as S from './PatternManager.styles'

type Pattern = {
  index: number
  name: string
  steps: number
  hasData: boolean
}

type Props = {
  currentPattern: number
  onPatternSelect: (patternIndex: number) => void
  onAddToTimeline: (trackIndex: number, patternIndex: number, startBar: number, lengthBars: number) => void
  tracks: Array<{ name: string; clips: Array<{ startBar: number; lengthBars: number; patternIndex?: number }> }>
  totalBars?: number
}

export function PatternManager({
  currentPattern,
  onPatternSelect,
  onAddToTimeline,
  tracks,
  totalBars = 64
}: Props) {
  const [selectedTrack, setSelectedTrack] = useState<number>(0)
  const [startBar, setStartBar] = useState<number>(0)
  const [lengthBars, setLengthBars] = useState<number>(4)

  // Generate pattern list (1-99)
  const patterns: Pattern[] = Array.from({ length: 99 }, (_, i) => ({
    index: i + 1,
    name: `Pattern ${i + 1}`,
    steps: 16, // Default steps, could be made dynamic
    hasData: Math.random() > 0.7 // Placeholder - would need actual pattern data check
  }))

  const handleAddToTimeline = useCallback(() => {
    if (currentPattern > 0) {
      onAddToTimeline(selectedTrack, currentPattern, startBar, lengthBars)
    }
  }, [currentPattern, selectedTrack, startBar, lengthBars, onAddToTimeline])

  const getPatternUsage = useCallback((patternIndex: number) => {
    return tracks.reduce((count, track) => {
      return count + track.clips.filter(clip => clip.patternIndex === patternIndex).length
    }, 0)
  }, [tracks])

  return (
    <S.Container>
      <S.Header>
        <S.Title>Pattern Manager</S.Title>
        <S.CurrentPattern>Current: Pattern {currentPattern}</S.CurrentPattern>
      </S.Header>

      <S.Content>
        <S.PatternList>
          <S.PatternListHeader>
            <S.PatternColumn>Pattern</S.PatternColumn>
            <S.UsageColumn>Usage</S.UsageColumn>
            <S.ActionsColumn>Actions</S.ActionsColumn>
          </S.PatternListHeader>

          {patterns.slice(0, 20).map((pattern) => {
            const usage = getPatternUsage(pattern.index)
            const isCurrent = pattern.index === currentPattern

            return (
              <S.PatternRow key={pattern.index} $isCurrent={isCurrent}>
                <S.PatternColumn>
                  <S.PatternButton
                    $isCurrent={isCurrent}
                    onClick={() => onPatternSelect(pattern.index)}
                  >
                    {pattern.name}
                  </S.PatternButton>
                </S.PatternColumn>

                <S.UsageColumn>
                  <S.UsageBadge $hasUsage={usage > 0}>
                    {usage} clip{usage !== 1 ? 's' : ''}
                  </S.UsageBadge>
                </S.UsageColumn>

                <S.ActionsColumn>
                  <S.SelectButton
                    onClick={() => onPatternSelect(pattern.index)}
                    disabled={isCurrent}
                  >
                    Select
                  </S.SelectButton>
                </S.ActionsColumn>
              </S.PatternRow>
            )
          })}
        </S.PatternList>

        <S.AddToTimelineSection>
          <S.SectionTitle>Add to Timeline</S.SectionTitle>

          <S.Controls>
            <S.ControlGroup>
              <S.Label>Track:</S.Label>
              <S.Select
                value={selectedTrack}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTrack(Number(e.target.value))}
              >
                {tracks.map((track, index) => (
                  <option key={index} value={index}>
                    {track.name}
                  </option>
                ))}
              </S.Select>
            </S.ControlGroup>

            <S.ControlGroup>
              <S.Label>Start Bar:</S.Label>
              <S.NumberInput
                type="number"
                min={0}
                max={totalBars - 1}
                value={startBar}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartBar(Math.max(0, Math.min(totalBars - 1, Number(e.target.value))))}
              />
            </S.ControlGroup>

            <S.ControlGroup>
              <S.Label>Length (bars):</S.Label>
              <S.NumberInput
                type="number"
                min={1}
                max={totalBars - startBar}
                value={lengthBars}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLengthBars(Math.max(1, Math.min(totalBars - startBar, Number(e.target.value))))}
              />
            </S.ControlGroup>
          </S.Controls>

          <S.AddButton
            onClick={handleAddToTimeline}
            disabled={currentPattern === 0}
          >
            Add Pattern {currentPattern} to Timeline
          </S.AddButton>
        </S.AddToTimelineSection>

        <S.TimelinePreview>
          <S.SectionTitle>Timeline Preview</S.SectionTitle>
          <S.TimelineGrid>
            {tracks.map((track, trackIndex) => (
              <S.TrackPreview key={trackIndex}>
                <S.TrackName>{track.name}</S.TrackName>
                <S.TrackClips>
                  {track.clips.map((clip, clipIndex) => (
                    <S.ClipPreview
                      key={clipIndex}
                      style={{
                        left: `${(clip.startBar / totalBars) * 100}%`,
                        width: `${(clip.lengthBars / totalBars) * 100}%`
                      }}
                      title={`Pattern ${clip.patternIndex} (${clip.lengthBars} bars)`}
                    >
                      P{clip.patternIndex}
                    </S.ClipPreview>
                  ))}
                </S.TrackClips>
              </S.TrackPreview>
            ))}
          </S.TimelineGrid>
        </S.TimelinePreview>
      </S.Content>
    </S.Container>
  )
}

export default PatternManager
