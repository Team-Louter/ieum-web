import Layout from '../../../components/common/Layout/Layout';
import MeetingCard from '../../../components/meeting/MeetingCard/MeetingCard';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import { dummyMeetings } from '../../../constants/dummy/dummyMeetings';
import './MeetingShowPage.css';

export default function MeetingShowPage({
  meetings = dummyMeetings,
  onMeetingSelect,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const meetingItems = Array.isArray(meetings) ? meetings : [];
  const isEmpty = meetingItems.length === 0 && !isLoading && !apiError;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath === '/meeting/my' },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className={`meeting-list${isEmpty ? ' meeting-list--empty' : ''}`}>
        {meetingItems.length > 0 ? (
          meetingItems.map((meeting, index) => (
            <MeetingCard
              key={meeting.id ?? index}
              meeting={meeting}
              to={meeting.href ?? (meeting.id != null ? `/meeting/detail/${meeting.id}` : undefined)}
              onClick={() => onMeetingSelect?.(meeting)}
            />
          ))
        ) : isEmpty ? (
          <EmptyState
            title="아직 모임이 없어요"
            description="새로운 모임을 만들거나 잠시 후 다시 확인해 주세요."
            actionLabel="모임 만들기"
            onAction={() => onNavigate?.('/meeting/make')}
          />
        ) : null}
      </div>
    </Layout>
  );
}
