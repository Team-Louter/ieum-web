import { chatApi, friendApi } from '../api/client';
import { isDemoFallbackError, readDemoValue, updateDemoValue } from '../api/demoStore';

// 친구 신청/수락과 친구와의 채팅 동작을 모아둡니다.
export default function useFriendActions({
  demoScope,
  user,
  runAction,
  movePage,
  setChatSelection,
  setFeedback,
  setFeedbackIsError,
  setReloadKey,
}) {
  async function sendFriendRequest(target) {
    const friend = typeof target === 'object' && target ? target : null;
    const targetId = friend?.userId ?? friend?.id ?? target;

    function saveDemoRequest() {
      updateDemoValue('friend.sentIds', (ids) => [...new Set([...ids, String(targetId)])], [], demoScope);
      updateDemoValue('friend.sentRequests', (requests) => [
        {
          id: Date.now(),
          targetId,
          loginId: friend?.loginId ?? '',
          nickname: friend?.nickname ?? '',
        },
        ...requests,
      ], [], demoScope);
    }

    if (friend?.demoOnly || !user.userId) {
      saveDemoRequest();
      setFeedback('친구 신청을 보냈습니다.');
      setFeedbackIsError(false);
      setReloadKey((current) => current + 1);
      return;
    }

    await runAction(async () => {
      try {
        await friendApi.request(targetId, user.userId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
      }
      saveDemoRequest();
    }, '친구 신청을 보냈습니다.');
  }

  async function acceptFriendRequest(friendshipId) {
    await runAction(async () => {
      try {
        await friendApi.accept(friendshipId, user.userId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        const requests = readDemoValue('friendRequests', [], demoScope);
        const acceptedFriend = requests.find((request) => (
          String(request.id ?? request.friendshipId) === String(friendshipId)
        ));

        if (acceptedFriend) {
          updateDemoValue('friends', (friends) => [...friends, acceptedFriend], [], demoScope);
        }
        updateDemoValue(
          'friendRequests',
          (items) => items.filter((request) => String(request.id ?? request.friendshipId) !== String(friendshipId)),
          [],
          demoScope,
        );
      }
    }, '친구 신청을 수락했습니다.');
  }

  async function startChat(targetUserId) {
    const room = await runAction(async () => {
      try {
        return await chatApi.createRoom(targetUserId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        const rooms = readDemoValue('chat.rooms', [], demoScope);
        const existingRoom = rooms.find((item) => String(item.partnerId) === String(targetUserId));
        if (existingRoom) return existingRoom;

        const newRoom = {
          id: Date.now(),
          partnerId: Number(targetUserId),
          name: `사용자 ${targetUserId}`,
        };
        updateDemoValue('chat.rooms', (currentRooms) => [newRoom, ...currentRooms], [], demoScope);
        return newRoom;
      }
    }, '채팅방을 열었습니다.');

    setChatSelection({ path: '/chatting', roomId: Number(room.id) });
    movePage('/chatting');
  }

  async function sendChatMessage({ contactId, message }) {
    return runAction(async () => {
      try {
        return await chatApi.sendMessage(contactId, message.content);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        const localMessage = {
          id: Date.now(),
          sender: 'me',
          senderId: user.userId,
          content: message.content,
          createdAt: new Date().toISOString(),
        };
        updateDemoValue(
          `chat.messages.${contactId}`,
          (messages) => [localMessage, ...messages],
          [],
          demoScope,
        );
        return localMessage;
      }
    }, '메시지를 보냈습니다.');
  }

  return { sendFriendRequest, acceptFriendRequest, startChat, sendChatMessage };
}
