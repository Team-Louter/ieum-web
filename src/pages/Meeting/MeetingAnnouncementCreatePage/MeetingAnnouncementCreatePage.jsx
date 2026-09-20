import { useNavigate } from "react-router-dom";
import './MeetingAnnouncementCreatePage.css';

export default function MeetingAnnouncementCreatePage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/meeting-my");
  }

  return (
    <form className="announcement-make" onSubmit={handleSubmit}>
      <input
        className="announcement-make-title"
        type="text"
        placeholder="공지 제목을 입력해 주세요"
        aria-label="공지 제목"
        required
      />
      <textarea
        className="announcement-make-content"
        placeholder="공지 내용을 입력해 주세요"
        aria-label="공지 내용"
        required
      />
      <button className="announcement-make-submit" type="submit">
        공지사항 올리기
      </button>
    </form>
  );
}
