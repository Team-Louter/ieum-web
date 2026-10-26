const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ieum.louter.site';
const ACCESS_TOKEN_KEY = 'ieum.accessToken';
const REFRESH_TOKEN_KEY = 'ieum.refreshToken';

let refreshPromise;

function isFormData(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function serializeBody(body) {
  return isFormData(body) ? body : JSON.stringify(body);
}

function makeRequestWithFile(request, file) {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
  formData.append('file', file);
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
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const payload = await parseResponse(response);
    if (!response.ok || !payload?.accessToken) {
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
  if (!token) return null;
  const expiresAt = Number(readTokenClaims(token).exp) * 1000;
  if (!expiresAt || expiresAt > Date.now() + 60_000) return token;
  return (await refreshAccessToken()) ?? null;
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retryAuth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers ?? {});
  const hasBody = requestOptions.body !== undefined && requestOptions.body !== null;
  if (hasBody && !isFormData(requestOptions.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (auth && getAccessToken()) headers.set('Authorization', `Bearer ${getAccessToken()}`);

  let response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers });
  if ((response.status === 401 || response.status === 403) && auth && retryAuth) {
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
  verifyEmailCode: (email, code) =>
    apiPost('/api/auth/email/verify', { email, code }, { auth: false }),
  signup: (data) => apiPost('/api/auth/signup', data, { auth: false }),
  login: (loginId, password) => apiPost('/api/auth/login', { loginId, password }, { auth: false }),
  findLoginId: (email) => apiPost('/api/auth/loginId/find', { email }, { auth: false }),
  resetPassword: (email, newPassword) =>
    apiPost('/api/auth/password/reset', { email, newPassword }, { auth: false }),
};

export const profileApi = {
  get: () => apiGet('/api/profile'),
  update: (profile, profileImage) => {
    if (!profileImage) return apiPatch('/api/profile', profile);

    const query = new URLSearchParams();
    if (profile.nickname != null) query.set('nickname', profile.nickname);
    if (profile.bio != null) query.set('bio', profile.bio);
    const formData = new FormData();
    formData.append('file', profileImage);
    return apiPatch(`/api/profile?${query.toString()}`, formData);
  },
};

export const familyApi = {
  list: () => apiGet('/api/connect'),
  connect: (guardianEmail) => apiPost('/api/connect', { guardianEmail }),
  disconnect: (loginId) => apiDelete(`/api/connect/${encodeURIComponent(loginId)}`),
};

export const medicationApi = {
  list: () => apiGet('/api/medications'),
  create: (medication) => apiPost('/api/medications', medication),
  remove: (medicationId) => apiDelete(`/api/medications/${medicationId}`),
  check: (medicationId) => apiPost(`/api/medications/${medicationId}/check`),
};

export const guardianApi = { dashboard: () => apiGet('/api/dashboard') };
export const notificationApi = {
  list: () => apiGet('/api/notifications'),
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

export const userApi = {
  search: (loginId, page = 0, size = 20) => {
    const params = new URLSearchParams({ loginId, page: String(page), size: String(size) });
    return apiGet(`/api/users/search?${params.toString()}`);
  },
};

export const meetingApi = {
  list: () => apiGet('/api/community/meetings'),
  get: (id) => apiGet(`/api/community/meetings/${id}`),
  create: (meeting) => apiPost('/api/community/meetings', meeting),
  update: (id, meeting) => apiPut(`/api/community/meetings/${id}`, meeting),
  remove: (id) => apiDelete(`/api/community/meetings/${id}`),
  membership: (id) => apiGet(`/api/community/meetings/${id}/membership`),
  members: (id) => apiGet(`/api/community/meetings/${id}/members`),
  join: (id) => apiPost(`/api/community/meetings/${id}/join`),
  approveMember: (id, userId) =>
    apiPost(`/api/community/meetings/${id}/members/${userId}/approve`),
  updateMemberRole: (id, userId, role) =>
    apiPatch(`/api/community/meetings/${id}/members/${userId}/role`, { role }),
  removeMember: (id, userId) => apiDelete(`/api/community/meetings/${id}/members/${userId}`),
  leave: (id) => apiDelete(`/api/community/meetings/${id}/members/me`),
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
