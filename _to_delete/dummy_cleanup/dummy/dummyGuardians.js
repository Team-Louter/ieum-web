import profileImage from '../../assets/images/profile.png';

/** 보호자 설정 화면을 확인하기 위한 임시 보호자 목록입니다. */
export const dummyGuardians = Array.from({ length: 4 }, (_, index) => ({
  id: `guardian-${index + 1}`,
  nickname: '보호자 아이디',
  profileImage,
}));
