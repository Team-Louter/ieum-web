import './SettingToggle.css';

function SettingToggle({ checked, onChange, label }) {
  return (
    <label className="setting-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <span aria-hidden="true" />
    </label>
  );
}

export default SettingToggle;
