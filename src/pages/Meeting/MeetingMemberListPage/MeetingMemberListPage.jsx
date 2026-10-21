import './MeetingMemberListPage.css';
import MemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import Layout from '../../../components/common/Layout/Layout';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';


export default function MeetingMemberListPage() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div>
        <MemberList/>
      </div>
    </Layout>
  )
}
