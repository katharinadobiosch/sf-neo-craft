import {OptionGroup} from './OptionGroup';

export function Configurator({options, selected, onChange}) {
  return (
    <div className="configurator">
      <h3>Configurator</h3>

      <OptionGroup
        label="Color Glass"
        name="glass"
        values={options.glass}
        selected={selected.glass}
        onChange={onChange}
      />
      <OptionGroup
        label="Color Metal"
        name="metal"
        values={options.metal}
        selected={selected.metal}
        onChange={onChange}
      />
      <OptionGroup
        label="Size"
        name="size"
        values={options.size}
        selected={selected.size}
        onChange={onChange}
      />

      {/* Optionale UI-Felder */}
      <OptionGroup
        label="Plug"
        name="plug"
        values={['EU', 'US', 'UK', 'AUS', 'CN', 'KOR', 'JPN']}
        selected={selected.plug}
        onChange={onChange}
      />
      <OptionGroup
        label="Extra OLED panel"
        name="oled"
        values={['00']}
        selected={selected.oled}
        onChange={onChange}
      />
    </div>
  );
}
