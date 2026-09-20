import { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import UserSignupPage from './pages/SignupPage/UserSignupPage';
import GuardianSignupPage from './pages/SignupPage/GuardianSignupPage';
import MyProfilePageContent from './pages/MyProfile/MyProfilePageContent';
import MyProfilePageFriend from './pages/MyProfile/MyProfilePageFriend';
import MyProfilePageMeeting from './pages/MyProfile/MyProfilePageMeeting';
import FriendLocationPage from './pages/FriendLocation/FriendLocationPage';
import NeighborCreatePostPage from './pages/Neighbor/NeighborCreatePostPage';
import NeighborFeedPage from './pages/Neighbor/NeighborFeedPage';
import NeighborMyPostsPage from './pages/Neighbor/NeighborMyPostsPage';
import ProfilePageContent from './pages/Profile/ProfilePageContent';
import ProfilePageFriend from './pages/Profile/ProfilePageFriend';
import ProfilePageMeeting from './pages/Profile/ProfilePageMeeting';
import MeetingShow from './pages/MeetingShow/MeetingShow';
import MeetingMakeLayout from './pages/MeetingMake/MeetingMakeLayout';
import MeetingMy from './pages/MeetingMy/MeetingMy';
import MeetingMyMemberList from './pages/MeetingMyMemberList/MeetingMyMembers';
import MeetingAnnouncementMake from './pages/MeetingAnnouncementMake/MeetingAnnouncementMake';
import MeetingManagement from './pages/MeetingManagement/MeetingManagement';
import Layout from './components/common/Layout/Layout';
import PageTabNavigation from './components/common/PageTabNavigation/PageTabNavigation';
import ChattingPage from './pages/Chatting/ChattingPage';

import './App.css';

const pageRoutes = {
  '/myProfile': MyProfilePageContent,
  '/myProfile/meetings': MyProfilePageMeeting,
  '/myProfile/friends': MyProfilePageFriend,
  '/friends/location': FriendLocationPage,
  '/neighbor': NeighborFeedPage,
  '/neighbor/my': NeighborMyPostsPage,
  '/neighbor/create': NeighborCreatePostPage,
  '/profile': ProfilePageContent,
  '/profile/meetings': ProfilePageMeeting,
  '/profile/friends': ProfilePageFriend,
  '/meeting-show': MeetingShow,
  '/meeting-my': MeetingMy,
  '/meeting-make': MeetingMakeLayout,
  '/meeting-my-member-list': MeetingMyMemberList,
  '/meeting-announcement-make': MeetingAnnouncementMake,
  '/meeting-management': MeetingManagement,
  '/chatting': ChattingPage,
};

function MeetingLayout({ children, currentPath }) {
  const menuItems = [
    { label: '모임 보기', href: '/meeting-show', isActive: currentPath === '/meeting-show' },
    { label: '내 모임', href: '/meeting-my', isActive: currentPath.startsWith('/meeting-my') || currentPath === '/meeting-announcement-make' || currentPath === '/meeting-management' },
    { label: '모임 만들기', href: '/meeting-make', isActive: currentPath === '/meeting-make' },
  ];

  return (
    <Layout className="meeting-layout">
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      {children}
    </Layout>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('login');
  const currentPath = useLocation().pathname.replace(/\/$/, '') || '/';
  const Page = pageRoutes[currentPath];

  /* 화면 이동 */
  function movePage(pageName) {
    window.scrollTo(0, 0);
    setCurrentPage(pageName);
  }

  if (Page) {
    const pageContent = <Page />;

    return currentPath.startsWith('/meeting') ? (
      <MeetingLayout currentPath={currentPath}>{pageContent}</MeetingLayout>
    ) : pageContent;
  }

  if (currentPage === 'community') {
    return <NeighborFeedPage />;
  }

  if (currentPage === 'signup-user') {
    return <UserSignupPage onNavigate={movePage} />;
  }

  if (currentPage === 'signup-guardian') {
    return <GuardianSignupPage onNavigate={movePage} />;
  }

  return <LoginPage onNavigate={movePage} />;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
