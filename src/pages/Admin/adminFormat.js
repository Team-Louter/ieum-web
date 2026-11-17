export const INQUIRY_STATUS = {
  RECEIVED: '답변 대기',
  ANSWERED: '답변 완료',
};

// 서버 시간은 시간대가 포함된 ISO-8601이며, 한국 시간으로 보여 줍니다.
export function formatAdminDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatAdminDay(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 목록 응답이 배열이든 { items } 이든 같은 배열로 읽습니다.
export function toList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}
