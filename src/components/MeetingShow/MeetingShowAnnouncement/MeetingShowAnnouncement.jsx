import './MeetingShowAnnouncement.css'
import profile_image from '../../../assets/profile_image.png'

export default function MeetingShowAnnouncement() {
  return (
    <div className="Announcement-container">
      <div className="Announcement-header">
        <p className="Announcement-title">공지사항</p>
        <p className="Announcement-more">더보기</p>
      </div>
      <div className="Announcement-card">
        <div className="Announcement-card-container">
          <div className='Announcement-profile'>
            <img src={profile_image} alt="프로필 사진"/>
            <p>아이디</p>
          </div>
          <p className="announcement-card-title">공지 제목</p>
          <p className="announcement-card-info">공지 내용</p>
        </div>
      </div>
    </div>
  )
}