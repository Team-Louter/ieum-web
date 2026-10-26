import { familyApi, guardianApi, medicationApi, notificationApi } from '../client';
import { elapsedLoginText, formatMedicationTime, toGuardianMedication } from '../adapters';
import { readDemoValue } from '../demoStore';
import { asArray, loadApiOrDemo } from './common';

export async function loadGuardianPage({ demoScope }) {
  const elders = asArray(
    await loadApiOrDemo(() => guardianApi.dashboard(), 'guardian.dashboard', [], demoScope),
  ).map((elder, index) => ({
    id: String(elder.loginId ?? elder.userId ?? elder.id ?? `elder-${index + 1}`),
    loginId: elder.loginId ?? '',
    elderName: elder.loginId || elder.nickname || '어르신',
    homeAddress: elder.homeAddress ?? '',
    homeCoordinates: elder.homeCoordinates ?? null,
    homeRadiusMeters: elder.homeRadiusMeters,
    lastLoginText: elapsedLoginText(elder.lastActiveAt),
    statusMessage: '어르신의 최근 활동과 복약 상태를 확인할 수 있습니다.',
    medications: asArray(elder.medications).map(toGuardianMedication),
  }));
  const elder = elders[0];

  if (!elder) {
    return {
      elders: [],
      guardian: {
        elderName: '',
        homeAddress: '',
        homeCoordinates: null,
        lastLoginText: '연결된 어르신이 없습니다.',
        statusMessage: '보호자 설정에서 어르신을 연결해 주세요.',
      },
      medications: [],
    };
  }

  return {
    elders,
    guardian: {
      elderName: elder.elderName,
      homeAddress: elder.homeAddress,
      homeCoordinates: elder.homeCoordinates,
      homeRadiusMeters: elder.homeRadiusMeters,
      lastLoginText: elder.lastLoginText,
      statusMessage: elder.statusMessage,
    },
    medications: elder.medications,
  };
}

export async function loadSettingsPage({ role, demoScope }) {
  const [notificationSettings, family, medications] = await Promise.all([
    loadApiOrDemo(() => notificationApi.getSettings(), 'settings', {}, demoScope),
    loadApiOrDemo(() => familyApi.list(), 'family', [], demoScope),
    role === 'ROLE_SENIOR'
      ? loadApiOrDemo(() => medicationApi.list(), 'medications', [], demoScope)
      : Promise.resolve([]),
  ]);

  const localSettings = readDemoValue('settings', {}, demoScope);
  const savedMedications = readDemoValue('medications', [], demoScope);
  const uniqueMedications = [...asArray(medications), ...asArray(savedMedications)].filter(
    (medication, index, list) =>
      list.findIndex(
        (candidate) =>
          String(candidate.medicationId ?? candidate.id) ===
          String(medication.medicationId ?? medication.id),
      ) === index,
  );

  return {
    settings: {
      medicationAlert: Boolean(notificationSettings?.medicationNotiEnabled),
      darkMode: false,
      interactionAlert: false,
      mentionAlert: false,
      guardianLocation: false,
      ...localSettings,
    },
    guardians: asArray(family).map((person) => ({
      ...person,
      id: person.loginId,
      name: person.nickname,
    })),
    medicationSchedule: uniqueMedications.map((medication) => ({
      id: medication.medicationId,
      time: formatMedicationTime(medication.takeTime),
      label: medication.name,
    })),
  };
}
