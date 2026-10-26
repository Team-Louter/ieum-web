import { chatApi, friendApi, resolveApiAssetUrl } from '../client';
import { isDemoFallbackError, readDemoValue } from '../demoStore';
import { asArray, loadApiOrDemo } from './common';

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

export async function loadChatPage({ demoScope, userId, onDefaultChatRoom }) {
  if (!userId) {
    throw new Error('로그인 토큰에서 사용자 번호를 확인할 수 없습니다. 다시 로그인해 주세요.');
  }

  const roomsRequest = loadApiOrDemo(() => chatApi.rooms(), 'chat.rooms', [], demoScope).then(
    (rooms) => (Array.isArray(rooms) ? { rooms } : rooms),
  );

  const friendsRequest = friendApi.list().catch((error) => {
    if (isDemoFallbackError(error)) return readDemoValue('friends', [], demoScope);
    return [];
  });

  const [roomResponse, friends] = await Promise.all([roomsRequest, friendsRequest]);
  const friendById = new Map(asArray(friends).map((friend) => [Number(friend.userId), friend]));
  const contacts = asArray(roomResponse?.rooms)
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
        partnerId: Number(room.partnerId),
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

  onDefaultChatRoom?.(
    contacts[0]?.id ?? null,
    contacts.map((contact) => contact.id),
  );
  return { contacts };
}

export async function loadChatMessages({ roomId, demoScope, userId }) {
  const loadedData = await loadApiOrDemo(
    () => chatApi.messages(roomId),
    `chat.messages.${roomId}`,
    { messages: [] },
    demoScope,
  );
  // 데모 저장소에는 메시지 배열 자체가 저장되어 있어 API 응답 모양으로 맞춥니다.
  const response = Array.isArray(loadedData) ? { messages: loadedData } : loadedData;

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
