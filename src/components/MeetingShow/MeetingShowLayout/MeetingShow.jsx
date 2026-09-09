import MeetingCard from "../../Meeting/MeetingCard/MeetingCard"
import MeetingShowAnnouncement from "../MeetingShowAnnouncement/MeetingShowAnnouncement"
import MeetingShowMember from "../MeetingShowMember/MeetingShowMember"
import './MeetingShow.css'


export default function MeetingShow() {
  return (
    <div className="contents-layout">
      <MeetingCard/>
      <div className="contents-horizen"></div>
      <MeetingShowAnnouncement/>
      <div className="contents-horizen"></div>
      <MeetingShowMember/>
    </div>
  )
}