const PENDING_STATUSES = ['PENDING', 'PENDING_APPROVAL', 'WAITING', 'WAITING_APPROVAL', 'REQUESTED'];

/** 가입 승인을 기다리는 회원인지 확인합니다. */
export function isPendingMember(member) {
  return PENDING_STATUSES.includes(String(member?.status ?? '').toUpperCase());
}

/** 회원 목록을 가입 요청 중인 사람과 가입을 마친 사람으로 나눕니다. */
export function splitMembers(members = []) {
  return {
    pendingRequests: members.filter(isPendingMember),
    joinedMembers: members.filter((member) => !isPendingMember(member)),
  };
}
