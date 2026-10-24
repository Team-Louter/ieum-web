import { friendApi } from '../client';
import { dummyAddFriends } from '../../constants/dummy/dummyAddFriends';
import { readDemoValue } from '../demoStore';
import { asArray, loadApiOrDemo } from './common';

export async function loadAddFriendPage({ demoScope, userId }) {
  const friendsRequest = userId
    ? loadApiOrDemo(() => friendApi.list(userId), 'friends', [], demoScope)
    : Promise.resolve(readDemoValue('friends', [], demoScope));
  const requestsRequest = userId
    ? loadApiOrDemo(() => friendApi.received(userId), 'friendRequests', [], demoScope)
    : Promise.resolve(readDemoValue('friendRequests', [], demoScope));

  const [friends, requests] = await Promise.all([friendsRequest, requestsRequest]);
  const sentIds = asArray(readDemoValue('friend.sentIds', [], demoScope));

  const friendDirectory = [
    ...dummyAddFriends.map((person) => ({
      ...person,
      isRequested: sentIds.includes(String(person.userId)),
    })),
    ...asArray(friends),
  ].filter((person, index, list) => list.findIndex((candidate) => (
    String(candidate.userId ?? candidate.id) === String(person.userId ?? person.id)
  )) === index);

  return {
    friends: asArray(friends).map((friend) => ({
      ...friend,
      id: friend.userId,
      name: friend.nickname,
    })),
    friendRequests: asArray(requests),
    friendDirectory,
  };
}
