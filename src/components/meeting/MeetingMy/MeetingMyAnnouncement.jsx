import './MeetingMyAnnouncement.css';
import profileImage from '../../../assets/images/profile.png';
import { useNavigate } from 'react-router-dom';

export default function MeetingMyAnnouncement({
  announcement = {},
  onCreate,
  onMore,
}) {
  const navigate = useNavigate();
  const author = announcement.author ?? {};
  const handleCreate = onCreate ?? (() => navigate('/meeting/announcement/make'));

  return (
    <div className="Announcement-container">
      <div className="Announcement-header">
        <p className="Announcement-title">공지사항</p>
        <div className="Announcement-actions">
          <button
            className="Announcement-write"
            type="button"
            onClick={handleCreate}
          >
            공지 올리기
          </button>
          <button className="Announcement-more" type="button" onClick={onMore}>
            더보기
          </button>
        </div>
      </div>
      <div className="Announcement-card">
        <div className="Announcement-card-container">
          <div className='Announcement-profile'>
            <img src={author.profileImage ?? author.profile_image ?? profileImage} alt="프로필 사진"/>
            <p>{author.id ?? author.nickname ?? ''}</p>
          </div>
          <p className="announcement-card-title">{announcement.title ?? ''}</p>
          <p className="announcement-card-info">{announcement.content ?? ''}</p>
        </div>
      </div>
    </div>
  )
}
