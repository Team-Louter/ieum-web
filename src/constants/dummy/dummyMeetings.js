import meetingCover from '../../assets/images/meeting-cover.jpg';
import profileImage from '../../assets/images/profile.png';

/** API 연결 전 모임 화면에서 사용할 임시 데이터입니다. */
export const dummyMeetings = [
  {
    id: 'meeting-1',
    title: '동네 산책 모임',
    description: '함께 가볍게 산책해요.',
    region: '대구 달성군',
    memberCount: 8,
    image: meetingCover,
  },
  {
    id: 'meeting-2',
    title: '책 읽는 모임',
    description: '읽은 책에 대해 이야기해요.',
    region: '대구 달서구',
    memberCount: 12,
    image: meetingCover,
  },
  {
    id: 'meeting-3',
    title: '주말 사진 모임',
    description: '동네 풍경을 사진으로 남겨요.',
    region: '대구 중구',
    memberCount: 6,
    image: meetingCover,
  },
  {
    id: 'meeting-4',
    title: '건강한 한 걸음',
    description: '서로 응원하며 운동해요.',
    region: '대구 달성군',
    memberCount: 10,
    image: meetingCover,
  },
  {
    id: 'meeting-5',
    title: '우리 동네 이야기',
    description: '이웃과 편하게 소통해요.',
    region: '대구 북구',
    memberCount: 9,
    image: meetingCover,
  },
];

export const dummyMyMeetings = dummyMeetings.slice(0, 3);

export const dummyMeetingMembers = Array.from({ length: 30 }, (_, index) => ({
  id: `member-${index + 1}`,
  nickname: `아이디${index + 1}`,
  role: index === 0 ? '개설자' : index < 3 ? '관리자' : '회원',
  profileImage,
}));

export const dummyMeetingManagers = dummyMeetingMembers.slice(0, 3);

export const dummyMeetingAnnouncement = {
  id: 'announcement-1',
  author: {
    id: '아이디',
    profileImage,
  },
  title: '모임 공지사항',
  content: '모임에서 함께 지켜야 할 내용을 작성해 주세요.',
};
