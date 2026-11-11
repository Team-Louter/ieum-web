import profileImage from '../../assets/images/profile.png';

/** 채팅 목록 UI 확인용 데이터입니다. */
export const dummyChatContacts = [
  { id: 'dohyun', name: '김도현', profileImage },
  { id: 'jungyeon', name: '이정연', profileImage },
  { id: 'gangho', name: '하강호', profileImage },
  { id: 'hyunwoo', name: '강현우', profileImage },
  { id: 'heerin', name: '우희린', profileImage },
  { id: 'router', name: '라우터', profileImage },
];

/** 사용자 ID별 임시 대화 내용입니다. */
export const dummyChatThreads = {
  dohyun: [
    { id: 'dohyun-1', sender: 'them', content: '안녕하세요!', time: '오전 10:20' },
    { id: 'dohyun-2', sender: 'me', content: '네, 반갑습니다.', time: '오전 10:21' },
  ],
};
