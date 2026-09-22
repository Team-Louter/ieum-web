import { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import UserSignupPage from './pages/SignupPage/UserSignupPage';
import GuardianSignupPage from './pages/SignupPage/GuardianSignupPage';
import MyProfilePageContent from './pages/MyProfile/MyProfilePageContent';
import MyProfilePageFriend from './pages/MyProfile/MyProfilePageFriend';
import MyProfilePageMeeting from './pages/MyProfile/MyProfilePageMeeting';
import FriendLocationPage from './pages/FriendLocation/FriendLocationPage';
import AddFriendPage from './pages/AddFriend/AddFriendPage';
import NeighborCreatePostPage from './pages/Neighbor/NeighborCreatePostPage';
import NeighborFeedPage from './pages/Neighbor/NeighborFeedPage';
import NeighborMyPostsPage from './pages/Neighbor/NeighborMyPostsPage';
import ProfilePageContent from './pages/Profile/ProfilePageContent';
import ProfilePageFriend from './pages/Profile/ProfilePageFriend';
import ProfilePageMeeting from './pages/Profile/ProfilePageMeeting';
import MeetingShowPage from './pages/Meeting/MeetingShowPage/MeetingShowPage';
import MeetingCreatePage from './pages/Meeting/MeetingCreatePage/MeetingCreatePage';
import MeetingMyPage from './pages/Meeting/MeetingMyPage/MeetingMyPage';
import MeetingMyListPage from './pages/Meeting/MeetingMyListPage/MeetingMyListPage';
import MeetingMemberListPage from './pages/Meeting/MeetingMemberListPage/MeetingMemberListPage';
import MeetingAnnouncementCreatePage from './pages/Meeting/MeetingAnnouncementCreatePage/MeetingAnnouncementCreatePage';
import MeetingManagementPage from './pages/Meeting/MeetingManagementPage/MeetingManagementPage';
import MarketFeedPage from './pages/market/MarketFeedPage';
import MarketMyPostPage from './pages/market/MarketMyPostPage';
import MarketPostCreatePage from './pages/market/MarketPostCreatePage';
import './App.css';

const pageRoutes = {
  '/myProfile': MyProfilePageContent,
  '/myProfile/meetings': MyProfilePageMeeting,
  '/myProfile/friends': MyProfilePageFriend,
  '/friends/location': FriendLocationPage,
  '/addfriend': AddFriendPage,
  '/neighbor': NeighborFeedPage,
  '/neighbor/my': NeighborMyPostsPage,
  '/neighbor/create': NeighborCreatePostPage,
  '/profile': ProfilePageContent,
  '/profile/meetings': ProfilePageMeeting,
  '/profile/friends': ProfilePageFriend,
  '/meeting': MeetingShowPage,
  '/meeting/my': MeetingMyListPage,
  '/meeting/my/detail': MeetingMyPage,
  '/meeting/make': MeetingCreatePage,
  '/meeting/my/member-list': MeetingMemberListPage,
  '/meeting/announcement/make': MeetingAnnouncementCreatePage,
  '/meeting/management': MeetingManagementPage,
  '/market': MarketFeedPage,
  '/market/my': MarketMyPostPage,
  '/market/create': MarketPostCreatePage,
};

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
    return <Page />;
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
