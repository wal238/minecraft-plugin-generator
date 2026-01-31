/**
 * Simple select dropdown for predefined options.
 * Options format: [{ value: 'VALUE', label: 'Display Label' }, ...]
 */
export default function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select
      className="form-input form-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
