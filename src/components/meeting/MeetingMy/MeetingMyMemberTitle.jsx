import './MeetingMyMemberTitle.css';
import { useNavigate } from 'react-router-dom';

export default function MeetingMyMemberTitle({ HowManyUser, onMore, meetingId, showMore = true }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="member-header">
        <p className="member-title">회원 ({HowManyUser ?? 0}명)</p>
        {showMore && (
          <button
            className="member-more"
            type="button"
            onClick={() => {
              if (onMore) onMore();
              else if (meetingId != null) navigate(`/meeting/my/member-list/${meetingId}`);
            }}
          >
            더보기
          </button>
        )}
      </div>
    </div>
  );
}
