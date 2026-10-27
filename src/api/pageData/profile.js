import { communityPostApi, friendApi, meetingApi, profileApi, resolveApiAssetUrl } from '../client';
import { toCommunityPost, toMeetingCard } from '../adapters';
import { isDemoFallbackError, readDemoValue } from '../demoStore';
import { asArray, isOwnedBy, loadApiOrDemo } from './common';

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

export async function loadMyProfilePage({ path, demoScope, loginId, userId }) {
  const profileRequest = loadApiOrDemo(
    () => profileApi.get(),
    'profile',
    { nickname: loginId, bio: '' },
    demoScope,
  );
  const friendRequest = loadApiOrDemo(() => friendApi.list(), 'friends', [], demoScope);
  const postsRequest = communityPostApi.list({ mine: true }).catch((error) => {
    if (!isDemoFallbackError(error)) throw error;
    return null;
  });

  const [profile, friends, postsResponse] = await Promise.all([profileRequest, friendRequest, postsRequest]);
  const friendItems = asArray(friends).map((friend) => ({
    ...friend,
    id: friend.userId,
    name: friend.nickname,
  }));
  const savedProfile = readDemoValue('profile', {}, demoScope);
  const ownPosts = postsResponse
    ? asArray(
        Array.isArray(postsResponse)
          ? postsResponse
          : (postsResponse.posts ?? postsResponse.content),
      ).map(toCommunityPost)
    : asArray(readDemoValue('neighbor.posts', [], demoScope))
        .filter((post) => isOwnedBy(loginId, post))
        .map(toCommunityPost);
  const totalPostCount = postsResponse
    ? Number(postsResponse.totalCount ?? ownPosts.length)
    : ownPosts.length;

  const result = {
    profile: {
      ...toProfile(profile, friendItems.length, loginId, totalPostCount),
      ...savedProfile,
      id: loginId || savedProfile.loginId || savedProfile.id || '',
      nickname: profile.nickname ?? savedProfile.nickname ?? '',
      userId: profile.userId ?? userId ?? null,
      friendCount: friendItems.length,
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
