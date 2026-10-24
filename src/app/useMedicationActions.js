import { medicationApi } from '../api/client';
import { isDemoFallbackError, updateDemoValue } from '../api/demoStore';

// 복약 항목의 추가, 삭제, 복용 확인 동작입니다.
export default function useMedicationActions({ demoScope, runAction, setCheckedMedicationIds }) {
  async function createMedication({ name, takeTime }) {
    await runAction(async () => {
      try {
        return await medicationApi.create({ name, takeTime });
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        const medication = { medicationId: Date.now(), name, takeTime, taken: false };
        updateDemoValue('medications', (items) => [...items, medication], [], demoScope);
        return medication;
      }
    }, '복약 정보를 등록했습니다.');
  }

  async function deleteMedication(medicationId) {
    await runAction(async () => {
      try {
        await medicationApi.remove(medicationId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        updateDemoValue(
          'medications',
          (items) => items.filter((item) => String(item.medicationId ?? item.id) !== String(medicationId)),
          [],
          demoScope,
        );
      }

      setCheckedMedicationIds((ids) => ids.filter((id) => id !== medicationId));
    }, '복약 정보를 삭제했습니다.');
  }

  async function checkMedication(medicationId) {
    await runAction(async () => {
      try {
        await medicationApi.check(medicationId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        updateDemoValue(
          'medications',
          (items) => items.map((item) => (
            String(item.medicationId ?? item.id) === String(medicationId)
              ? { ...item, taken: true }
              : item
          )),
          [],
          demoScope,
        );
      }

      setCheckedMedicationIds((ids) => (
        ids.some((id) => String(id) === String(medicationId)) ? ids : [...ids, medicationId]
      ));
    }, '오늘 복용을 확인했습니다.');
  }

  return { createMedication, deleteMedication, checkMedication };
}
