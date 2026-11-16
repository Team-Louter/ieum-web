import { useEffect, useState } from 'react';
import { getCurrentUser } from '../api/client';
import loadPageData, { loadChatMessages } from '../api/pageData';
import { publicRoutes } from '../app/routes';

// 한 번 불러온 화면 데이터를 기억해 두었다가, 같은 화면에 다시 들어오면 바로 보여주고 뒤에서 새로 받아옵니다.
const pageCache = new Map();
const MAX_CACHED_PAGES = 30;
// 채팅은 방마다 내용이 달라 기억해 둔 데이터를 쓰지 않습니다.
const uncachedPaths = ['/chatting'];

function readCache(key) {
  return pageCache.get(key);
}

function writeCache(key, path, data) {
  if (uncachedPaths.includes(path)) return;
  pageCache.delete(key);
  pageCache.set(key, data);
  if (pageCache.size > MAX_CACHED_PAGES) pageCache.delete(pageCache.keys().next().value);
}

// URL과 로그인 정보를 기준으로 현재 페이지에 필요한 데이터를 불러옵니다.
export default function usePageApiData({
  path,
  selectedId,
  activeChatRoomId,
  accessToken,
  reloadKey,
  onDefaultChatRoom,
}) {
  const [savedResource, setSavedResource] = useState({ key: '', data: {} });
  const [savedError, setSavedError] = useState({ path: '', message: '' });
  const [requestState, setRequestState] = useState({ path: '', loading: false });

  const user = getCurrentUser();
  // 같은 주소라도 사용자나 상세 번호가 다르면 다른 데이터입니다.
  const resourceKey = `${user.userId ?? ''}|${path}|${selectedId ?? ''}`;
  const cachedData = readCache(resourceKey);
  const isPublicPage = publicRoutes.includes(path);
  const needsLogin = !isPublicPage && !accessToken;

  // 이전 화면 데이터가 새 화면에 잠깐 나타나지 않도록 경로를 확인합니다.
  const data = savedResource.key === resourceKey ? savedResource.data : (cachedData ?? {});
  const error = needsLogin
    ? 'API 데이터를 불러오려면 먼저 로그인해 주세요.'
    : savedError.path === path
      ? savedError.message
      : '';
  const loading = !needsLogin && (requestState.path !== path || requestState.loading);
  // 같은 화면의 새로고침이 아니라 이 경로의 데이터를 처음 불러오는 중인지 알려줍니다.
  const initialLoading = loading && savedResource.key !== resourceKey && !cachedData;

  useEffect(() => {
    let isActive = true;

    if (!isPublicPage && !accessToken) {
      // 로그아웃하면 기억해 둔 화면 데이터를 모두 지웁니다.
      pageCache.clear();
      return () => {
        isActive = false;
      };
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
          onDefaultChatRoom,
        });

        if (!isActive) return;
        setSavedResource((current) => {
          const merged = {
            ...(current.key === resourceKey ? current.data : (readCache(resourceKey) ?? {})),
            ...nextData,
          };
          writeCache(resourceKey, path, merged);
          return { key: resourceKey, data: merged };
        });
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
    return () => {
      isActive = false;
    };
  }, [
    path,
    resourceKey,
    isPublicPage,
    selectedId,
    accessToken,
    reloadKey,
    onDefaultChatRoom,
    user.role,
    user.userId,
    user.loginId,
  ]);

  useEffect(() => {
    let isActive = true;
    const shouldLoadMessages = path === '/chatting' && activeChatRoomId && accessToken;

    if (!shouldLoadMessages) return undefined;

    async function loadMessages() {
      try {
        const messageData = await loadChatMessages({
          roomId: activeChatRoomId,
          userId: user.userId,
        });

        if (!isActive) return;
        setSavedResource((current) => ({
          key: resourceKey,
          data: {
            ...(current.key === resourceKey ? current.data : {}),
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
    return () => {
      isActive = false;
    };
  }, [path, resourceKey, activeChatRoomId, accessToken, reloadKey, user.userId]);

  return { data, error, loading, initialLoading, user };
}
