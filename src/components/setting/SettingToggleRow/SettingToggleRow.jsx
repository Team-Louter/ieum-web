import SettingToggle from '../SettingToggle/SettingToggle';
import './SettingToggleRow.css';

function SettingToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="setting-toggle-row">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <SettingToggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export default SettingToggleRow;
