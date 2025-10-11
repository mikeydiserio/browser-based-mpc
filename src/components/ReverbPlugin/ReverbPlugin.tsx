import { useCallback } from 'react'
import { Knob } from '../Knob/Knob'
import * as S from './ReverbPlugin.styles'

interface ReverbPluginProps {
  roomSizeX?: number
  roomSizeY?: number
  roomSizeZ?: number
  damping?: number
  hfDamping?: number
  stereoWidth?: number
  listenersQ?: number
  directLevel?: number
  reflectionLevel?: number
  type?: string
  onChange?: (params: Partial<ReverbParams>) => void
}

interface ReverbParams {
  roomSizeX: number
  roomSizeY: number
  roomSizeZ: number
  damping: number
  hfDamping: number
  stereoWidth: number
  listenersQ: number
  directLevel: number
  reflectionLevel: number
  type: string
}

const ROOM_TYPES = [
  'ABS with Cardio',
  'Small Room',
  'Medium Room',
  'Large Hall',
  'Cathedral',
  'Plate',
  'Spring',
]

export function ReverbPlugin({
  roomSizeX = 3.0,
  roomSizeY = 4.7,
  roomSizeZ = 2.5,
  damping = 0.1,
  hfDamping = 0.05,
  stereoWidth = 1.0,
  listenersQ = 0,
  directLevel = 0.6,
  reflectionLevel = 0.9,
  type = 'ABS with Cardio',
  onChange
}: ReverbPluginProps) {
  
  const handleChange = useCallback((key: keyof ReverbParams, value: number | string) => {
    onChange?.({ [key]: value })
  }, [onChange])

  return (
    <S.Container>
      <S.Header>
        <S.Title>Reverb</S.Title>
        <S.Export>Export FX</S.Export>
      </S.Header>

      <S.VisualizationSection>
        <S.RoomVisualization>
          <S.RoomBox>
            <S.Source $x={30} $y={40} $color="#0066ff" />
            <S.Source $x={70} $y={60} $color="#ff0066" />
            <S.Source $x={50} $y={80} $color="#cc00ff" />
          </S.RoomBox>
        </S.RoomVisualization>

        <S.ControlColumn>
          <S.TypeSelector>
            <S.TypeLabel>Type</S.TypeLabel>
            <S.TypeSelect value={type} onChange={(e) => handleChange('type', e.target.value)}>
              {ROOM_TYPES.map((roomType) => (
                <option key={roomType} value={roomType}>
                  {roomType}
                </option>
              ))}
            </S.TypeSelect>
          </S.TypeSelector>

          <S.RoomSizeControls>
            <S.RoomSizeKnob>
              <Knob
                label="Room Size X"
                min={1}
                max={10}
                step={0.1}
                value={roomSizeX}
                onChange={(v) => handleChange('roomSizeX', v)}
                format={(v) => v.toFixed(2)}
                size={60}
                color="#21c7be"
              />
            </S.RoomSizeKnob>
            <S.RoomSizeKnob>
              <Knob
                label="Room Size Y"
                min={1}
                max={10}
                step={0.1}
                value={roomSizeY}
                onChange={(v) => handleChange('roomSizeY', v)}
                format={(v) => v.toFixed(2)}
                size={60}
                color="#21c7be"
              />
            </S.RoomSizeKnob>
            <S.RoomSizeKnob>
              <Knob
                label="Room Size Z"
                min={1}
                max={10}
                step={0.1}
                value={roomSizeZ}
                onChange={(v) => handleChange('roomSizeZ', v)}
                format={(v) => v.toFixed(2)}
                size={60}
                color="#21c7be"
              />
            </S.RoomSizeKnob>
          </S.RoomSizeControls>
        </S.ControlColumn>
      </S.VisualizationSection>

      <S.KnobsSection>
        <S.KnobGroup>
          <Knob
            label="Damping"
            min={0}
            max={1}
            step={0.01}
            value={damping}
            onChange={(v) => handleChange('damping', v)}
            format={(v) => v.toFixed(2)}
            size={70}
            color="#00ff88"
          />
        </S.KnobGroup>

        <S.KnobGroup>
          <Knob
            label="HF Damping"
            min={0}
            max={1}
            step={0.01}
            value={hfDamping}
            onChange={(v) => handleChange('hfDamping', v)}
            format={(v) => v.toFixed(3)}
            size={70}
            color="#21c7be"
          />
        </S.KnobGroup>

        <S.KnobGroup>
          <Knob
            label="Stereo Width"
            min={0}
            max={2}
            step={0.01}
            value={stereoWidth}
            onChange={(v) => handleChange('stereoWidth', v)}
            format={(v) => v.toFixed(2)}
            size={70}
            color="#00ff88"
          />
        </S.KnobGroup>

        <S.KnobGroup>
          <Knob
            label="ListenersQ"
            min={0}
            max={10}
            step={0.1}
            value={listenersQ}
            onChange={(v) => handleChange('listenersQ', v)}
            format={(v) => v.toFixed(1)}
            size={70}
            color="#cc00ff"
          />
        </S.KnobGroup>

        <S.KnobGroup>
          <Knob
            label="Direct Level"
            min={0}
            max={1}
            step={0.01}
            value={directLevel}
            onChange={(v) => handleChange('directLevel', v)}
            format={(v) => v.toFixed(1)}
            size={70}
            color="#ff9500"
          />
        </S.KnobGroup>

        <S.KnobGroup>
          <Knob
            label="Reflection Level"
            min={0}
            max={1}
            step={0.01}
            value={reflectionLevel}
            onChange={(v) => handleChange('reflectionLevel', v)}
            format={(v) => v.toFixed(1)}
            size={70}
            color="#ff9500"
          />
        </S.KnobGroup>
      </S.KnobsSection>

      <S.ProgressBar>
        <S.ProgressFill $width={50} />
      </S.ProgressBar>
    </S.Container>
  )
}

