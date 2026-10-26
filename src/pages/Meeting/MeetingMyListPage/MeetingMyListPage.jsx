import Layout from '../../../components/common/Layout/Layout';
import MeetingCard from '../../../components/meeting/MeetingCard/MeetingCard';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import { dummyMyMeetings } from '../../../constants/dummy/dummyMeetings';
import './MeetingMyListPage.css';

export default function MeetingMyListPage({
  meetings = dummyMyMeetings,
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
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className={`meeting-my-list${isEmpty ? ' meeting-my-list--empty' : ''}`}>
        {meetingItems.length > 0 ? (
          meetingItems.map((meeting, index) => (
            <MeetingCard
              key={meeting.id ?? index}
              meeting={meeting}
              to={
                meeting.href ??
                (meeting.id != null ? `/meeting/my/detail/${meeting.id}` : '/meeting/my/detail')
              }
              onClick={() => onMeetingSelect?.(meeting)}
            />
          ))
        ) : isEmpty ? (
          <EmptyState
            title="내 모임이 없어요"
            description="현재 표시할 수 있는 모임이 없습니다."
            actionLabel="모임 목록 보기"
            onAction={() => onNavigate?.('/meeting')}
          />
        ) : null}
      </div>
    </Layout>
  );
}
