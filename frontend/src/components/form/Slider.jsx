/**
 * Slider input with value display.
 */
export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  hint,
}) {
  const numValue = parseFloat(value) || min;
  const percentage = ((numValue - min) / (max - min)) * 100;

  return (
    <div className="slider-wrapper">
      <div className="slider-container">
        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step={step}
          value={numValue}
          onChange={(e) => onChange(e.target.value)}
          style={{
            background: `linear-gradient(to right, #3498db 0%, #3498db ${percentage}%, #ddd ${percentage}%, #ddd 100%)`,
          }}
        />
        <span className="slider-value">{numValue}</span>
      </div>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}
