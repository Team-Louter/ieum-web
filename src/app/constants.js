// 화면에서 사용하는 설정 이름과 서버 API 필드 이름을 연결합니다.
export const settingApiFields = {
  medicationAlert: 'medicationNotiEnabled',
  guardianMedication: 'guardianMedication',
};

export const defaultProfile = {
  id: '',
  introduction: '',
  postCount: 0,
  friendCount: 0,
  profileImage: '',
};

export const defaultSettings = {
  medicationAlert: false,
  guardianActivity: false,
  guardianMedication: false,
  interactionAlert: false,
  mentionAlert: false,
  darkMode: false,
  guardianLocation: false,
};

export const defaultGuardian = {
  elderName: '',
  homeAddress: '',
  homeCoordinates: null,
  homeRadiusMeters: 100,
  lastLoginText: '',
  statusMessage: '',
};

export const defaultMeeting = {
  title: '',
  description: '',
  image: '',
  region: '',
};

export const defaultSelectedPost = {
  image: '',
  title: '',
  price: '',
  address: '',
  description: '',
};
