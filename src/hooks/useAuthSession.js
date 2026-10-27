import { useCallback, useEffect, useState } from 'react';
import { AUTH_SESSION_EVENT, getAccessToken, getValidAccessToken } from '../api/client';

// Resolve persisted credentials before mounting a protected page.
export default function useAuthSession() {
  const [session, setSession] = useState({ checking: true, accessToken: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  const setAccessToken = useCallback((token) => {
    setSession({ checking: false, accessToken: token, error: '' });
  }, []);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    let revision = 0;
    function sync() {
      revision += 1;
      if (active) setAccessToken(getAccessToken());
    }
    function onStorage(event) {
      if (event.key === null || event.key === 'ieum.accessToken' || event.key === 'ieum.refreshToken') sync();
    }
    window.addEventListener(AUTH_SESSION_EVENT, sync);
    window.addEventListener('storage', onStorage);
    const startedAt = revision;
    getValidAccessToken().then((token) => {
      if (active && revision === startedAt) setAccessToken(token);
    }).catch(() => {
      if (active && revision === startedAt) setSession({ checking: false, accessToken: null, error: '로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.' });
    });
    return () => {
      active = false;
      window.removeEventListener(AUTH_SESSION_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, [attempt, setAccessToken]);
  return { ...session, setAccessToken, retry };
}
