import './SettingToggle.css';

function SettingToggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`setting-toggle${disabled ? ' is-disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        disabled={disabled}
      />
      <span aria-hidden="true" />
    </label>
  );
}

export default SettingToggle;
