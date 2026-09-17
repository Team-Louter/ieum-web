import { useState } from 'react';
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
};

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
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

export default App;
