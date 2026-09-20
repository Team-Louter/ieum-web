import './MeetingMakeOptionSelect.css'
import { useState } from 'react';

export default function MeetingMakeOptionSelect( {title, desc, selectTitle, option1, option2, option3} ) {

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState( option1 );

  return (

    <div className="meeting-make-option-container">
      <div className="meeting-make-option-text-container">
        <p className="meeting-make-option-title">{title}</p>
        <p className="meeting-make-option-desc">{desc}</p>
      </div>
      <div style={{ position: 'relative', width: '120px' }}>
        <button className="select-button" onClick={() => setIsOpen(!isOpen)}>
          {selected}
        </button>
        {isOpen && (
          <ul className="select-list">
            <li onClick={() => { setSelected(option1); setIsOpen(false); }} className="select-list-card">{option1}</li>
            <li onClick={() => { setSelected(option2); setIsOpen(false); }} className="select-list-card">{option2}</li>
            <li onClick={() => { setSelected(option3); setIsOpen(false); }} className="select-list-card">{option3}</li>
          </ul>
        )}
      </div>
    </div>
  )
}