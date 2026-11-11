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

export async function loadMyProfilePage({ path, loginId, userId }) {
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
  };

  if (path === '/myProfile/meetings') {
    const response = await meetingApi.mine();
    result.meetings = asArray(
      Array.isArray(response) ? response : (response?.meetings ?? response?.content),
    ).map(toMeetingCard);
  }

  return result;
}
