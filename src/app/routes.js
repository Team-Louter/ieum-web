import AddFriendPage from '../pages/AddFriend/AddFriendPage';
import ChattingPage from '../pages/Chatting/ChattingPage';
import FriendLocationPage from '../pages/FriendLocation/FriendLocationPage';
import InvitePage from '../pages/Invite/InvitePage';
import NotificationsPage from '../pages/Notifications/NotificationsPage';
import GuardianPage from '../pages/Guardian/GuardianPage';
import LoginPage from '../pages/LoginPage/LoginPage';
import MarketFeedInPage from '../pages/market/MarketFeedInPage';
import MarketFeedPage from '../pages/market/MarketFeedPage';
import MarketMyPostPage from '../pages/market/MarketMyPostPage';
import MarketPostCreatePage from '../pages/market/MarketPostCreatePage';
import MeetingAnnouncementCreatePage from '../pages/Meeting/MeetingAnnouncementCreatePage/MeetingAnnouncementCreatePage';
import MeetingCreatePage from '../pages/Meeting/MeetingCreatePage/MeetingCreatePage';
import MeetingManagementPage from '../pages/Meeting/MeetingManagementPage/MeetingManagementPage';
import MeetingMemberListPage from '../pages/Meeting/MeetingMemberListPage/MeetingMemberListPage';
import MeetingMyListPage from '../pages/Meeting/MeetingMyListPage/MeetingMyListPage';
import MeetingMyPage from '../pages/Meeting/MeetingMyPage/MeetingMyPage';
import MeetingShowPage from '../pages/Meeting/MeetingShowPage/MeetingShowPage';
import MyProfilePageContent from '../pages/MyProfile/MyProfilePageContent';
import MyProfilePageFriend from '../pages/MyProfile/MyProfilePageFriend';
import MyProfilePageMeeting from '../pages/MyProfile/MyProfilePageMeeting';
import NeighborCreatePostPage from '../pages/Neighbor/NeighborCreatePostPage';
import NeighborFeedPage from '../pages/Neighbor/NeighborFeedPage';
import NeighborMyPostsPage from '../pages/Neighbor/NeighborMyPostsPage';
import ProfilePageContent from '../pages/Profile/ProfilePageContent';
import ProfilePageFriend from '../pages/Profile/ProfilePageFriend';
import ProfilePageMeeting from '../pages/Profile/ProfilePageMeeting';
import SettingsPage from '../pages/setting/SettingsPage/SettingsPage';
import GuardianSignupPage from '../pages/SignupPage/GuardianSignupPage';
import UserSignupPage from '../pages/SignupPage/UserSignupPage';

// URL 경로와 실제로 보여줄 페이지를 연결합니다.
export const pageRoutes = {
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
  '/guardian': GuardianPage,
  '/notifications': NotificationsPage,
  '/invite': InvitePage,
  '/meeting': MeetingShowPage,
  '/meeting/detail': MeetingMyPage,
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

export const publicRoutes = ['/login', '/signup/user', '/signup/guardian'];

// 상세 페이지의 숫자 ID는 페이지 종류와 분리해 usePageApiData에 전달합니다.
export function getRouteKey(path) {
  if (/^\/meeting\/detail\/\d+$/.test(path)) return '/meeting/detail';
  if (/^\/market\/feedin\/\d+$/.test(path)) return '/market/feedin';
  if (/^\/meeting\/my\/detail\/\d+$/.test(path)) return '/meeting/my/detail';
  if (/^\/meeting\/my\/member-list\/\d+$/.test(path)) return '/meeting/my/member-list';
  if (/^\/meeting\/management\/\d+$/.test(path)) return '/meeting/management';
  return path;
}

export function getRouteId(path) {
  const match = path.match(
    /^\/(?:market\/feedin|meeting\/detail|meeting\/my\/detail|meeting\/my\/member-list|meeting\/management)\/(\d+)$/,
  );
  return match ? Number(match[1]) : null;
}
