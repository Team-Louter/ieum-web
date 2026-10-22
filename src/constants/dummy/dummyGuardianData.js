export const dummyGuardian = {
  elderName: '어르신',
  homeAddress: '대구광역시 달성군 구지면 창리로11길 93',
  homeCoordinates: { latitude: 35.8534, longitude: 128.4722 },
  homeRadiusMeters: 100,
  lastLoginText: '어르신께서 0시간 전에 접속하셨습니다.',
  statusMessage: '어르신께서 어떻게 지내는지 한번 확인해 보는게 어떨까요?',
};

export const dummyGuardianMedications = [
  { id: 'morning', time: '오전 00:00', name: '복용할 약 (녹용환)', status: 'complete' },
  { id: 'noon', time: '오전 00:00', name: '복용할 약 (미복용)', status: 'missed' },
  { id: 'night', time: '오전 00:00', name: '복용할 약 (0시간 남음)', status: 'upcoming' },
];

export const dummyMedicationSchedule = [
  { id: 'morning', time: '오전 8:00', label: '아침 복약 알림' },
  { id: 'noon', time: '오후 1:00', label: '점심 복약 알림' },
  { id: 'night', time: '오후 8:00', label: '저녁 복약 알림' },
];
