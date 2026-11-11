import { friendApi } from '../client';
import { asArray } from './common';

export async function loadAddFriendPage() {
  const [friends, requests] = await Promise.all([friendApi.list(), friendApi.received()]);

  return {
    friends: asArray(friends).map((friend) => ({
      ...friend,
      id: friend.userId,
      name: friend.nickname,
    })),
    friendRequests: asArray(requests),
  };
}
