import { meetingApi } from '../api/client';

function getMeetingRequest(values) {
  return {
    name: values.title ?? values.name ?? '',
    description: values.description ?? '',
    region: values.region ?? '',
    approvalRequired: Boolean(values.requireApproval ?? values.approvalRequired),
    isPrivate: Boolean(values.isPrivate ?? values.private),
  };
}

function getMeetingUpdateRequest(values) {
  return {
    name: values.title ?? values.name ?? '',
    description: values.description ?? '',
    region: values.region ?? '',
  };
}

// 모임과 모임 안에서 사용하는 동작을 API 명세에 맞춰 처리합니다.
export default function useMeetingActions({ runAction, movePage }) {
  async function createMeeting(values) {
    const imageFile = typeof File !== 'undefined' && values.image instanceof File ? values.image : null;
    if (imageFile && (!['image/jpeg', 'image/png'].includes(imageFile.type) || imageFile.size > 5 * 1024 * 1024)) {
      throw new Error('모임 사진은 5MB 이하의 JPEG 또는 PNG 파일이어야 합니다.');
    }

    const result = await runAction(
      () => meetingApi.create(getMeetingRequest(values), imageFile),
      '모임을 만들었습니다.',
    );

    movePage('/meeting');
    return result;
  }

  async function updateMeeting(meeting, values) {
    const meetingId = meeting?.id;
    if (meetingId == null) throw new Error('수정할 모임을 찾을 수 없습니다.');
    const imageFile = typeof File !== 'undefined' && values.image instanceof File ? values.image : null;
    if (imageFile && (!['image/jpeg', 'image/png'].includes(imageFile.type) || imageFile.size > 5 * 1024 * 1024)) {
      throw new Error('모임 사진은 5MB 이하의 JPEG 또는 PNG 파일이어야 합니다.');
    }
    const request = getMeetingUpdateRequest({ ...meeting, ...values });

    return runAction(
      () => meetingApi.update(meetingId, request, imageFile),
      '모임 정보를 수정했습니다.',
    );
  }

  async function deleteMeeting(meetingId) {
    if (meetingId == null) throw new Error('삭제할 모임을 찾을 수 없습니다.');
    await runAction(() => meetingApi.remove(meetingId), '모임을 삭제했습니다.');
    movePage('/meeting/my');
  }

  async function joinMeeting(meetingId) {
    if (meetingId == null) throw new Error('가입할 모임을 찾을 수 없습니다.');
    return runAction(() => meetingApi.join(meetingId), (membership) => {
      const status = String(
        membership?.status ?? membership?.membershipStatus ?? membership?.data?.status ?? '',
      ).toUpperCase();
      const isPending = [
        'PENDING',
        'PENDING_APPROVAL',
        'WAITING',
        'WAITING_APPROVAL',
        'REQUESTED',
      ].includes(status);

      return isPending ? '모임 가입 신청을 보냈습니다.' : '모임에 가입했습니다.';
    });
  }

  async function leaveMeeting(meetingId) {
    if (meetingId == null) throw new Error('탈퇴할 모임을 찾을 수 없습니다.');
    await runAction(() => meetingApi.leave(meetingId), '모임에서 탈퇴했습니다.');
    movePage('/meeting');
  }

  async function handleMemberAction(meetingId, member, action) {
    const userId = member?.userId ?? member?.id;
    if (meetingId == null || userId == null) {
      throw new Error('회원 정보를 확인할 수 없습니다.');
    }

    if (action === '가입 승인') {
      return runAction(
        () => meetingApi.approveMember(meetingId, userId),
        '모임 가입을 승인했습니다.',
      );
    }
    if (action === '관리자 임명') {
      return runAction(
        () => meetingApi.updateMemberRole(meetingId, userId, 'MANAGER'),
        '모임 관리자로 지정했습니다.',
      );
    }
    if (action === '관리자 해제') {
      return runAction(
        () => meetingApi.updateMemberRole(meetingId, userId, 'MEMBER'),
        '관리자 권한을 해제했습니다.',
      );
    }
    if (action === '추방하기') {
      return runAction(
        () => meetingApi.removeMember(meetingId, userId),
        '모임 회원을 내보냈습니다.',
      );
    }
  }

  async function createNotice(meetingId, values) {
    if (meetingId == null) throw new Error('공지사항을 올릴 모임을 찾을 수 없습니다.');
    const result = await runAction(
      async () => {
        const createdNotice = await meetingApi.createNotice(meetingId, values);
        return createdNotice;
      },
      '공지사항을 올렸습니다.',
    );
    movePage(`/meeting/my/detail/${meetingId}`);
    return result;
  }

  async function updateNotice(meetingId, noticeId, values) {
    return runAction(
      () => meetingApi.updateNotice(meetingId, noticeId, values),
      '공지사항을 수정했습니다.',
    );
  }

  async function deleteNotice(meetingId, noticeId) {
    return runAction(
      () => meetingApi.removeNotice(meetingId, noticeId),
      '공지사항을 삭제했습니다.',
    );
  }

  return {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting,
    leaveMeeting,
    handleMemberAction,
    createNotice,
    updateNotice,
    deleteNotice,
  };
}
