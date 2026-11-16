import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi } from '../api/client';

const PAGE_LIMIT = 50;
const POLL_INTERVAL_MS = 10_000;
const EMPTY_NOTIFICATIONS = [];

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
 * 탭이 보이는 동안 10초마다 limit=50으로 다시 조회하고, notificationId로 중복 표시를 막습니다.
 * 더 보기는 마지막 ID를 beforeId로 보냅니다.
 */
export default function useNotifications({ enabled = true, sessionKey = '' } = {}) {
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [loadedSessionKey, setLoadedSessionKey] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(!enabled);
  const hasLoadedRef = useRef(false);
  const lastSessionKeyRef = useRef(sessionKey);
  const notifications = enabled && loadedSessionKey === sessionKey
    ? savedNotifications
    : EMPTY_NOTIFICATIONS;

  useEffect(() => {
    if (lastSessionKeyRef.current !== sessionKey) {
      hasLoadedRef.current = false;
      lastSessionKeyRef.current = sessionKey;
    }
    if (!enabled) {
      hasLoadedRef.current = false;
      return undefined;
    }
    let isActive = true;

    async function load() {
      const isFirst = !hasLoadedRef.current;
      if (isFirst) setIsLoading(true);
      try {
        const response = await notificationApi.list({ limit: PAGE_LIMIT });
        if (!isActive) return;
        hasLoadedRef.current = true;
        setSavedNotifications((current) =>
          isFirst ? getItems(response) : mergeNotifications(current, getItems(response)),
        );
        setLoadedSessionKey(sessionKey);
        setError('');
      } catch (loadError) {
        if (isActive) setError(loadError?.message ?? '알림을 불러오지 못했습니다.');
      } finally {
        if (isActive && isFirst) {
          setIsLoading(false);
          setIsReady(true);
        }
      }
    }

    load();
    // 탭이 가려져 있을 때는 조회하지 않고, 다시 보이는 순간 한 번 바로 조회합니다.
    const timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_INTERVAL_MS);
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') load();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isActive = false;
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, sessionKey]);

  const markRead = useCallback(async (notificationId) => {
    await notificationApi.markRead(notificationId);
    setSavedNotifications((current) =>
      current.map((item) =>
        String(item.notificationId) === String(notificationId) ? { ...item, read: true } : item,
      ),
    );
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setSavedNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const remove = useCallback(async (notificationId) => {
    await notificationApi.remove(notificationId);
    setSavedNotifications((current) =>
      current.filter((item) => String(item.notificationId) !== String(notificationId)),
    );
  }, []);

  const removeAll = useCallback(async () => {
    await notificationApi.removeAll();
    setSavedNotifications([]);
  }, []);

  const loadOlder = useCallback(async () => {
    const lastId = notifications[notifications.length - 1]?.notificationId;
    if (lastId == null) return;
    const response = await notificationApi.list({ limit: PAGE_LIMIT, beforeId: lastId });
    setSavedNotifications((current) => [
      ...current,
      ...mergeNotifications(current, getItems(response)).filter(
        (item) => !current.some((c) => String(c.notificationId) === String(item.notificationId)),
      ),
    ]);
  }, [notifications]);

  return {
    notifications,
    error,
    isLoading,
    isReady,
    markRead,
    markAllRead,
    remove,
    removeAll,
    loadOlder,
  };
}
