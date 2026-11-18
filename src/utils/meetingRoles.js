/** 회원의 모임 안 등급을 'OWNER'(모임장), 'MANAGER'(관리자), 'MEMBER'(회원) 중 하나로 알려줍니다. */
export function getMemberRole(member, { ownerId, ownerLoginId } = {}) {
  const roleName = String(member?.role ?? '').toUpperCase().replace(/^ROLE_/, '');
  const isOwner =
    ['OWNER', 'LEADER', 'HOST', 'CREATOR'].includes(roleName) ||
    (ownerId != null && String(member?.userId ?? member?.id) === String(ownerId)) ||
    Boolean(ownerLoginId && member?.loginId === ownerLoginId);
  if (isOwner) return 'OWNER';
  return ['MANAGER', 'ADMIN'].includes(roleName) ? 'MANAGER' : 'MEMBER';
}
