import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/client';

const PAGE_LIMIT = 50;
const POLL_INTERVAL_MS = 45_000;

function getItems(response) {
  if (Array.isArray(response)) return response;
  return response?.notifications ?? response?.content ?? response?.data ?? [];
}

// notificationId가 같은 알림은 한 번만 남깁니다. (새 알림이 앞쪽에 오도록 합친 뒤 중복 제거)
function mergeNotifications(current, incoming) {
  const seen = new Set();
  return [...incoming, ...current].filter((item) => {
    const id = String(item.notificationId);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/**
 * 알림 목록을 불러옵니다.
 * 첫 조회는 limit=50, 이후 폴링은 unreadOnly=true&limit=50, 더 보기는 마지막 ID를 beforeId로 보냅니다.
 */
export default function useNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let isActive = true;

    async function load() {
      const isFirst = !hasLoadedRef.current;
      if (isFirst) setIsLoading(true);
      try {
        const response = await notificationApi.list(
          isFirst ? { limit: PAGE_LIMIT } : { unreadOnly: true, limit: PAGE_LIMIT },
        );
        if (!isActive) return;
        hasLoadedRef.current = true;
        setNotifications((current) => mergeNotifications(current, getItems(response)));
        setError('');
      } catch (loadError) {
        if (isActive) setError(loadError?.message ?? '알림을 불러오지 못했습니다.');
      } finally {
        if (isActive && isFirst) setIsLoading(false);
      }
    }

    load();
    const timerId = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      isActive = false;
      window.clearInterval(timerId);
    };
  }, [enabled]);

  const markRead = useCallback(async (notificationId) => {
    await notificationApi.markRead(notificationId);
    setNotifications((current) =>
      current.map((item) =>
        String(item.notificationId) === String(notificationId) ? { ...item, read: true } : item,
      ),
    );
  }, []);

  const loadOlder = useCallback(async () => {
    const lastId = notifications[notifications.length - 1]?.notificationId;
    if (lastId == null) return;
    const response = await notificationApi.list({ limit: PAGE_LIMIT, beforeId: lastId });
    setNotifications((current) => [
      ...current,
      ...mergeNotifications(current, getItems(response)).filter(
        (item) => !current.some((c) => String(c.notificationId) === String(item.notificationId)),
      ),
    ]);
  }, [notifications]);

  return { notifications, error, isLoading, markRead, loadOlder };
}
