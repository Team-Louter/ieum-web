import './MeetingCard.css';
import { Link } from 'react-router-dom';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';

export default function MeetingCard({ meeting = {}, onClick, to }) {
  const { title = '', description = '', region = '', memberCount, image } = meeting;
  const meta = [region, memberCount == null ? '' : `${memberCount}명`].filter(Boolean).join(' • ');

  const cardContent = (
    <>
      <img
        className="meeting-card-img"
        src={image || mulchongsae}
        alt={`${title || '모임'} 대표 이미지`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = mulchongsae;
        }}
      />
      <div className="meeting-card-info">
        <p className="meeting-card-info-title">{title}</p>
        <p className="meeting-card-info-desc">{description}</p>
        <p className="meeting-card-info-meta">{meta}</p>
        {meeting.membershipStatus === 'PENDING' && <p role="status">가입 승인 대기 중</p>}
      </div>
    </>
  );

  if (to) {
    return (
      <Link className="meeting-card" to={to}>
        {cardContent}
      </Link>
    );
  }

  return (
    <button className="meeting-card" type="button" onClick={onClick}>
      {cardContent}
    </button>
  );
}
