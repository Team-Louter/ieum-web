import { chatApi, friendApi, resolveApiAssetUrl } from '../client';
import { asArray } from './common';

function getRoomActivityTime(room = {}) {
  const lastActivity =
    room.lastMessageAt ??
    room.lastMessage?.createdAt ??
    room.lastMessageCreatedAt ??
    room.updatedAt ??
    room.createdAt;
  const timestamp = lastActivity ? new Date(lastActivity).getTime() : NaN;
  return Number.isFinite(timestamp) ? timestamp : null;
}

export async function loadChatPage({ userId, onDefaultChatRoom }) {
  if (!userId) {
    throw new Error('로그인 토큰에서 사용자 번호를 확인할 수 없습니다. 다시 로그인해 주세요.');
  }

  const roomsRequest = chatApi
    .rooms()
    .then((rooms) => (Array.isArray(rooms) ? { rooms } : rooms));

  const friendsRequest = friendApi.list();

  const [roomResponse, friends] = await Promise.all([roomsRequest, friendsRequest]);
  const friendById = new Map(asArray(friends).map((friend) => [Number(friend.userId), friend]));
  const roomContacts = asArray(roomResponse?.rooms)
    .slice()
    .sort((roomA, roomB) => {
      const timeA = getRoomActivityTime(roomA);
      const timeB = getRoomActivityTime(roomB);
      if (timeA != null && timeB != null && timeA !== timeB) return timeB - timeA;
      return Number(roomB.id) - Number(roomA.id);
    })
    .map((room) => {
      const friend = friendById.get(Number(room.partnerId));
      const loginId = room.partnerLoginId ?? friend?.loginId ?? '';

      return {
        id: Number(room.id),
        roomId: Number(room.id),
        partnerId: Number(room.partnerId),
        unreadCount: Math.max(Number(room.unreadCount) || 0, 0),
        loginId,
        name:
          loginId ||
          room.partnerNickname ||
          friend?.nickname ||
          room.name ||
          `사용자 ${room.partnerId}`,
        profileImage: resolveApiAssetUrl(room.partnerProfileImageUrl ?? friend?.profileImageUrl ?? ''),
      };
    });

  // 대화방이 아직 없는 친구도 목록에 보여줍니다.
  const roomPartnerIds = new Set(roomContacts.map((contact) => contact.partnerId));
  const friendContacts = asArray(friends)
    .filter((friend) => Number.isFinite(Number(friend.userId)) && !roomPartnerIds.has(Number(friend.userId)))
    .map((friend) => {
      const userId = Number(friend.userId);
      const loginId = friend.loginId ?? '';

      return {
        id: `friend-${userId}`,
        roomId: null,
        partnerId: userId,
        unreadCount: 0,
        loginId,
        name: loginId || friend.nickname || `사용자 ${userId}`,
        profileImage: resolveApiAssetUrl(friend.profileImageUrl ?? ''),
      };
    });

  const contacts = [...roomContacts, ...friendContacts];

  onDefaultChatRoom?.(
    roomContacts[0]?.id ?? null,
    roomContacts.map((contact) => contact.id),
  );
  return { contacts };
}

export async function loadChatMessages({ roomId, userId }) {
  const response = await chatApi.messages(roomId);

  const messages = asArray(response?.messages)
    .slice()
    .reverse()
    .map((message) => ({
      id: message.id,
      sender: message.sender ?? (Number(message.senderId) === userId ? 'me' : 'them'),
      content: message.content,
      time: message.createdAt
        ? new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
    }));

  return { activeContactId: Number(roomId), messages };
}
