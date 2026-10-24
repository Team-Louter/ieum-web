import { friendApi, meetingApi, profileApi } from '../client';
import { toMeetingCard } from '../adapters';
import { readDemoValue } from '../demoStore';
import { asArray, isOwnedBy, loadApiOrDemo } from './common';

function toProfile(profile, friendCount) {
  return {
    id: profile.nickname ?? '',
    introduction: profile.bio ?? '',
    profileImage: profile.profileImageUrl ?? '',
    postCount: 0,
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
  const friendRequest = userId
    ? loadApiOrDemo(() => friendApi.list(userId), 'friends', [], demoScope)
    : Promise.resolve(readDemoValue('friends', [], demoScope));

  const [profile, friends] = await Promise.all([profileRequest, friendRequest]);
  const friendItems = asArray(friends).map((friend) => ({
    ...friend,
    id: friend.userId,
    name: friend.nickname,
  }));
  const savedProfile = readDemoValue('profile', {}, demoScope);
  const ownPosts = asArray(readDemoValue('neighbor.posts', [], demoScope))
    .filter((post) => isOwnedBy(loginId, post));

  const result = {
    profile: { ...toProfile(profile, friendItems.length), ...savedProfile, friendCount: friendItems.length },
    friends: friendItems,
    posts: ownPosts,
  };

  if (path === '/myProfile/meetings') {
    const meetings = asArray(await loadApiOrDemo(
      () => meetingApi.list(),
      'meetings',
      [],
      demoScope,
    )).map(toMeetingCard);
    result.meetings = meetings.filter((meeting) => meeting.owner === loginId);
  }

  return result;
}
