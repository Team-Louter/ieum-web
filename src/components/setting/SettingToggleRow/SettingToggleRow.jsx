import SettingToggle from '../SettingToggle/SettingToggle';
import './SettingToggleRow.css';

function SettingToggleRow({ title, description, checked, onChange, disabled = false }) {
  return (
    <div className="setting-toggle-row">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <SettingToggle checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

export default SettingToggleRow;
