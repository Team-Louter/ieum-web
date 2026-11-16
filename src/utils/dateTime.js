// 서버의 시간대 없는 날짜·시각(LocalDateTime)은 UTC 기준이므로 시간대가 없으면 UTC로 읽습니다.
export function parseServerDate(value) {
  if (!value) return null;
  const text = String(value);
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const date = new Date(hasTimezone ? text : `${text}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 서버 시각을 한국 시각의 "11월 16일 오후 11:30" 형태로 바꿉니다. */
export function formatKoreanDateTime(value) {
  const date = parseServerDate(value);
  if (!date) return value ? String(value) : '';
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** 한국 시각 기준 오늘 날짜를 YYYY-MM-DD로 돌려줍니다. */
export function getKoreanToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
