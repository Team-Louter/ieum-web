import { communityPostApi } from '../client';
import { toCommunityPost } from '../adapters';
import { asArray } from './common';
import { loadChatPage } from './chat';
import { loadAddFriendPage } from './friends';
import { loadGuardianPage, loadMedicationPage, loadSettingsPage } from './guardian';
import { loadMarketDetailPage, loadMarketListPage } from './market';
import { loadMeetingDetailPage, loadMeetingListPage } from './meetings';
import { loadMyProfilePage, loadUserProfilePage } from './profile';

// 화면 경로에 맞는 데이터 함수를 찾아 실행합니다.
export default async function loadPageData({
  path,
  selectedId,
  role,
  loginId,
  userId,
  onDefaultChatRoom,
}) {
  if (path === '/guardian') {
    if (role !== 'ROLE_GUARDIAN') {
      throw new Error('보호자 계정으로 로그인해야 대시보드를 볼 수 있습니다.');
    }
    return loadGuardianPage();
  }

  if (path === '/settings') return loadSettingsPage({ role });
  // 알림 화면은 목록을 직접 불러오고, 어르신 계정에는 오늘 복약 목록도 함께 보여줍니다.
  if (path === '/notifications') return role === 'ROLE_SENIOR' ? loadMedicationPage() : {};

  if (path === '/neighbor' || path === '/neighbor/my') {
    const response = await communityPostApi.list({ mine: path === '/neighbor/my' });
    const apiPosts = Array.isArray(response)
      ? response
      : (response?.posts ?? response?.content ?? []);
    const posts = asArray(apiPosts).map(toCommunityPost);
    return {
      posts,
      postsHasNext: Boolean(response?.hasNext),
    };
  }

  if (path.startsWith('/profile')) {
    return loadUserProfilePage({ selectedId });
  }

  if (path.startsWith('/myProfile')) {
    return loadMyProfilePage({ loginId, userId });
  }

  if (path === '/meeting' || path === '/meeting/my') {
    return loadMeetingListPage({ path });
  }

  if (
    (path === '/meeting/detail' || path === '/meeting/my/detail' || path === '/meeting/my/member-list') &&
    selectedId
  ) {
    return loadMeetingDetailPage({ selectedId });
  }

  if (path === '/meeting/management' && selectedId) {
    return loadMeetingDetailPage({ selectedId });
  }

  if (path === '/market' || path === '/market/my') {
    return loadMarketListPage({ path, loginId, userId });
  }

  if (path === '/market/feedin' && selectedId) {
    return loadMarketDetailPage({ selectedId });
  }

  if (path === '/addfriend' || path.startsWith('/addfriend/')) return loadAddFriendPage();

  if (path === '/chatting') return loadChatPage({ userId, onDefaultChatRoom });

  return {};
}

export { loadChatMessages } from './chat';
