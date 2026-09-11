import MyProfilePageContent from './pages/MyProfile/MyProfilePageContent';
import MyProfilePageFriend from './pages/MyProfile/MyProfilePageFriend';
import MyProfilePageMeeting from './pages/MyProfile/MyProfilePageMeeting';
import FriendLocationPage from './pages/FriendLocation/FriendLocationPage';
import NeighborCreatePostPage from './pages/Neighbor/NeighborCreatePostPage';
import NeighborFeedPage from './pages/Neighbor/NeighborFeedPage';
import NeighborMyPostsPage from './pages/Neighbor/NeighborMyPostsPage';

const pageRoutes = {
  '/': MyProfilePageContent,
  '/profile': MyProfilePageContent,
  '/profile/meetings': MyProfilePageMeeting,
  '/profile/friends': MyProfilePageFriend,
  '/friends/location': FriendLocationPage,
  '/neighbor': NeighborFeedPage,
  '/neighbor/my': NeighborMyPostsPage,
  '/neighbor/create': NeighborCreatePostPage,
};

/** 현재 주소에 해당하는 화면을 렌더링합니다. */
function App() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const Page = pageRoutes[currentPath] ?? MyProfilePageContent;

  return <Page />;
}

export default App;
