import './MeetingMakeOption.css'

export default function MeetingMakeOption( {title, desc} ) {
  return (

    <div className="meeting-make-option-container">
      <div className="meeting-make-option-text-container">
        <p className="meeting-make-option-title">{title}</p>
        <p className="meeting-make-option-desc">{desc}</p>
      </div>
      <label className="toggle-switch">
        <input type="checkbox"/>
        <span className="slider"></span>
      </label>
    </div>
  )
}