import { BrowserRouter as Router, useLocation, useNavigate, } from 'react-router-dom';
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
import Layout from './components/common/Layout/Layout';
import PageTabNavigation from './components/common/PageTabNavigation/PageTabNavigation';
import ChattingPage from './pages/Chatting/ChattingPage';
import SettingsPage from './pages/setting/SettingsPage/SettingsPage';
import MarketFeedPage from './pages/market/MarketFeedPage';
import MarketMyPostPage from './pages/market/MarketMyPostPage';
import MarketPostCreatePage from './pages/market/MarketPostCreatePage';
import MarketFeedInPage from './pages/market/MarketFeedInPage';
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
  '/market/feedin': MarketFeedInPage,
  '/chatting': ChattingPage,
  '/settings': SettingsPage,
  '/login': LoginPage,
  '/signup/user': UserSignupPage,
  '/signup/guardian': GuardianSignupPage,
};

function AppContent() {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname.replace(/\/$/, '') || '/login';
  const Page = pageRoutes[currentPath];

  /* 화면 이동 */
  function movePage(pageName) {
    window.scrollTo(0, 0);
    navigate(pageName);
  }

  if (!Page) return <LoginPage onNavigate={movePage} />;

  const pageContent = <Page onNavigate={movePage} />;

  return currentPath.startsWith('/meeting') ? (
    <MeetingLayout currentPath={currentPath}>{pageContent}</MeetingLayout>
  ) : pageContent;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
