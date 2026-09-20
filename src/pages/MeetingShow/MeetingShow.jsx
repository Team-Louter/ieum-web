import MeetingCard from "../../components/Meeting/MeetingCard"
import './MeetingShow.css'

export default function MeetingShow() {
  return(
    <div className="meeting-list">
      <MeetingCard/>
      <MeetingCard/>
      <MeetingCard/>
    </div>
  )
}