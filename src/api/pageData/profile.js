import { friendApi, meetingApi, profileApi, resolveApiAssetUrl } from '../client';
import { toMeetingCard } from '../adapters';
import { readDemoValue } from '../demoStore';
import { loadCommunityPosts } from './community';
import { asArray, loadApiOrDemo } from './common';

function toProfile(profile, friendCount, loginId) {
  return {
    id: loginId || profile.loginId || '',
    userId: profile.userId ?? null,
    nickname: profile.nickname ?? '',
    introduction: profile.bio ?? '',
    profileImage: resolveApiAssetUrl(profile.profileImageUrl ?? ''),
    postCount: 0,
    friendCount,
  };
}

export async function loadMyProfilePage({ path, demoScope, loginId, userId, communityPage = 0 }) {
  const profileRequest = loadApiOrDemo(
    () => profileApi.get(),
    'profile',
    { nickname: loginId, bio: '' },
    demoScope,
  );
  const friendRequest = loadApiOrDemo(() => friendApi.list(), 'friends', [], demoScope);

  const [profile, friends] = await Promise.all([profileRequest, friendRequest]);
  const friendItems = asArray(friends).map((friend) => ({
    ...friend,
    id: friend.userId,
    name: friend.nickname,
  }));
  const savedProfile = readDemoValue('profile', {}, demoScope);
  const {
    posts: ownPosts,
    hasNext,
    totalCount,
  } = await loadCommunityPosts({ mine: true, page: communityPage });

  const result = {
    profile: {
      ...toProfile(profile, friendItems.length, loginId),
      ...savedProfile,
      id: loginId || savedProfile.loginId || savedProfile.id || '',
      nickname: profile.nickname ?? savedProfile.nickname ?? '',
      userId: profile.userId ?? userId ?? null,
      friendCount: friendItems.length,
      postCount: totalCount,
    },
    friends: friendItems,
    posts: ownPosts,
    hasNext,
  };

  if (path === '/myProfile/meetings') {
    result.meetings = asArray(await meetingApi.mine()).map(toMeetingCard);
  }

  return result;
}

export async function loadOtherProfilePage({ selectedId, communityPage = 0 }) {
  if (!selectedId) throw new Error('작성자 정보가 없습니다. 게시물에서 프로필을 다시 열어 주세요.');
  const [profile, feed] = await Promise.all([
    profileApi.getUser(selectedId),
    loadCommunityPosts({ authorId: selectedId, page: communityPage }),
  ]);
  return {
    profile: {
      ...toProfile(profile, null, profile.loginId),
      postCount: feed.totalCount,
    },
    posts: feed.posts,
    hasNext: feed.hasNext,
  };
}
