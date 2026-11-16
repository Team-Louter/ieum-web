import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useState } from 'react';
import { chatApi, getValidAccessToken } from '../api/client';

const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'wss://api.ieum.louter.site/ws/chat';
const POLL_INTERVAL_MS = 45_000;

export default function useChatUnreadCount({ accessToken, currentUserId, isChatPage }) {
  const [unreadState, setUnreadState] = useState({ token: null, count: 0 });

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      let page = 0;
      let count = 0;
      let hasNext = true;
      while (hasNext) {
        const response = await chatApi.rooms(page, 100);
        const rooms = Array.isArray(response) ? response : (response?.rooms ?? []);
        count += rooms.reduce(
          (total, room) => total + Math.max(Number(room.unreadCount) || 0, 0),
          0,
        );
        hasNext = Boolean(response?.hasNext);
        page += 1;
      }
      setUnreadState({ token: accessToken, count });
    } catch {
      // 일시적인 요청 실패 때는 마지막으로 확인한 숫자를 유지합니다.
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return undefined;
    const firstLoadId = window.setTimeout(refreshUnreadCount, 0);
    const timerId = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    window.addEventListener('focus', refreshUnreadCount);
    return () => {
      window.clearTimeout(firstLoadId);
      window.clearInterval(timerId);
      window.removeEventListener('focus', refreshUnreadCount);
    };
  }, [accessToken, refreshUnreadCount]);

  // 채팅 화면 밖에서도 새 메시지를 받으면 사이드바 숫자를 갱신합니다.
  useEffect(() => {
    if (!accessToken || isChatPage) return undefined;

    const client = new Client({
      brokerURL: CHAT_WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      beforeConnect: async () => {
        const token = await getValidAccessToken();
        if (!token) throw new Error('채팅 인증 토큰을 확인할 수 없습니다.');
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      },
      onConnect: () => {
        void refreshUnreadCount();
        client.subscribe('/user/queue/chat', (frame) => {
          try {
            const message = JSON.parse(frame.body);
            if (Number(message.senderId) === Number(currentUserId)) return;
            setUnreadState((current) => ({
              token: accessToken,
              count: (current.token === accessToken ? current.count : 0) + 1,
            }));
            void refreshUnreadCount();
          } catch {
            // 잘못된 메시지는 숫자에 반영하지 않습니다.
          }
        });
      },
    });
    client.activate();
    return () => { void client.deactivate(); };
  }, [accessToken, currentUserId, isChatPage, refreshUnreadCount]);

  return {
    unreadCount: unreadState.token === accessToken ? unreadState.count : 0,
    refreshUnreadCount,
  };
}
