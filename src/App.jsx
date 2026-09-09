import ProfilePage from './pages/Profile/ProfilePage';
import NeighborCreatePostPage from './pages/Neighbor/NeighborCreatePostPage';
import NeighborFeedPage from './pages/Neighbor/NeighborFeedPage';
import NeighborMyPostsPage from './pages/Neighbor/NeighborMyPostsPage';

const neighborPages = {
  '/neighbor': NeighborFeedPage,
  '/neighbor/my': NeighborMyPostsPage,
  '/neighbor/create': NeighborCreatePostPage,
};

/** 현재 주소에 해당하는 화면을 렌더링합니다. */
function App() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const Page = neighborPages[currentPath] ?? ProfilePage;

  return <Page />;
}

export default App;
