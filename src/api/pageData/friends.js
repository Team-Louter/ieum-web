import { friendApi } from '../client';
import { asArray, loadApiOrDemo } from './common';

export async function loadAddFriendPage({ demoScope }) {
  const friendsRequest = loadApiOrDemo(() => friendApi.list(), 'friends', [], demoScope);
  const requestsRequest = loadApiOrDemo(
    () => friendApi.received(),
    'friendRequests',
    [],
    demoScope,
  );

  const [friends, requests] = await Promise.all([friendsRequest, requestsRequest]);

  return {
    friends: asArray(friends).map((friend) => ({
      ...friend,
      id: friend.userId,
      name: friend.nickname,
    })),
    friendRequests: asArray(requests),
  };
}
