import './MeetingMakeOptionSelect.css';
import { useState } from 'react';

export default function MeetingMakeOptionSelect({
  title,
  desc,
  option1,
  option2,
  option3,
  value,
  onChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState(option1);
  const options = [option1, option2, option3].filter(Boolean);
  const selected = value ?? localSelected;

  function selectOption(option) {
    setLocalSelected(option);
    onChange?.(option);
    setIsOpen(false);
  }

  return (
    <div className="meeting-make-option-container">
      <div className="meeting-make-option-text-container">
        <p className="meeting-make-option-title">{title}</p>
        <p className="meeting-make-option-desc">{desc}</p>
      </div>
      <div style={{ position: 'relative', width: '120px' }}>
        <button
          className="select-button"
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selected}
        </button>
        {isOpen && (
          <ul className="select-list" role="listbox">
            {options.map((option) => (
              <li
                key={option}
                role="option"
                aria-selected={selected === option}
                onClick={() => selectOption(option)}
                className="select-list-card"
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
