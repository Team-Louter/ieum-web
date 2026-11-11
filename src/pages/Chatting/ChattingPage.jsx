import { Client } from '@stomp/stompjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import './ChattingPage.css';
import searchIcon from '../../assets/images/search.svg';
import profileImage from '../../assets/images/profile.png';
import { getValidAccessToken } from '../../api/client';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Skeleton from '../../components/common/Skeleton/Skeleton';

const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'wss://api.ieum.louter.site/ws/chat';

const EMPTY_CONTACTS = [];

function ChattingPage({
  contacts = EMPTY_CONTACTS,
  activeContactId,
  messages,
  messagesRoomId,
  onSelectContact,
  onStartChat,
  onSendMessage,
  accessToken,
  currentUserId,
  onChatReconnected,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const contactItems = contacts ?? EMPTY_CONTACTS;
  const [searchTerm, setSearchTerm] = useState('');
  const [localActiveContactId, setLocalActiveContactId] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [realtimeThreads, setRealtimeThreads] = useState({});
  const [socketStatus, setSocketStatus] = useState('연결 중');
  const [sendError, setSendError] = useState('');
  // 모바일에서는 대화 목록을 먼저 보여 주고, 대화를 누르면 채팅창으로 넘어갑니다.
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const messagesContainerRef = useRef(null);
  const onChatReconnectedRef = useRef(onChatReconnected);
  useEffect(() => {
    onChatReconnectedRef.current = onChatReconnected;
  }, [onChatReconnected]);
  const firstChatContact = contactItems.find(
    (contact) => contact.roomId != null || contact.partnerId == null,
  );
  const selectedContactId = activeContactId ?? localActiveContactId ?? firstChatContact?.id ?? null;
  const selectedContact = contactItems.find((contact) => contact.id === selectedContactId);
  const isContactsEmpty = contactItems.length === 0 && !isLoading && !apiError;
  const visibleContacts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    return contactItems.filter((contact) =>
      (contact.name ?? '').toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [contactItems, searchTerm]);
  const selectedMessages = useMemo(() => {
    const merged = new Map();
    const selectedRoomHistory =
      messagesRoomId == null || String(messagesRoomId) === String(selectedContactId)
        ? messages
        : [];
    [
      ...(selectedRoomHistory ?? []),
      ...(realtimeThreads[selectedContactId] ?? []),
    ].forEach((message) => merged.set(message.id, message));
    return [...merged.values()];
  }, [messages, messagesRoomId, realtimeThreads, selectedContactId]);

  useEffect(() => {
    const messageList = messagesContainerRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [selectedContactId, selectedMessages]);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }
    let client;
    let isMounted = true;
    client = new Client({
      brokerURL: CHAT_WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      beforeConnect: async () => {
        const validToken = await getValidAccessToken();
        if (!validToken) throw new Error('채팅 인증 토큰을 확인할 수 없습니다.');
        client.connectHeaders = { Authorization: `Bearer ${validToken}` };
      },
      onConnect: () => {
        if (!isMounted) return;
        setSocketStatus('실시간 연결됨');
        client.subscribe('/user/queue/chat', (frame) => {
          try {
            const message = JSON.parse(frame.body);
            const roomId = Number(message.roomId);
            const normalized = {
              id: message.id,
              sender: Number(message.senderId) === Number(currentUserId) ? 'me' : 'them',
              content: message.content,
              time: message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '',
            };
            setRealtimeThreads((threads) => {
              const roomMessages = threads[roomId] ?? [];
              if (roomMessages.some((item) => item.id === normalized.id)) return threads;
              return { ...threads, [roomId]: [...roomMessages, normalized] };
            });
          } catch {
            setSocketStatus('실시간 메시지를 읽지 못했습니다.');
          }
        });
        onChatReconnectedRef.current?.();
      },
      onWebSocketError: () => {
        if (isMounted) setSocketStatus('실시간 연결 대기 중');
      },
      onStompError: () => {
        if (isMounted) setSocketStatus('실시간 연결 오류');
      },
    });
    client.activate();
    return () => {
      isMounted = false;
      void client.deactivate();
    };
  }, [accessToken, currentUserId]);

  function selectContact(contactId) {
    const contact = contactItems.find((item) => item.id === contactId);
    setIsRoomOpen(true);
    if (contact?.roomId == null && contact?.partnerId != null && onStartChat) {
      void Promise.resolve(onStartChat(contact.partnerId)).catch(() => {});
      return;
    }

    setLocalActiveContactId(contactId);
    onSelectContact?.(contact?.roomId ?? contactId);
  }

  async function submitMessage(event) {
    event.preventDefault();
    const content = messageDraft.trim();
    if (!content || !selectedContactId) return;

    const message = {
      id: `message-${Date.now()}`,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    if (onSendMessage) {
      try {
        setSendError('');
        const savedMessage = await onSendMessage({ contactId: selectedContactId, message });
        const normalized = savedMessage
          ? {
              id: savedMessage.id,
              sender: Number(savedMessage.senderId) === Number(currentUserId) ? 'me' : 'them',
              content: savedMessage.content,
              time: savedMessage.createdAt
                ? new Date(savedMessage.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : message.time,
            }
          : message;
        setRealtimeThreads((threads) => ({
          ...threads,
          [selectedContactId]: [
            ...(threads[selectedContactId] ?? []).filter((item) => item.id !== normalized.id),
            normalized,
          ],
        }));
      } catch (error) {
        setSendError(error?.message ?? '메시지를 보내지 못했습니다.');
        return;
      }
    }
    setMessageDraft('');
  }

  return (
    <div className={`chatting-page${isRoomOpen ? ' chatting-page--room-open' : ''}`}>
      {/* 채팅 목록 */}
      <div className="user-list-section">
        <div className="user-search">
          <img src={searchIcon} alt="검색하기" />
          <input
            type="search"
            placeholder="검색하기"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="user-list">
          {visibleContacts.length > 0 ? (
            visibleContacts.map((contact) => (
              <button
                className={`user-list-item${contact.id === selectedContactId ? ' user-list-item--active' : ''}`}
                key={contact.id}
                type="button"
                onClick={() => selectContact(contact.id)}
              >
                <img src={contact.profileImage || profileImage} alt="" />
                <span>{contact.name}</span>
              </button>
            ))
          ) : isLoading && !apiError ? (
            Array.from({ length: 3 }, (_, index) => (
              <div className="user-list-item" key={index} aria-hidden="true">
                <Skeleton circle width={50} height={50} />
                <Skeleton text width={46} height={24} />
              </div>
            ))
          ) : !apiError ? (
            <EmptyState
              compact
              title={searchTerm.trim() ? '검색 결과가 없어요' : '대화할 친구가 없어요'}
              description={
                searchTerm.trim()
                  ? '다른 이름으로 다시 검색해 보세요.'
                  : '친구를 추가하면 이곳에서 대화를 시작할 수 있어요.'
              }
              actionLabel={!searchTerm.trim() ? '친구 추가하기' : undefined}
              onAction={!searchTerm.trim() ? () => onNavigate?.('/addfriend') : undefined}
            />
          ) : null}
        </div>
      </div>

      {/* 채팅창 */}
      <div className="chat-room">
        {selectedContact ? (
          <>
            <div className="chat-room-header">
              <button
                className="mobile-back-button mobile-back-button--chat"
                type="button"
                aria-label="대화 목록으로"
                onClick={() => setIsRoomOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <img src={selectedContact.profileImage || profileImage} alt="" />
              <span>{selectedContact.name}</span>
              {socketStatus !== '실시간 연결됨' && (
                <span className="chat-socket-status" aria-live="polite">
                  {socketStatus}
                </span>
              )}
            </div>

            <div className="chat-messages" aria-live="polite" ref={messagesContainerRef}>
              {selectedMessages.length > 0 ? (
                selectedMessages.map((message) => {
                  const isMine = message.sender === 'me' || message.isMine;
                  return (
                    <div className={`message ${isMine ? 'sent' : 'received'}`} key={message.id}>
                      {message.content ?? message.text}
                    </div>
                  );
                })
              ) : isLoading && !apiError ? (
                [
                  ['received', 180],
                  ['sent', 120],
                  ['received', 240],
                ].map(([side, width], index) => (
                  <div className={`message ${side}`} key={index} aria-hidden="true">
                    <Skeleton text width={width} height={22} />
                  </div>
                ))
              ) : !apiError ? (
                <EmptyState
                  compact
                  title="아직 대화가 없어요"
                  description="메시지를 보내 대화를 시작해 보세요."
                />
              ) : null}
            </div>
            {sendError && (
              <p className="chat-send-error" role="alert">
                {sendError}
              </p>
            )}

            <form className="chat-composer" onSubmit={submitMessage}>
              <input
                aria-label="메시지 입력"
                placeholder="메시지를 입력해 주세요"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
              />
              <button type="submit" disabled={!messageDraft.trim()}>
                전송
              </button>
            </form>
          </>
        ) : !isLoading && !apiError ? (
          <div className="chat-room-empty">
            {isContactsEmpty ? (
              <EmptyState
                title="대화할 친구가 없어요"
                description="친구를 추가하면 이곳에서 대화를 시작할 수 있어요."
                actionLabel="친구 추가하기"
                onAction={() => onNavigate?.('/addfriend')}
              />
            ) : (
              <EmptyState
                compact
                title="대화를 선택해 주세요"
                description="목록에서 친구를 선택하면 대화가 표시됩니다."
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ChattingPage;
