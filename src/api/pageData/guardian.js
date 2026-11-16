import { connectionApi, guardianApi, medicationApi, notificationApi } from '../client';
import { elapsedLoginText, toGuardianMedication, toMedicationItem } from '../adapters';
import { asArray } from './common';

function getItems(response) {
  if (Array.isArray(response)) return response;
  return asArray(response?.content ?? response?.connections ?? response?.requests ?? response?.data);
}

async function loadConnections() {
  return getItems(await connectionApi.list());
}

async function loadPendingConnections(role) {
  if (role !== 'ROLE_GUARDIAN') return [];
  return getItems(await connectionApi.pending());
}

export async function loadGuardianPage() {
  const elders = asArray(
    await guardianApi.dashboard(),
  ).map((elder, index) => ({
    id: String(elder.loginId ?? elder.userId ?? elder.id ?? `elder-${index + 1}`),
    loginId: elder.loginId ?? '',
    elderName: elder.nickname || '어르신',
    homeAddress: elder.homeAddress ?? elder.address ?? '',
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

export async function loadSettingsPage({ role }) {
  const [notificationSettings, family, pendingConnections, medications] = await Promise.all([
    notificationApi.getSettings(),
    loadConnections(),
    loadPendingConnections(role),
    role === 'ROLE_SENIOR' ? medicationApi.list() : Promise.resolve([]),
  ]);

  return {
    settings: {
      medicationAlert: Boolean(notificationSettings?.medicationNotiEnabled),
      guardianActivity: Boolean(notificationSettings?.inactivityAlertEnabled),
      darkMode: false,
      interactionAlert: false,
      mentionAlert: false,
      guardianMedication: Boolean(notificationSettings?.guardianMedication),
      guardianLocation: false,
    },
    guardians: getItems(family).map((person) => ({
      ...person,
      id: person.loginId ?? person.userId ?? person.connectionId,
      name: person.nickname ?? '',
    })),
    pendingConnections: pendingConnections.map((person) => ({
      ...person,
      id: person.connectionId,
      name: person.seniorNickname ?? person.elderNickname ?? person.nickname ?? '어르신 계정',
    })),
    medicationSchedule: asArray(medications).map(toMedicationItem),
  };
}

/** 어르신 본인의 복약 알림 화면에 필요한 오늘의 복약 목록입니다. */
export async function loadMedicationPage() {
  const medications = asArray(await medicationApi.list());

  return {
    medicationSchedule: medications.map(toMedicationItem),
  };
}
