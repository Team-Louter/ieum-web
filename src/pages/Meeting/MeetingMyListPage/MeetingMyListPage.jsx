import Layout from '../../../components/common/Layout/Layout';
import MeetingCard from '../../../components/meeting/MeetingCard/MeetingCard';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import './MeetingMyListPage.css';

export default function MeetingMyListPage() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="meeting-my-list">
        {[1, 2, 3, 4, 5].map((meeting) => (
          <MeetingCard
            key={meeting}
            to="/meeting/my/detail"
          />
        ))}
      </div>
    </Layout>
  );
}
