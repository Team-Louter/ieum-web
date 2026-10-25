import { notificationApi } from '../client';
import { asArray, loadApiOrDemo } from './common';
import { loadChatPage } from './chat';
import { loadAddFriendPage } from './friends';
import { loadGuardianPage, loadSettingsPage } from './guardian';
import { loadMarketDetailPage, loadMarketListPage } from './market';
import { loadMeetingDetailPage, loadMeetingListPage } from './meetings';
import { loadMyProfilePage } from './profile';
import { readDemoValue } from '../demoStore';

// 화면 경로에 맞는 데이터 함수를 찾아 실행합니다.
export default async function loadPageData({
  path,
  selectedId,
  role,
  loginId,
  userId,
  demoScope,
  onDefaultChatRoom,
}) {
  if (path === '/guardian') {
    if (role !== 'ROLE_GUARDIAN') {
      throw new Error('보호자 계정으로 로그인해야 대시보드를 볼 수 있습니다.');
    }
    return loadGuardianPage({ demoScope });
  }

  if (path === '/settings') return loadSettingsPage({ role, demoScope });

  if (path === '/neighbor' || path === '/neighbor/my') {
    const posts = asArray(readDemoValue('neighbor.posts', [], demoScope));
    return {
      posts:
        path === '/neighbor/my'
          ? posts.filter((post) => post.owner === loginId || post.author?.id === loginId)
          : posts,
    };
  }

  if (path.startsWith('/myProfile')) {
    return loadMyProfilePage({ path, demoScope, loginId, userId });
  }

  if (path === '/meeting' || path === '/meeting/my') {
    return loadMeetingListPage({ path, demoScope, loginId });
  }

  if (path === '/meeting/my/detail' && selectedId) {
    return loadMeetingDetailPage({ selectedId, demoScope });
  }

  if (path === '/meeting/management' && selectedId) {
    return loadMeetingDetailPage({ selectedId, demoScope });
  }

  if (path === '/market' || path === '/market/my') {
    return loadMarketListPage({ path, demoScope, loginId, userId });
  }

  if (path === '/market/feedin' && selectedId) {
    return loadMarketDetailPage({ selectedId, demoScope });
  }

  if (path === '/addfriend') return loadAddFriendPage({ demoScope });

  if (path === '/chatting') return loadChatPage({ demoScope, userId, onDefaultChatRoom });

  if (path === '/notifications') {
    const notifications = await loadApiOrDemo(
      () => notificationApi.list(),
      'notifications',
      [],
      demoScope,
    );
    return { notifications: asArray(notifications) };
  }

  return {};
}

export { loadChatMessages } from './chat';
