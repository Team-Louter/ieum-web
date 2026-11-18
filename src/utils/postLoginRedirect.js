const STORAGE_KEY = 'ieum:postLoginPath';

/** 로그인이 끝난 뒤 돌아올 초대 화면 주소만 기억합니다. 초대 화면(/invite)이 아니면 무시합니다. */
export function rememberInvitePath(pathname, search = '') {
  if (pathname.replace(/\/$/, '') !== '/invite') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, `/invite${search}`);
  } catch {
    // 저장소를 쓸 수 없으면 로그인 후 기본 화면으로 갑니다.
  }
}

/** 기억해 둔 주소를 꺼내고 지웁니다. 없으면 null입니다. */
export function takePostLoginPath() {
  try {
    const path = window.sessionStorage.getItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    // 같은 사이트 안의 초대 화면 주소인지 한 번 더 확인합니다.
    return path && /^\/invite(\?|$)/.test(path) ? path : null;
  } catch {
    return null;
  }
}
