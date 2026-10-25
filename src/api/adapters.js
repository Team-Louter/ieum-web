import profileFallback from '../assets/images/profile.png';
import { resolveApiAssetUrl } from './client';

export function toMeetingCard(meeting = {}) {
  return {
    ...meeting,
    id: meeting.id,
    title: meeting.name ?? meeting.title ?? '',
    description: meeting.description ?? '',
    region: meeting.region ?? '',
    image: meeting.imageUrl ?? meeting.image ?? '',
  };
}

export function toSharingCard(sharing = {}) {
  const sellerId = sharing.sellerId ?? null;
  const sellerLoginId =
    sharing.sellerLoginId ?? sharing.seller?.loginId ?? sharing.loginId ?? sharing.owner ?? '';
  const sellerNickname = sharing.sellerNickname ?? sharing.seller?.nickname ?? '';
  const sellerProfileImage = resolveApiAssetUrl(
    sharing.sellerProfileImageUrl ??
      sharing.seller?.profileImageUrl ??
      sharing.seller?.profileImage ??
      '',
  );

  return {
    ...sharing,
    id: sharing.id,
    sellerId,
    title: sharing.name ?? sharing.title ?? '',
    description: sharing.description ?? '',
    address: sharing.region ?? sharing.address ?? '',
    price: sharing.price == null ? '나눔' : `${Number(sharing.price).toLocaleString('ko-KR')}원`,
    image: resolveApiAssetUrl(sharing.imageUrl ?? sharing.image ?? ''),
    seller: {
      id: sellerLoginId || '판매자 정보 없음',
      loginId: sellerLoginId,
      nickname: sellerNickname,
      profileImage: sellerProfileImage || profileFallback,
    },
  };
}

export function formatMedicationTime(value = '') {
  const [rawHour = '0', rawMinute = '00'] = String(value).split(':');
  const hour = Number(rawHour);
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}:${rawMinute.padStart(2, '0')}`;
}

export function toGuardianMedication(medication = {}) {
  const [hour = '0', minute = '0'] = String(medication.takeTime ?? '00:00:00').split(':');
  const scheduledAt = new Date();
  scheduledAt.setHours(Number(hour), Number(minute), 0, 0);
  const isPast = scheduledAt.getTime() < Date.now();
  const status = medication.taken ? 'complete' : isPast ? 'missed' : 'upcoming';
  const remainingHours = Math.max(0, Math.ceil((scheduledAt.getTime() - Date.now()) / 3_600_000));
  const statusLabel = medication.taken
    ? '(복용완료)'
    : status === 'missed'
      ? '(미복용)'
      : `(${remainingHours}시간 남음)`;

  return {
    id: medication.medicationId,
    time: formatMedicationTime(medication.takeTime),
    name: `${medication.name} ${statusLabel}`,
    status,
  };
}

export function elapsedLoginText(lastActiveAt) {
  if (!lastActiveAt) return '최근 접속 정보를 확인할 수 없습니다.';
  const parsed = new Date(lastActiveAt);
  if (Number.isNaN(parsed.getTime())) return '최근 접속 정보를 확인할 수 없습니다.';
  const hours = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 3_600_000));
  return `어르신께서 ${hours}시간 전에 접속하셨습니다.`;
}
