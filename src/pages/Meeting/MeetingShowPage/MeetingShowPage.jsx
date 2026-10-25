import Layout from '../../../components/common/Layout/Layout';
import MeetingCard from '../../../components/meeting/MeetingCard/MeetingCard';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import { dummyMeetings } from '../../../constants/dummy/dummyMeetings';
import './MeetingShowPage.css';

export default function MeetingShowPage({ meetings = dummyMeetings, onMeetingSelect }) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath === '/meeting/my' },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="meeting-list">
        {meetings.map((meeting, index) => (
          <MeetingCard
            key={meeting.id ?? index}
            meeting={meeting}
            to={meeting.href}
            onClick={() => onMeetingSelect?.(meeting)}
          />
        ))}
      </div>
    </Layout>
  );
}
