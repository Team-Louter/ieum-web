import { meetingApi } from '../api/client';
import { fileToDataUrl, isDemoFallbackError, updateDemoValue } from '../api/demoStore';

// 모임 만들기 화면에서 호출하는 동작입니다.
export default function useMeetingActions({ demoScope, user, runAction, movePage }) {
  async function createMeeting(values) {
    const result = await runAction(async () => {
      const imageUrl = values.image instanceof File
        ? await fileToDataUrl(values.image)
        : values.image ?? '';

      const meeting = {
        id: Date.now(),
        name: values.title,
        title: values.title,
        description: values.description,
        region: values.region ?? '',
        owner: user.loginId,
        imageUrl,
        memberCount: 1,
        approvalRequired: Boolean(values.requireApproval),
        isPrivate: Boolean(values.isPrivate),
      };

      // 이미지 파일은 임시 저장소에 보관하고, 그 외에는 서버 API를 먼저 사용합니다.
      if (!(values.image instanceof File)) {
        try {
          return await meetingApi.create({ ...meeting, id: undefined });
        } catch (error) {
          if (!isDemoFallbackError(error)) throw error;
        }
      }

      updateDemoValue('meetings', (meetings) => [meeting, ...meetings], [], demoScope);
      return meeting;
    }, '모임을 만들었습니다.');

    movePage('/meeting');
    return result;
  }

  return { createMeeting };
}
