import Layout from '../../../components/common/Layout/Layout';
import MeetingMyAnnouncement from '../../../components/meeting/MeetingMy/MeetingMyAnnouncement';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';
import dotSetting from '../../../assets/dot_setting.svg';
import './MeetingMyPage.css';
import MeetingKebabMenu from '../../../components/meeting/MeetingKebabMenu/MeetingKebabMenu';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import {
  dummyMeetingAnnouncement,
  dummyMeetingMembers,
  dummyMyMeetings,
} from '../../../constants/dummy/dummyMeetings';


export default function MeetingMyPage({
  meeting = dummyMyMeetings[0],
  announcement = dummyMeetingAnnouncement,
  members = dummyMeetingMembers,
  onMemberAction,
  onAnnouncementCreate,
  onAnnouncementMore,
}) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="contents-layout">
        <div className="meeting-my-card">
          <div className="meeting-my-contents">
            <img
              className="meeting-card-img"
              src={meeting.image ?? mulchongsae}
              alt={`${meeting.title ?? '모임'} 대표 이미지`}
            />
            <div className="meeting-card-info">
              <p className="meeting-card-info-title">{meeting.title ?? ''}</p>
              <p className="meeting-card-info-desc">{meeting.description ?? ''}</p>
              <p className="meeting-card-info-meta">
                {[meeting.region, meeting.memberCount == null ? '' : `${meeting.memberCount}명`]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
            </div>
          </div>
          <MeetingKebabMenu image={dotSetting} />
        </div>
        <div className="contents-horizen"></div>
        <MeetingMyAnnouncement
          announcement={announcement}
          onCreate={onAnnouncementCreate}
          onMore={onAnnouncementMore}
        />
        <div className="contents-horizen"></div>
        <MeetingMyMemberList
          members={members}
          maxVisible={6}
          onMemberAction={onMemberAction}
        />
      </div>
    </Layout>
  )
}
