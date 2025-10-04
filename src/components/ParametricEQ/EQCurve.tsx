import { useEffect, useMemo, useRef } from 'react'
import type { EQSettings } from '../../audio/eq'
import { calculateEQCurve, freqToX, gainToY } from '../../audio/eqCurve'
import * as S from './EQCurve.styles'

type Props = {
  eqBands: EQSettings
  width?: number
  height?: number
  maxDb?: number
  sampleRate?: number
}

const BAND_COLORS = [
  '#ff4757', // Red - Low
  '#ffa502', // Orange - Low-Mid  
  '#fffa65', // Yellow - Mid
  '#7bed9f', // Green - High-Mid
  '#70a1ff', // Blue - High
  '#a4b0be', // Gray - Air
]

export function EQCurve({ 
  eqBands, 
  width = 400, 
  height = 200, 
  maxDb = 12, 
  sampleRate = 44100 
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Calculate curve data
  const curveData = useMemo(() => {
    return calculateEQCurve(eqBands, 200, sampleRate)
  }, [eqBands, sampleRate])
  
  // Calculate handle positions for each band
  const handlePositions = useMemo(() => {
    return eqBands.map((band, index) => ({
      x: freqToX(band.frequency, width),
      y: gainToY(band.gain, height, maxDb),
      enabled: band.enabled,
      gain: band.gain,
      frequency: band.frequency,
      color: BAND_COLORS[index]
    }))
  }, [eqBands, width, height, maxDb])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    canvas.width = width
    canvas.height = height
    
    // Clear canvas
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    // Horizontal grid lines (gain)
    const dbSteps = [-12, -6, 0, 6, 12]
    dbSteps.forEach(db => {
      const y = gainToY(db, height, maxDb)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 4, y - 2)
    })
    
    // Vertical grid lines (frequency)
    const freqSteps = [100, 1000, 10000]
    freqSteps.forEach(freq => {
      const x = freqToX(freq, width)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      const label = freq >= 1000 ? `${freq/1000}k` : `${freq}`
      ctx.fillText(`${label}Hz`, x, height - 4)
    })
    
    ctx.setLineDash([])
    
    // Draw flat reference line (0dB) more prominently
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.lineWidth = 2
    const centerY = gainToY(0, height, maxDb)
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.stroke()
    
    // Draw EQ response curve
    const { frequencies, gains } = curveData
    
    // Fill area under/over curve
    ctx.fillStyle = 'rgba(33, 199, 190, 0.2)'
    ctx.beginPath()
    ctx.moveTo(freqToX(frequencies[0], width), centerY)
    for (let i = 0; i < frequencies.length; i++) {
      const x = freqToX(frequencies[i], width)
      const y = gainToY(gains[i], height, maxDb)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(freqToX(frequencies[frequencies.length - 1], width), centerY)
    ctx.closePath()
    ctx.fill()
    
    // Draw main curve
    ctx.strokeStyle = '#21c7be'
    ctx.lineWidth = 3
    ctx.beginPath()
    for (let i = 0; i < frequencies.length; i++) {
      const x = freqToX(frequencies[i], width)
      const y = gainToY(gains[i], height, maxDb)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    
    // Draw band handles
    handlePositions.forEach((handle) => {
      if (!handle.enabled) return
      
      const { x, y, color, gain, frequency } = handle
      
      // Draw connection line from center to handle
      ctx.strokeStyle = `${color}aa`
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw handle circle
      ctx.fillStyle = color
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // Draw handle label
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.shadowColor = '#000'
      ctx.shadowBlur = 4
      
      const freqLabel = frequency >= 1000 ? `${(frequency/1000).toFixed(1)}k` : `${frequency}`
      const gainLabel = `${gain > 0 ? '+' : ''}${gain.toFixed(1)}dB`
      
      // Position label above or below handle to avoid overlap
      const labelY = y < height/2 ? y + 25 : y - 15
      ctx.fillText(`${freqLabel}`, x, labelY)
      ctx.fillText(`${gainLabel}`, x, labelY + 12)
      
      ctx.shadowBlur = 0
    })
    
  }, [curveData, handlePositions, width, height, maxDb])

  return (
    <S.Container>
      <S.Title>EQ Frequency Response</S.Title>
      <S.Canvas 
        ref={canvasRef}
        width={width}
        height={height}
      />
      <S.Legend>
        {eqBands.map((band, index) => (
          <S.LegendItem key={index} $enabled={band.enabled}>
            <S.ColorDot $color={BAND_COLORS[index]} />
            <S.BandName>
              {['Low', 'Low-Mid', 'Mid', 'High-Mid', 'High', 'Air'][index]}
            </S.BandName>
            <S.BandInfo>
              {band.frequency >= 1000 ? `${(band.frequency/1000).toFixed(1)}k` : `${band.frequency}`}Hz
              {' '}
              {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)}dB
            </S.BandInfo>
          </S.LegendItem>
        ))}
      </S.Legend>
    </S.Container>
  )
}

export default EQCurve