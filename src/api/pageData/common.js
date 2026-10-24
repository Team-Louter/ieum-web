import { isDemoFallbackError, readDemoValue } from '../demoStore';

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

// 서버 API가 아직 없을 때(404, 405, 501) 브라우저의 데모 데이터를 사용합니다.
export async function loadApiOrDemo(apiRequest, storeKey, fallbackValue, demoScope) {
  try {
    return await apiRequest();
  } catch (error) {
    if (!isDemoFallbackError(error)) throw error;
    return readDemoValue(storeKey, fallbackValue, demoScope);
  }
}

// 목록 API가 아직 준비되지 않은 경우 빈 목록으로 보여줄 때 사용합니다.
export async function loadApiOrEmpty(apiRequest) {
  try {
    return await apiRequest();
  } catch (error) {
    if (!isDemoFallbackError(error)) throw error;
    return [];
  }
}

export function isOwnedBy(loginId, item) {
  return item.owner === loginId || item.author?.id === loginId;
}
