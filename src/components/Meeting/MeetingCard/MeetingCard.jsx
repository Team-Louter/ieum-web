import './MeetingCard.css'
import mulchongsae from '../../../assets/mulchongsae.jpg'

export default function MeetingCard() {
  return (
    <div className="meeting-card">
      <img className="meeting-card-img" src={mulchongsae} alt="예시 이미지"></img>
      <div className="meeting-card-info">
        <p className="meeting-card-info-title">모임 이름</p>
        <p className="meeting-card-info-desc">모임 소개</p>
        <p className="meeting-card-info-meta">모임 지역 • 회원수</p>
      </div>
    </div>
  )
}