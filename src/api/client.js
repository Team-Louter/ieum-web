const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ieum.louter.site';
const ACCESS_TOKEN_KEY = 'ieum.accessToken';
const REFRESH_TOKEN_KEY = 'ieum.refreshToken';

let refreshPromise;
export const AUTH_SESSION_EVENT = 'ieum:auth-session-change';

function notifySessionChange() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function serializeBody(body) {
  return isFormData(body) ? body : JSON.stringify(body);
}

// request(JSON) + 파일 한 장은 file, 여러 장(게시물·나눔은 최대 5장)은 images를 반복해 보냅니다.
function makeRequestWithFile(request, files) {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('images', file));
  } else {
    formData.append('file', files);
  }
  return formData;
}

/** API에서 내려주는 이미지 경로를 브라우저에서 열 수 있는 URL로 바꿉니다. */
export function resolveApiAssetUrl(imageUrl) {
  if (!imageUrl) return '';

  try {
    const apiUrl = new URL(API_BASE_URL, window.location.href);
    const assetUrl = new URL(imageUrl, apiUrl);
    if (
      assetUrl.hostname === apiUrl.hostname &&
      assetUrl.protocol === 'http:' &&
      window.location.protocol === 'https:'
    ) {
      assetUrl.protocol = 'https:';
    }
    return assetUrl.href;
  } catch {
    return imageUrl;
  }
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveTokens(tokens) {
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('로그인 응답에 토큰이 없습니다.');
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  notifySessionChange();
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifySessionChange();
}

function getRefreshToken() {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function readTokenClaims(token = getAccessToken()) {
  try {
    const encodedPayload = token?.split('.')[1];
    if (!encodedPayload) return {};
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = window.atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

export function getCurrentUser() {
  const claims = readTokenClaims();
  return {
    loginId: claims.sub ?? '',
    userId: Number.isFinite(Number(claims.id)) ? Number(claims.id) : null,
    role: claims.role ?? '',
    email: claims.email ?? claims.emailAddress ?? '',
  };
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = await parseResponse(response);
    if (getRefreshToken() !== refreshToken) return getAccessToken();
    if (!response.ok) {
      if ([400, 401, 403].includes(response.status)) {
        clearTokens();
        return null;
      }
      throw new ApiError(
        '로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.',
        response.status,
        null,
      );
    }
    if (!payload?.accessToken) {
      clearTokens();
      return null;
    }
    saveTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken ?? refreshToken,
    });
    return payload.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function getValidAccessToken() {
  const token = getAccessToken();
  const claims = readTokenClaims(token);
  const expiresAt = Number(claims.exp) * 1000;
  if (token && claims.sub && Number.isFinite(expiresAt) && expiresAt > Date.now() + 60_000)
    return token;
  if (getRefreshToken()) return refreshAccessToken();
  if (token) clearTokens();
  return null;
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retryAuth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers ?? {});
  const hasBody = requestOptions.body !== undefined && requestOptions.body !== null;
  if (hasBody && !isFormData(requestOptions.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  // 요청 전에 만료가 가까운 토큰은 새 토큰으로 바꿉니다.
  const accessToken = auth ? await getValidAccessToken() : null;
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  let response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
  if (response.status === 401 && auth && retryAuth) {
    // 리프레시 토큰이 없으면 복구할 방법이 없으므로 남은 액세스 토큰을 지웁니다.
    // 세션 이벤트로 앱이 로그인 화면으로 이동합니다.
    if (!getRefreshToken()) clearTokens();
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      headers.set('Authorization', `Bearer ${nextToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
    }
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : (payload?.message ?? `요청에 실패했습니다. (${response.status})`);
    throw new ApiError(message, response.status, payload);
  }
  return payload;
}

export const apiGet = (path, options) => apiRequest(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: 'POST',
    ...(body === undefined ? {} : { body: serializeBody(body) }),
  });
export const apiPatch = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: 'PATCH',
    ...(body === undefined ? {} : { body: serializeBody(body) }),
  });
export const apiPut = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: 'PUT',
    ...(body === undefined ? {} : { body: serializeBody(body) }),
  });
export const apiDelete = (path, options) => apiRequest(path, { ...options, method: 'DELETE' });

export const authApi = {
  sendEmailCode: (email, recovery = false) =>
    apiPost(`/api/auth/email/${recovery ? 'recovery' : 'send'}`, { email }, { auth: false }),
  // 응답의 verificationToken(5분 유효, 1회 사용)을 가입·비밀번호 재설정·아이디 찾기에 함께 보냅니다.
  verifyEmailCode: (email, code) =>
    apiPost('/api/auth/email/verify', { email, code }, { auth: false }),
  signup: (data) => apiPost('/api/auth/signup', data, { auth: false }),
  login: (loginId, password) => apiPost('/api/auth/login', { loginId, password }, { auth: false }),
  findLoginId: (email, verificationToken) =>
    apiPost('/api/auth/loginId/find', { email, verificationToken }, { auth: false }),
  resetPassword: (email, newPassword, verificationToken) =>
    apiPost('/api/auth/password/reset', { email, newPassword, verificationToken }, { auth: false }),
};

export const profileApi = {
  get: () => apiGet('/api/profile'),
  getByUserId: (userId) => apiGet(`/api/profile/${encodeURIComponent(String(userId))}`),
  update: (profile, profileImage) => {
    if (!profileImage) return apiPatch('/api/profile', profile);

    const formData = new FormData();
    formData.append('file', profileImage);
    if (profile.nickname != null) formData.append('nickname', profile.nickname);
    if (profile.bio != null) formData.append('bio', profile.bio);
    return apiPatch('/api/profile', formData);
  },
};

export const familyApi = {
  list: () => apiGet('/api/connect'),
  connect: (guardianEmail) => apiPost('/api/connect', { guardianEmail }),
  disconnect: (loginId) => apiDelete(`/api/connect/${encodeURIComponent(loginId)}`),
};

// 어르신이 보낸 보호자 연결 요청을 관리합니다.
export const connectionApi = {
  list: () => apiGet('/api/connections'),
  pending: () => apiGet('/api/connections/pending'),
  // 보호자 계정이 어르신 이메일로 연결을 요청합니다. (ROLE_GUARDIAN, seniorEmail)
  requestSenior: (seniorEmail) => apiPost('/api/connections/request', { seniorEmail }),
  requestGuardian: (guardianEmail) => apiPost('/api/connections/request', { guardianEmail }),
  accept: (connectionId) =>
    apiPatch(`/api/connections/${encodeURIComponent(String(connectionId))}/accept`),
  remove: (connectionId) =>
    apiDelete(`/api/connections/${encodeURIComponent(String(connectionId))}`),
};

export const medicationApi = {
  list: () => apiGet('/api/medications'),
  create: (medication) => apiPost('/api/medications', medication),
  remove: (medicationId) => apiDelete(`/api/medications/${medicationId}`),
  check: (medicationId) => apiPost(`/api/medications/${medicationId}/check`),
};

export const guardianApi = { dashboard: () => apiGet('/api/dashboard') };
export const notificationApi = {
  // 첫 조회는 { limit: 50 }, 폴링은 { unreadOnly: true, limit: 50 },
  // 이전 알림 더 보기는 마지막 notificationId를 beforeId로 넘깁니다.
  list: ({ limit, unreadOnly, beforeId } = {}) => {
    const query = new URLSearchParams();
    if (limit != null) query.set('limit', String(limit));
    if (unreadOnly) query.set('unreadOnly', 'true');
    if (beforeId != null) query.set('beforeId', String(beforeId));
    const queryString = query.toString();
    return apiGet(`/api/notifications${queryString ? `?${queryString}` : ''}`);
  },
  markRead: (notificationId) =>
    apiPatch(`/api/notifications/${encodeURIComponent(String(notificationId))}/read`),
  getSettings: () => apiGet('/api/settings/notifications'),
  updateSettings: (settings) => apiPatch('/api/settings/notifications', settings),
};

export const friendApi = {
  list: () => apiGet('/api/friends'),
  received: () => apiGet('/api/friends/requests/received'),
  request: (targetId) => apiPost(`/api/friends/requests/${encodeURIComponent(targetId)}`),
  accept: (friendshipId) => apiPost(`/api/friends/requests/${friendshipId}/accept`),
  remove: (friendshipId) => apiDelete(`/api/friends/${friendshipId}`),
};

export const locationApi = {
  report: (latitude, longitude) => apiPost('/api/location', { latitude, longitude }),
  stop: () => apiDelete('/api/location'),
  friends: () => apiGet('/api/friends/locations'),
  getSharing: () => apiGet('/api/settings/location-sharing'),
  setSharing: (enabled) => apiPatch('/api/settings/location-sharing', { enabled }),
};

export const userApi = {
  search: (loginId, page = 0, size = 20) => {
    const params = new URLSearchParams({ loginId, page: String(page), size: String(size) });
    return apiGet(`/api/users/search?${params.toString()}`);
  },
  removeCurrent: () => apiDelete('/api/users/me'),
};

export const meetingApi = {
  list: () => apiGet('/api/community/meetings'),
  mine: (includePending = false) =>
    apiGet(`/api/community/meetings/my${includePending ? '?includePending=true' : ''}`),
  // 비공개 모임은 가입 완료 회원이거나 유효한 초대 코드(inviteCode)가 있어야 볼 수 있습니다.
  get: (id, inviteCode) =>
    apiGet(
      `/api/community/meetings/${id}${inviteCode ? `?inviteCode=${encodeURIComponent(inviteCode)}` : ''}`,
    ),
  create: (meeting, imageFile) =>
    apiPost(
      '/api/community/meetings',
      imageFile ? makeRequestWithFile(meeting, imageFile) : meeting,
    ),
  update: (id, meeting, imageFile) =>
    apiPut(
      `/api/community/meetings/${id}`,
      imageFile ? makeRequestWithFile(meeting, imageFile) : meeting,
    ),
  remove: (id) => apiDelete(`/api/community/meetings/${id}`),
  membership: (id) => apiGet(`/api/community/meetings/${id}/membership`),
  members: (id) => apiGet(`/api/community/meetings/${id}/members`),
  join: (id) => apiPost(`/api/community/meetings/${id}/join`),
  approveMember: (id, userId) => apiPost(`/api/community/meetings/${id}/members/${userId}/approve`),
  updateMemberRole: (id, userId, role) =>
    apiPatch(`/api/community/meetings/${id}/members/${userId}/role`, { role }),
  removeMember: (id, userId) => apiDelete(`/api/community/meetings/${id}/members/${userId}`),
  leave: (id) => apiDelete(`/api/community/meetings/${id}/members/me`),
  // 모임장·관리자가 7일 동안 유효한 초대 코드를 만듭니다. (code, url, expiresAt)
  createInvite: (id) => apiPost(`/api/community/meetings/${id}/invites`),
  // 현재 모임장만 쓸 수 있고, 대상은 가입 완료 회원이어야 합니다.
  transferOwner: (id, userId) => apiPost(`/api/community/meetings/${id}/transfer-owner`, { userId }),
  notices: (id, page = 0, size = 20) =>
    apiGet(`/api/community/meetings/${id}/notices?page=${page}&size=${size}`),
  getNotice: (id, noticeId) => apiGet(`/api/community/meetings/${id}/notices/${noticeId}`),
  createNotice: (id, notice) => apiPost(`/api/community/meetings/${id}/notices`, notice),
  updateNotice: (id, noticeId, notice) =>
    apiPut(`/api/community/meetings/${id}/notices/${noticeId}`, notice),
  removeNotice: (id, noticeId) => apiDelete(`/api/community/meetings/${id}/notices/${noticeId}`),
  getLike: (id) => apiGet(`/api/contents/MEETING/${id}/like`),
  like: (id) => apiPut(`/api/contents/MEETING/${id}/like`),
  unlike: (id) => apiDelete(`/api/contents/MEETING/${id}/like`),
};

// 초대 코드로 모임 정보를 확인하고 가입합니다. (승인제 모임은 PENDING, 그 외는 JOINED)
export const inviteApi = {
  get: (code) => apiGet(`/api/community/invites/${encodeURIComponent(code)}`),
  join: (code) => apiPost(`/api/community/invites/${encodeURIComponent(code)}/join`),
};

// 모임·게시물 등 종류별 좋아요를 한 곳에서 다룹니다. (/api/contents/{type}/{targetId}/like)
export const contentLikeApi = {
  get: (type, targetId) => apiGet(`/api/contents/${type}/${targetId}/like`),
  like: (type, targetId) => apiPut(`/api/contents/${type}/${targetId}/like`),
  unlike: (type, targetId) => apiDelete(`/api/contents/${type}/${targetId}/like`),
};

export const communityPostApi = {
  list: ({ mine = false, authorId, page = 0, size = 20 } = {}) => {
    const query = new URLSearchParams();
    if (mine) query.set('mine', 'true');
    else {
      query.set('page', String(page));
      query.set('size', String(size));
    }
    if (authorId != null) query.set('authorId', String(authorId));
    return apiGet(`/api/community/posts?${query}`);
  },
  get: (id) => apiGet(`/api/community/posts/${id}`),
  create: (post, imageFile) =>
    apiPost('/api/community/posts', imageFile ? makeRequestWithFile(post, imageFile) : post),
  update: (id, post, imageFiles) =>
    apiPut(
      `/api/community/posts/${id}`,
      imageFiles?.length ? makeRequestWithFile(post, imageFiles) : post,
    ),
  remove: (id) => apiDelete(`/api/community/posts/${id}`),
  like: (id) => apiPut(`/api/community/posts/${id}/like`),
  unlike: (id) => apiDelete(`/api/community/posts/${id}/like`),
  createComment: (id, comment) => apiPost(`/api/community/posts/${id}/comments`, comment),
  // 댓글 수정·삭제는 댓글 작성자만 할 수 있습니다. (내용 1~2000자)
  updateComment: (id, commentId, comment) =>
    apiPatch(`/api/community/posts/${id}/comments/${commentId}`, comment),
  removeComment: (id, commentId) =>
    apiDelete(`/api/community/posts/${id}/comments/${commentId}`),
};

export const sharingApi = {
  list: () => apiGet('/api/community/sharings'),
  get: (id) => apiGet(`/api/community/sharings/${id}`),
  create: (sharing, imageFile) =>
    apiPost(
      '/api/community/sharings',
      imageFile ? makeRequestWithFile(sharing, imageFile) : sharing,
    ),
  update: (id, sharing, imageFile) =>
    apiPut(
      `/api/community/sharings/${id}`,
      imageFile ? makeRequestWithFile(sharing, imageFile) : sharing,
    ),
  remove: (id) => apiDelete(`/api/community/sharings/${id}`),
  complete: (id) => apiPatch(`/api/community/sharings/${id}/complete`),
};

export const chatApi = {
  rooms: (page = 0, size = 20) => apiGet(`/api/chat/rooms?page=${page}&size=${size}`),
  createRoom: (targetUserId) => apiPost('/api/chat/rooms', { targetUserId }),
  messages: (roomId, beforeId, size = 50) => {
    const query = new URLSearchParams({ size: String(size) });
    if (beforeId != null) query.set('beforeId', String(beforeId));
    return apiGet(`/api/chat/rooms/${roomId}/messages?${query}`);
  },
  sendMessage: (roomId, content) => apiPost(`/api/chat/rooms/${roomId}/messages`, { content }),
};
