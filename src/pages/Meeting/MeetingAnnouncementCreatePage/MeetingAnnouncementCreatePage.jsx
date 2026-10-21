import { useNavigate } from "react-router-dom";
import './MeetingAnnouncementCreatePage.css';
import Layout from "../../../components/common/Layout/Layout";
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';

export default function MeetingAnnouncementCreatePage() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/meeting/my");
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
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
    </Layout>
  );
}
