import profileImage from '../../assets/images/profile.png';

/** 친구 추가 화면의 UI 확인용 임시 회원 목록입니다. */
export const dummyAddFriends = Array.from({ length: 47 }, (_, index) => ({
  id: `friend-${index + 1}`,
  name: '아이디',
  profileImage,
}));
