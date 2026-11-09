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
        <svg
          className="meeting-option-switch__track"
          width="60"
          height="30"
          viewBox="0 0 60 30"
          aria-hidden="true"
          focusable="false"
        >
          <rect width="60" height="30" rx="15" fill={checked ? '#21b35e' : '#e0e0e0'} />
          <circle cx={checked ? 45 : 15} cy="15" r="11" fill="white" />
        </svg>
      </label>
    </div>
  );
}
