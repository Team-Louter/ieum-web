import profileImage from '../../assets/images/profile.png';

/** API 응답 대신 피드 UI를 확인하기 위한 임시 게시물 목록입니다. */
export const dummyNeighborFeedPosts = Array.from({ length: 4 }, (_, index) => ({
  id: `neighbor-post-${index + 1}`,
  author: {
    id: '아이디',
    profileImage,
  },
  image: null,
  title: '게시물 제목',
  content: '게시물 내용',
  likeCount: 0,
  isLiked: false,
}));
