import { useCallback, useEffect, useRef } from "react";
import type { EQBand } from "../../audio/eq";
import { Knob } from "../Knob/Knob";
import * as S from "./ParametricEQ.styles";

type Props = {
  eqBands: [EQBand, EQBand, EQBand, EQBand, EQBand, EQBand];
  onChange?: (bandIndex: number, band: EQBand) => void;
  showCurve?: boolean;
  onShowCurveChange?: (show: boolean) => void;
};

const bandNames = ["Low", "Low-Mid", "Mid", "High-Mid", "High", "Air"];

export function ParametricEQ({ eqBands, onChange, showCurve = false, onShowCurveChange }: Props) {
  const eqBandsRef = useRef(eqBands);
  const onChangeRef = useRef(onChange);
  
  useEffect(() => {
    eqBandsRef.current = eqBands;
  }, [eqBands]);
  
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleBandChange = useCallback(
    (bandIndex: number, param: Partial<EQBand>) => {
      const newBand: EQBand = {
        ...eqBandsRef.current[bandIndex],
        ...param,
      };
      onChangeRef.current?.(bandIndex, newBand);
    },
    []
  );

  return (
    <S.Container>
      <S.Header>
        <S.Title>Parametric EQ (6 Bands)</S.Title>
        <S.ShowCurveToggle>
          <input
            type="checkbox"
            id="show-eq-curve"
            checked={showCurve}
            onChange={(e) => onShowCurveChange?.(e.target.checked)}
          />
          <label htmlFor="show-eq-curve">Show EQ Curve</label>
        </S.ShowCurveToggle>
      </S.Header>
      <S.BandsGrid>
        {eqBands.map((band, index) => (
          <S.Band key={index} $enabled={band.enabled}>
            <S.BandHeader>
              <S.BandLabel>{bandNames[index]}</S.BandLabel>
              <S.BandToggle
                checked={band.enabled}
                onChange={(e) =>
                  handleBandChange(index, { enabled: e.target.checked })
                }
              />
            </S.BandHeader>
            <S.KnobsGrid>
              <Knob
                label="Freq"
                min={20}
                max={20000}
                step={10}
                value={band.frequency}
                onChange={(v) => handleBandChange(index, { frequency: v })}
                format={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v.toFixed(0)}`
                }
                size="small"
              />
              <Knob
                label="Gain"
                min={-12}
                max={12}
                step={0.5}
                value={band.gain}
                onChange={(v) => handleBandChange(index, { gain: v })}
                format={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
                size="small"
              />
              <Knob
                label="Q"
                min={0.1}
                max={10}
                step={0.1}
                value={band.q}
                onChange={(v) => handleBandChange(index, { q: v })}
                format={(v) => v.toFixed(1)}
                size="small"
              />
            </S.KnobsGrid>
          </S.Band>
        ))}
      </S.BandsGrid>
    </S.Container>
  );
}

export default ParametricEQ;

