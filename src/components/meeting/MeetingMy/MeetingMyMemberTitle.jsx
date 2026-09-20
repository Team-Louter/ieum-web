import "./MeetingMyMemberTitle.css";
import { useNavigate } from "react-router-dom";

export default function MeetingMyMemberTitle( { HowManyUser } ) {
  const navigate = useNavigate();

  return(
    <div>
      <div className="member-header">
        <p className="member-title">회원 ({HowManyUser ?? 0}명)</p>
        <button
          className="member-more"
          type="button"
          onClick={() => navigate("/meeting-my-member-list")}
        >
          더보기
        </button>
      </div>
    </div>
  )
}