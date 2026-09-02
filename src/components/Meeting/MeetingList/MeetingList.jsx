import MeetingCard from "../MeetingCard/MeetingCard"
import './MeetingList.css'

export default function MeetingList() {
  return(
    <div className="meeting-list">
      <MeetingCard/>
      <MeetingCard/>
      <MeetingCard/>
    </div>
  )
}