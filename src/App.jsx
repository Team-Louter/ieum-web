import { useState } from 'react';
import LoginPage from './pages/Loginpage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';
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

/** 로그인 이후 기본 커뮤니티 화면으로 내 프로필을 표시합니다. */
function CommunityPage() {
  return <MyProfilePageContent />;
}

/** 로그인 상태와 URL 기반 서비스 화면을 함께 표시합니다. */
function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const Page = pageRoutes[currentPath];

  if (Page) {
    return <Page />;
  }

  if (currentPage === 'community') {
    return <CommunityPage />;
  }

  if (currentPage === 'signup-user') {
    return <SignupPage accountType="user" onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'signup-guardian') {
    return <SignupPage accountType="guardian" onNavigate={setCurrentPage} />;
  }

  return <LoginPage onNavigate={setCurrentPage} />;
}

export default App;
