import './ColorSelector.css';

function ColorSelectorGroup({ title, colors, onSelect, selected }) {
  return (
    <div className="color-group">
      <div className="color-header">
        <span className="group-title">{title}</span>
        {selected && (
          <div className="selected-pill">
            {selected.name} (RAL {selected.ral})
            <div
              className="color-preview"
              style={{ backgroundColor: selected.hex }}
            />
          </div>
        )}
      </div>

      <div className="color-options">
        {colors.map((color) => (
          <div
            key={color.ral}
            className={`color-dot ${selected?.ral === color.ral ? 'selected' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onSelect(color)}
            title={`${color.name} (RAL ${color.ral})`}
          >
            {selected?.ral === color.ral && <span className="checkmark">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorSelectorGroup;
