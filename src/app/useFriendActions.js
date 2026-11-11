import { chatApi, friendApi } from '../api/client';

// 친구 신청/수락과 친구와의 채팅 동작을 모아둡니다.
export default function useFriendActions({
  runAction,
  movePage,
  setChatSelection,
}) {
  async function sendFriendRequest(target) {
    const friend = typeof target === 'object' && target ? target : null;
    const targetId = friend?.userId ?? friend?.id ?? target;

    await runAction(async () => {
      await friendApi.request(targetId);
    }, '친구 신청을 보냈습니다.');
  }

  async function acceptFriendRequest(friendshipId) {
    await runAction(async () => {
      await friendApi.accept(friendshipId);
    }, '친구 신청을 수락했습니다.');
  }

  async function rejectFriendRequest(friendshipId) {
    return removeFriend(friendshipId, '친구 신청을 거절했습니다.');
  }

  async function removeFriend(friendshipId, successMessage = '친구를 삭제했습니다.') {
    await runAction(async () => {
      await friendApi.remove(friendshipId);
    }, successMessage);
  }

  async function startChat(targetUserId) {
    const room = await runAction(() => chatApi.createRoom(targetUserId), null);

    setChatSelection({ path: '/chatting', roomId: Number(room.id) });
    movePage('/chatting');
  }

  async function sendChatMessage({ contactId, message }) {
    return runAction(() => chatApi.sendMessage(contactId, message.content), null);
  }

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    startChat,
    sendChatMessage,
  };
}
