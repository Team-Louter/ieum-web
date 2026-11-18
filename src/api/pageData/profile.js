import { communityPostApi, friendApi, meetingApi, profileApi, resolveApiAssetUrl } from '../client';
import { toCommunityPost, toMeetingCard } from '../adapters';
import { asArray } from './common';

function toProfile(profile, friendCount, loginId, postCount = 0) {
  return {
    id: loginId || profile.loginId || '',
    userId: profile.userId ?? null,
    nickname: profile.nickname ?? '',
    introduction: profile.bio ?? '',
    profileImage: resolveApiAssetUrl(profile.profileImageUrl ?? ''),
    postCount,
    friendCount,
  };
}

// 다른 사용자의 프로필과 그 사용자가 쓴 게시물을 불러옵니다.
export async function loadUserProfilePage({ selectedId }) {
  if (!selectedId) throw new Error('프로필을 볼 사용자를 확인할 수 없습니다.');

  // 모임·친구 목록은 비공개이거나 실패해도 프로필 자체는 보이도록 빈 목록으로 대신합니다.
  const [profile, postsResponse, meetingsResponse, friendsResponse] = await Promise.all([
    profileApi.getByUserId(selectedId),
    communityPostApi.list({ authorId: selectedId }),
    profileApi.meetings(selectedId).catch(() => []),
    profileApi.friends(selectedId).catch(() => null),
  ]);
  const posts = asArray(
    Array.isArray(postsResponse) ? postsResponse : (postsResponse?.posts ?? postsResponse?.content),
  ).map(toCommunityPost);
  const friends = asArray(friendsResponse).map((friend) => ({
    ...friend,
    id: friend.userId,
    name: friend.nickname,
  }));
  const meetings = asArray(
    Array.isArray(meetingsResponse) ? meetingsResponse : (meetingsResponse?.meetings ?? meetingsResponse?.content),
  ).map(toMeetingCard);
  const friendCount = Number(
    profile.friendCount ?? profile.friendsCount ?? (friendsResponse ? friends.length : 0),
  );

  return {
    profile: {
      ...toProfile(profile, friendCount, profile.loginId, Number(postsResponse?.totalCount ?? posts.length)),
      userId: profile.userId ?? selectedId,
    },
    posts,
    postsHasNext: Boolean(postsResponse?.hasNext),
    friends,
    meetings,
  };
}

export async function loadMyProfilePage({ loginId, userId }) {
  const [profile, friends, postsResponse] = await Promise.all([
    profileApi.get(),
    friendApi.list(),
    communityPostApi.list({ mine: true }),
  ]);
  const friendItems = asArray(friends).map((friend) => ({
    ...friend,
    id: friend.userId,
    name: friend.nickname,
  }));
  const ownPosts = asArray(
    Array.isArray(postsResponse) ? postsResponse : (postsResponse.posts ?? postsResponse.content),
  ).map(toCommunityPost);
  const totalPostCount = Number(postsResponse?.totalCount ?? ownPosts.length);

  const result = {
    profile: {
      ...toProfile(profile, friendItems.length, loginId, totalPostCount),
      userId: profile.userId ?? userId ?? null,
    },
    friends: friendItems,
    posts: ownPosts,
    postsHasNext: Boolean(postsResponse?.hasNext),
  };

  // 탭을 바꿀 때 다시 불러오지 않도록 모임도 함께 가져옵니다.
  const response = await meetingApi.mine();
  result.meetings = asArray(
    Array.isArray(response) ? response : (response?.meetings ?? response?.content),
  ).map(toMeetingCard);

  return result;
}
