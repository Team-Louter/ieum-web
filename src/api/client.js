const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ieum.louter.site';
const ACCESS_TOKEN_KEY = 'ieum.accessToken';
const REFRESH_TOKEN_KEY = 'ieum.refreshToken';

let refreshPromise;

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
  if (hasBody && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
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
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
export const apiPatch = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: 'PATCH',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
export const apiPut = (path, body, options) =>
  apiRequest(path, {
    ...options,
    method: 'PUT',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
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
  update: (profile) => apiPatch('/api/profile', profile),
};

export const familyApi = {
  list: () => apiGet('/api/connect'),
  connect: (seniorEmail) => apiPost('/api/connect', { seniorEmail }),
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
  list: (myId) => apiGet(`/api/friends?myId=${encodeURIComponent(myId)}`, { auth: false }),
  received: (myId) =>
    apiGet(`/api/friends/requests/received?myId=${encodeURIComponent(myId)}`, { auth: false }),
  request: (targetId, myId) =>
    apiPost(
      `/api/friends/requests/${encodeURIComponent(targetId)}?myId=${encodeURIComponent(myId)}`,
      undefined,
      { auth: false },
    ),
  accept: (friendshipId, myId) =>
    apiPost(
      `/api/friends/requests/${friendshipId}/accept?myId=${encodeURIComponent(myId)}`,
      undefined,
      { auth: false },
    ),
  remove: (friendshipId, myId) =>
    apiDelete(`/api/friends/${friendshipId}?myId=${encodeURIComponent(myId)}`, { auth: false }),
};

export const meetingApi = {
  list: () => apiGet('/api/community/meetings'),
  get: (id) => apiGet(`/api/community/meetings/${id}`),
  create: (meeting) => apiPost('/api/community/meetings', meeting),
  update: (id, meeting) => apiPut(`/api/community/meetings/${id}`, meeting),
  remove: (id) => apiDelete(`/api/community/meetings/${id}`),
  getLike: (id) => apiGet(`/api/contents/MEETING/${id}/like`),
  like: (id) => apiPut(`/api/contents/MEETING/${id}/like`),
  unlike: (id) => apiDelete(`/api/contents/MEETING/${id}/like`),
};

export const sharingApi = {
  list: () => apiGet('/api/community/sharings'),
  get: (id) => apiGet(`/api/community/sharings/${id}`),
  create: (sharing) => apiPost('/api/community/sharings', sharing),
  update: (id, sharing) => apiPut(`/api/community/sharings/${id}`, sharing),
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
