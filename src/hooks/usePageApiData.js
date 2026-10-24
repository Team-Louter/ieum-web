import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/client';
import loadPageData, { loadChatMessages } from '../api/pageData';
import { publicRoutes } from '../app/routes';

// URL과 로그인 정보를 기준으로 현재 페이지에 필요한 데이터를 불러옵니다.
export default function usePageApiData({
  path,
  selectedId,
  activeChatRoomId,
  accessToken,
  reloadKey,
  onDefaultChatRoom,
}) {
  const [savedResource, setSavedResource] = useState({ path: '', data: {} });
  const [savedError, setSavedError] = useState({ path: '', message: '' });
  const [requestState, setRequestState] = useState({ path: '', loading: false });

  const user = getCurrentUser();
  const demoScope = user.loginId || (user.userId ? String(user.userId) : 'guest');
  const isPublicPage = publicRoutes.includes(path);
  const needsLogin = !isPublicPage && !accessToken;

  // 이전 화면 데이터가 새 화면에 잠깐 나타나지 않도록 경로를 확인합니다.
  const data = savedResource.path === path ? savedResource.data : {};
  const error = needsLogin
    ? 'API 데이터를 불러오려면 먼저 로그인해 주세요.'
    : savedError.path === path
      ? savedError.message
      : '';
  const loading = !needsLogin && (requestState.path !== path || requestState.loading);

  useEffect(() => {
    let isActive = true;

    if (!isPublicPage && !accessToken) {
      return () => { isActive = false; };
    }

    async function loadCurrentPage() {
      setRequestState({ path, loading: true });

      try {
        const nextData = await loadPageData({
          path,
          selectedId,
          role: user.role,
          loginId: user.loginId,
          userId: user.userId,
          demoScope,
          onDefaultChatRoom,
        });

        if (!isActive) return;
        setSavedResource({ path, data: nextData });
        setSavedError({ path, message: '' });
      } catch (loadError) {
        if (!isActive) return;
        setSavedError({
          path,
          message: loadError?.message ?? 'API 요청에 실패했습니다.',
        });
      } finally {
        if (isActive) setRequestState({ path, loading: false });
      }
    }

    loadCurrentPage();
    return () => { isActive = false; };
  }, [path, isPublicPage, selectedId, accessToken, reloadKey, onDefaultChatRoom, user.role, user.userId, user.loginId, demoScope]);

  useEffect(() => {
    let isActive = true;
    const shouldLoadMessages = path === '/chatting' && activeChatRoomId && accessToken;

    if (!shouldLoadMessages) return undefined;

    async function loadMessages() {
      try {
        const messageData = await loadChatMessages({
          roomId: activeChatRoomId,
          demoScope,
          userId: user.userId,
        });

        if (!isActive) return;
        setSavedResource((current) => ({
          path,
          data: {
            ...(current.path === path ? current.data : {}),
            ...messageData,
          },
        }));
      } catch (loadError) {
        if (!isActive) return;
        setSavedError({
          path,
          message: loadError?.message ?? '채팅 기록을 불러오지 못했습니다.',
        });
      }
    }

    loadMessages();
    return () => { isActive = false; };
  }, [path, activeChatRoomId, accessToken, reloadKey, user.userId, demoScope]);

  return { data, error, loading, user };
}
