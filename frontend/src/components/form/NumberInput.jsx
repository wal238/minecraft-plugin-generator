/**
 * Number input with optional min/max/step constraints.
 */
export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
  placeholder,
}) {
  return (
    <div className="number-input-wrapper">
      <input
        type="number"
        className="form-input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}
