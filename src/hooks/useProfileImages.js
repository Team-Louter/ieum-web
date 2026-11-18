import { useEffect, useState } from 'react';
import { profileApi, resolveApiAssetUrl } from '../api/client';

// 회원·친구·보호자 목록 응답에는 프로필 사진이 없어서, 사용자별 프로필에서 사진 주소를 받아 기억해 둡니다.
const imageCache = new Map();
const pending = new Map();
const listeners = new Set();
const BATCH_SIZE = 6;

function fetchImage(userId) {
  if (!pending.has(userId)) {
    pending.set(
      userId,
      profileApi
        .getByUserId(userId)
        .then((profile) => resolveApiAssetUrl(profile?.profileImageUrl ?? ''))
        .catch(() => '')
        .then((url) => {
          imageCache.set(userId, url);
          pending.delete(userId);
        }),
    );
  }
  return pending.get(userId);
}

async function loadMissing(userIds) {
  const missing = userIds.filter((id) => !imageCache.has(id));
  for (let index = 0; index < missing.length; index += BATCH_SIZE) {
    await Promise.all(missing.slice(index, index + BATCH_SIZE).map(fetchImage));
    listeners.forEach((listener) => listener());
  }
}

function defaultGetUserId(item) {
  return item?.userId ?? item?.id;
}

/**
 * 사진이 없는 항목에 profileImage를 채워 돌려줍니다. 사진을 받아 오는 동안에는 기존 항목 그대로 보입니다.
 * getUserId: 항목에서 사용자 번호를 꺼내는 함수 (기본: userId, 없으면 id)
 */
export default function useProfileImages(items, getUserId = defaultGetUserId) {
  const [, setVersion] = useState(0);
  const list = Array.isArray(items) ? items : [];
  const targets = list
    .filter((item) => !(item?.profileImage || item?.profile_image || item?.profileImageUrl))
    .map((item) => getUserId(item))
    .filter((id) => id != null && id !== '')
    .map(String);
  const targetKey = [...new Set(targets)].join(',');

  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    listeners.add(listener);
    if (targetKey) loadMissing(targetKey.split(','));
    return () => {
      listeners.delete(listener);
    };
  }, [targetKey]);

  return list.map((item) => {
    if (item?.profileImage || item?.profile_image || item?.profileImageUrl) return item;
    const userId = getUserId(item);
    const url = userId == null ? '' : imageCache.get(String(userId));
    return url ? { ...item, profileImage: url } : item;
  });
}
