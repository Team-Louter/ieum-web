import { medicationApi } from '../api/client';

// 복약 항목의 추가, 삭제, 복용 확인 동작입니다.
export default function useMedicationActions({ runAction }) {
  async function createMedication({ name, takeTime }) {
    await runAction(() => medicationApi.create({ name, takeTime }), '복약 정보를 등록했습니다.');
  }

  async function deleteMedication(medicationId) {
    await runAction(async () => {
      await medicationApi.remove(medicationId);
    }, '복약 정보를 삭제했습니다.');
  }

  // checkDate는 복약 목록이 알려 준 확인 대상 날짜입니다. 전날 회차면 doseDate로 함께 보냅니다.
  async function checkMedication(medicationId, checkDate) {
    try {
      // 확인 후 목록을 다시 불러오면 서버의 taken 값이 화면에 반영됩니다.
      await runAction(
        () => medicationApi.check(medicationId, checkDate),
        '복용을 확인했습니다.',
      );
    } catch (error) {
      // 이미 확인됐거나 대상 회차가 바뀐 경우(409)에는 목록을 다시 불러와 최신 상태로 맞춥니다.
      if (error?.status === 409) await runAction(async () => {}, null);
      throw error;
    }
  }

  return { createMedication, deleteMedication, checkMedication };
}
