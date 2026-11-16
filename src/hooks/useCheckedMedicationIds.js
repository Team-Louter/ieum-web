import { useCallback, useState } from 'react';

function getTodayText() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function readIds(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeIds(key, ids) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // 저장소를 쓸 수 없으면 새로고침 전까지만 유지됩니다.
  }
}

/**
 * 오늘 복용을 체크한 복약 ID 목록입니다.
 * 서버의 GET /api/medications 응답에 복용 여부(taken)가 없어서,
 * 서버가 내려주기 전까지 새로고침해도 유지되도록 오늘 날짜 기준으로 브라우저에 보관합니다.
 */
export default function useCheckedMedicationIds(loginId) {
  const key = `ieum.checkedMedications.${loginId || 'guest'}.${getTodayText()}`;
  const [overrides, setOverrides] = useState({});
  const ids = overrides[key] ?? readIds(key);

  const setIds = useCallback(
    (updater) => {
      setOverrides((previous) => {
        const current = previous[key] ?? readIds(key);
        const next = typeof updater === 'function' ? updater(current) : updater;
        writeIds(key, next);
        return { ...previous, [key]: next };
      });
    },
    [key],
  );

  return [ids, setIds];
}
