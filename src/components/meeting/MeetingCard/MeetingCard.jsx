import './MeetingCard.css';
import { Link } from 'react-router-dom';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';

export default function MeetingCard({ onClick, to }) {
  const cardContent = (
    <>
      <img className="meeting-card-img" src={mulchongsae} alt="예시 이미지"></img>
      <div className="meeting-card-info">
        <p className="meeting-card-info-title">모임 이름</p>
        <p className="meeting-card-info-desc">모임 소개</p>
        <p className="meeting-card-info-meta">모임 지역 • 회원수</p>
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
