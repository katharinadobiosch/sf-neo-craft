export function OptionGroup({label, name, values, selected, onChange}) {
  if (!values || values.length === 0) return null;

  return (
    <div className="option-group">
      <strong>{label}</strong>
      <div className="option-values">
        {values.map((value) => (
          <button
            key={value}
            className={selected === value ? 'active' : ''}
            onClick={() => onChange(name, value)}
            type="button"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
