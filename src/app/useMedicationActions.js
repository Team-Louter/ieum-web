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

  async function checkMedication(medicationId) {
    // 확인 후 목록을 다시 불러오면 서버의 taken 값이 화면에 반영됩니다.
    await runAction(() => medicationApi.check(medicationId), '오늘 복용을 확인했습니다.');
  }

  return { createMedication, deleteMedication, checkMedication };
}
