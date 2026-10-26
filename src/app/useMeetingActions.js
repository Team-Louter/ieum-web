import { meetingApi } from '../api/client';
import { fileToDataUrl, readDemoValue, updateDemoValue } from '../api/demoStore';

function getMeetingRequest(values, owner) {
  return {
    name: values.title ?? values.name ?? '',
    description: values.description ?? '',
    region: values.region ?? '',
    owner,
    approvalRequired: Boolean(values.requireApproval ?? values.approvalRequired),
    isPrivate: Boolean(values.isPrivate ?? values.private),
  };
}

// 모임과 모임 안에서 사용하는 동작을 API 명세에 맞춰 처리합니다.
export default function useMeetingActions({ demoScope, user, runAction, movePage }) {
  async function createMeeting(values) {
    const result = await runAction(async () => {
      const imageUrl =
        values.image instanceof File ? await fileToDataUrl(values.image) : (values.image ?? '');
      const meeting = await meetingApi.create(getMeetingRequest(values, user.loginId));

      // 대표 이미지 업로드 API가 없어 이미지 파일만 현재 브라우저에 보관합니다.
      if (values.image instanceof File && meeting?.id != null) {
        const localImage = {
          ...meeting,
          id: meeting.id,
          imageUrl,
          _apiBacked: true,
        };
        updateDemoValue(
          'meetings',
          (meetings) => [
            localImage,
            ...meetings.filter((item) => String(item.id) !== String(meeting.id)),
          ],
          [],
          demoScope,
        );
      }
      return meeting;
    }, '모임을 만들었습니다.');

    movePage('/meeting');
    return result;
  }

  async function updateMeeting(meeting, values) {
    const meetingId = meeting?.id;
    if (meetingId == null) throw new Error('수정할 모임을 찾을 수 없습니다.');
    const request = getMeetingRequest({ ...meeting, ...values }, meeting.owner ?? user.loginId);

    return runAction(async () => {
      const updatedMeeting = await meetingApi.update(meetingId, request);
      if (values.image instanceof File) {
        const imageUrl = await fileToDataUrl(values.image);
        updateDemoValue(
          'meetings',
          (meetings) => [
            {
              ...meeting,
              ...updatedMeeting,
              ...request,
              id: meetingId,
              title: request.name,
              imageUrl,
              _apiBacked: true,
            },
            ...meetings.filter((item) => String(item.id) !== String(meetingId)),
          ],
          [],
          demoScope,
        );
      }
      return updatedMeeting;
    }, '모임 정보를 수정했습니다.');
  }

  async function deleteMeeting(meetingId) {
    if (meetingId == null) throw new Error('삭제할 모임을 찾을 수 없습니다.');
    const localMeeting = readDemoValue('meetings', [], demoScope).find(
      (meeting) => String(meeting.id) === String(meetingId),
    );
    if (localMeeting && !localMeeting._apiBacked) {
      await runAction(async () => {
        updateDemoValue(
          'meetings',
          (meetings) => meetings.filter((meeting) => String(meeting.id) !== String(meetingId)),
          [],
          demoScope,
        );
      }, '모임을 삭제했습니다.');
    } else {
      await runAction(async () => {
        await meetingApi.remove(meetingId);
        updateDemoValue(
          'meetings',
          (meetings) => meetings.filter((meeting) => String(meeting.id) !== String(meetingId)),
          [],
          demoScope,
        );
      }, '모임을 삭제했습니다.');
    }
    movePage('/meeting/my');
  }

  async function joinMeeting(meetingId) {
    if (meetingId == null) throw new Error('가입할 모임을 찾을 수 없습니다.');
    return runAction(() => meetingApi.join(meetingId), '모임 가입 요청을 보냈습니다.');
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
