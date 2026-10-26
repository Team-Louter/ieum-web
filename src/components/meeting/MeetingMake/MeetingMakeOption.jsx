import './MeetingMakeOption.css';

export default function MeetingMakeOption({ title, desc, checked = false, onChange, name }) {
  return (
    <div className="meeting-make-option-container">
      <div className="meeting-make-option-text-container">
        <p className="meeting-make-option-title">{title}</p>
        <p className="meeting-make-option-desc">{desc}</p>
      </div>
      <label className="toggle-switch">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
}
