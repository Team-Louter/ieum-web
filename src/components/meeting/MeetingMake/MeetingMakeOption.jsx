import './MeetingMakeOption.css';

export default function MeetingMakeOption({ title, desc, checked = false, onChange, name }) {
  return (
    <div className="meeting-make-option-container">
      <div className="meeting-make-option-text-container">
        <p className="meeting-make-option-title">{title}</p>
        <p className="meeting-make-option-desc">{desc}</p>
      </div>
      <label className="meeting-option-switch">
        <input
          type="checkbox"
          aria-label={title}
          name={name}
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span className="meeting-option-switch__track" aria-hidden="true"></span>
      </label>
    </div>
  );
}
