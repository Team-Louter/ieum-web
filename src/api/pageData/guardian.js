import { connectionApi, familyApi, guardianApi, medicationApi, notificationApi } from '../client';
import { elapsedLoginText, formatMedicationTime, toGuardianMedication } from '../adapters';
import { isDemoFallbackError, readDemoValue } from '../demoStore';
import { asArray, loadApiOrDemo } from './common';

function getItems(response) {
  if (Array.isArray(response)) return response;
  return asArray(response?.content ?? response?.connections ?? response?.requests ?? response?.data);
}

async function loadConnections(demoScope) {
  try {
    return getItems(await connectionApi.list());
  } catch (error) {
    if (!isDemoFallbackError(error)) throw error;
    try {
      // 배포 환경에 최신 목록 API가 아직 반영되지 않은 경우 기존 API를 사용합니다.
      return getItems(await familyApi.list());
    } catch (legacyError) {
      if (!isDemoFallbackError(legacyError)) throw legacyError;
      return asArray(readDemoValue('family', [], demoScope));
    }
  }
}

async function loadPendingConnections(role) {
  if (role !== 'ROLE_GUARDIAN') return [];
  try {
    return getItems(await connectionApi.pending());
  } catch (error) {
    if (!isDemoFallbackError(error)) throw error;
    return [];
  }
}

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
  const [notificationSettings, family, pendingConnections, medications] = await Promise.all([
    loadApiOrDemo(() => notificationApi.getSettings(), 'settings', {}, demoScope),
    loadConnections(demoScope),
    loadPendingConnections(role),
    role === 'ROLE_SENIOR'
      ? loadApiOrDemo(() => medicationApi.list(), 'medications', [], demoScope)
      : Promise.resolve([]),
  ]);

  const localSettings = readDemoValue('settings', {}, demoScope);
  const savedMedications =
    role === 'ROLE_SENIOR' ? readDemoValue('medications', [], demoScope) : [];
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
    guardians: getItems(family).map((person) => ({
      ...person,
      id: person.loginId ?? person.userId ?? person.connectionId,
      name: person.nickname ?? person.loginId,
    })),
    pendingConnections: pendingConnections.map((person) => ({
      ...person,
      id: person.connectionId,
      name: person.seniorLoginId ?? person.elderLoginId ?? person.loginId ?? person.nickname ?? '어르신 계정',
    })),
    medicationSchedule: uniqueMedications.map((medication) => ({
      id: medication.medicationId,
      time: formatMedicationTime(medication.takeTime),
      label: medication.name,
    })),
  };
}
