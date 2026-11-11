import profileImage from '../../assets/images/profile.png';

/** 화면 연결 전 프로필 UI를 확인하기 위한 임시 데이터입니다. */
export const dummyMyProfile = {
  id: '아이디',
  introduction: '내 소개',
  postCount: 0,
  friendCount: 5,
  profileImage,
};

export const dummyOtherProfile = {
  id: '아이디',
  introduction: '내 소개',
  postCount: 0,
  friendCount: 0,
  profileImage,
};

export const dummyNeighborPosts = Array.from({ length: 6 }, (_, index) => ({
  id: `post-${index + 1}`,
  image: null,
  title: `게시물 ${index + 1}`,
}));

export const dummyMyPosts = dummyNeighborPosts.slice(0, 3);
