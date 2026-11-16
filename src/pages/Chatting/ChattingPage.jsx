import { Client } from '@stomp/stompjs';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import './ChattingPage.css';
import searchIcon from '../../assets/images/search.svg';
import profileImage from '../../assets/images/profile.png';
import { chatApi, getValidAccessToken } from '../../api/client';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Button from '../../components/common/Button/Button';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal/ConfirmationModal';

const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'wss://api.ieum.louter.site/ws/chat';

const EMPTY_CONTACTS = [];
const MESSAGE_LONG_PRESS_MS = 500;

function cancelMessagePress(pressRef) {
  clearTimeout(pressRef.current?.timer);
  pressRef.current = null;
}

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
  const [messageChanges, setMessageChanges] = useState({});
  const [messageAction, setMessageAction] = useState(null);
  const [messageActionError, setMessageActionError] = useState(null);
  const [isManagingMessage, setIsManagingMessage] = useState(false);
  const managingMessageRef = useRef(false);
  const messagePressRef = useRef(null);
  const [socketStatus, setSocketStatus] = useState('연결 중');
  const [sendError, setSendError] = useState('');
  const [isSending, setIsSending] = useState(false);
  // 서버가 알려준 안 읽은 수는 읽음 처리한 방부터 0으로 보고, 실시간으로 받은 메시지는 따로 셉니다.
  const [readRoomIds, setReadRoomIds] = useState(() => new Set());
  const [realtimeUnread, setRealtimeUnread] = useState({});
  const lastReadSentRef = useRef({});
  const selectedRoomIdRef = useRef(null);
  const isRoomVisibleRef = useRef(true);
  const sendingRef = useRef(false);
  // 모바일에서는 대화 목록을 먼저 보여 주고, 대화를 누르면 채팅창으로 넘어갑니다.
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const messagesContainerRef = useRef(null);
  const messageOptionsRef = useRef(null);
  const onChatReconnectedRef = useRef(onChatReconnected);
  useEffect(() => {
    onChatReconnectedRef.current = onChatReconnected;
  }, [onChatReconnected]);
  const firstChatContact = contactItems.find(
    (contact) => contact.roomId != null || contact.partnerId == null,
  );
  const selectedContactId = activeContactId ?? localActiveContactId ?? firstChatContact?.id ?? null;
  const selectedContact = contactItems.find((contact) => contact.id === selectedContactId);
  const roomId = selectedContact?.roomId;
  const activeMessageAction = messageAction?.roomId === roomId ? messageAction : null;
  const isMessageMenuOpen = activeMessageAction?.mode === 'menu';
  useEffect(() => () => cancelMessagePress(messagePressRef), [roomId]);

  useEffect(() => {
    if (!isMessageMenuOpen) return undefined;
    const menu = messageOptionsRef.current;
    menu?.scrollIntoView({ block: 'nearest' });
    function closeOnOutsidePress(event) {
      if (menu?.contains(event.target) || event.target.closest('.chat-message-pressable[aria-expanded="true"]')) return;
      setMessageAction(null);
    }
    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      messagesContainerRef.current?.querySelector('.chat-message-pressable[aria-expanded="true"]')?.focus();
      setMessageAction(null);
    }
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMessageMenuOpen, activeMessageAction?.messageId]);
  const isContactsEmpty = contactItems.length === 0 && !isLoading && !apiError;
  const visibleContacts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    return contactItems.filter((contact) =>
      (contact.name ?? '').toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [contactItems, searchTerm]);
  const getUnreadCount = (contact) =>
    (readRoomIds.has(contact.roomId) ? 0 : (contact.unreadCount ?? 0)) +
    (realtimeUnread[contact.roomId] ?? 0);
  const selectedMessages = useMemo(() => {
    const merged = new Map();
    const selectedRoomHistory =
      messagesRoomId == null || String(messagesRoomId) === String(selectedContactId)
        ? messages
        : [];
    [
      ...(selectedRoomHistory ?? []),
      ...(realtimeThreads[selectedContactId] ?? []),
    ].forEach((message) => merged.set(String(message.id), message));
    const changes = messageChanges[selectedContactId] ?? {};
    return [...merged.values()].flatMap((message) => {
      const change = changes[message.id];
      if (change === null) return [];
      return [change ? { ...message, ...change } : message];
    });
  }, [messages, messagesRoomId, realtimeThreads, selectedContactId, messageChanges]);
  const lastVisibleMessageId = selectedMessages.at(-1)?.id;

  useEffect(() => {
    selectedRoomIdRef.current = selectedContact?.roomId ?? null;
    // 모바일에서 목록 화면이 보이는 동안에는 대화를 읽은 것으로 보지 않습니다.
    isRoomVisibleRef.current = isRoomOpen || window.matchMedia('(min-width: 769px)').matches;
  }, [selectedContact, isRoomOpen]);

  // 대화창에서 확인한 마지막 메시지까지 서버에 읽음으로 알립니다.
  useEffect(() => {
    const roomId = selectedContact?.roomId;
    if (roomId == null || !isRoomVisibleRef.current) return;

    const lastMessage = [...selectedMessages]
      .reverse()
      .find((message) => Number.isFinite(Number(message.id)));
    if (!lastMessage) return;

    const lastMessageId = Number(lastMessage.id);
    if ((lastReadSentRef.current[roomId] ?? 0) >= lastMessageId) return;
    const hasUnread = getUnreadCount(selectedContact) > 0;
    if (!hasUnread && lastMessage.sender === 'me') return;

    lastReadSentRef.current[roomId] = lastMessageId;
    chatApi
      .markRead(roomId, lastMessageId)
      .then(() => {
        setReadRoomIds((ids) => new Set(ids).add(roomId));
        setRealtimeUnread((counts) => (counts[roomId] ? { ...counts, [roomId]: 0 } : counts));
      })
      .catch(() => {
        // 실패하면 다음 메시지를 확인할 때 다시 시도합니다.
        delete lastReadSentRef.current[roomId];
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMessages, selectedContact, isRoomOpen]);

  useEffect(() => {
    const messageList = messagesContainerRef.current;
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
  }, [selectedContactId, lastVisibleMessageId]);

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
            // 보고 있지 않은 방에서 상대가 보낸 메시지는 안 읽은 수에 더합니다.
            const isViewing = selectedRoomIdRef.current === roomId && isRoomVisibleRef.current;
            if (normalized.sender === 'them' && !isViewing) {
              setRealtimeUnread((counts) => ({ ...counts, [roomId]: (counts[roomId] ?? 0) + 1 }));
            }
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
    cancelMessagePress(messagePressRef);
    setMessageAction(null);
    setMessageActionError(null);
    const contact = contactItems.find((item) => item.id === contactId);
    setIsRoomOpen(true);
    if (contact?.roomId == null && contact?.partnerId != null && onStartChat) {
      void Promise.resolve(onStartChat(contact.partnerId)).catch(() => {});
      return;
    }

    setLocalActiveContactId(contactId);
    onSelectContact?.(contact?.roomId ?? contactId);
  }

  function openMessageAction(message, mode) {
    if (roomId == null || managingMessageRef.current) return;
    setMessageActionError(null);
    setMessageAction({
      roomId,
      messageId: message.id,
      mode,
      draft: message.content ?? message.text ?? '',
    });
  }

  function startMessagePress(event, message) {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button, textarea')) return;
    cancelMessagePress(messagePressRef);
    const { clientX, clientY, pointerId } = event;
    const timer = setTimeout(() => {
      messagePressRef.current = null;
      openMessageAction(message, 'menu');
    }, MESSAGE_LONG_PRESS_MS);
    messagePressRef.current = { timer, clientX, clientY, pointerId };
  }

  function moveMessagePress(event) {
    const press = messagePressRef.current;
    if (press?.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - press.clientX, event.clientY - press.clientY) > 8) {
      cancelMessagePress(messagePressRef);
    }
  }

  async function applyMessageAction(action) {
    if (!action || managingMessageRef.current) return;
    const deleting = action.mode === 'delete';
    const content = action.draft.trim();
    if (!deleting && (!content || action.draft.length > 2000)) return;
    managingMessageRef.current = true;
    setIsManagingMessage(true);
    setMessageActionError(null);
    if (deleting) setMessageAction(null);

    try {
      let change = null;
      if (deleting) {
        await chatApi.deleteMessage(action.roomId, action.messageId);
      } else {
        const saved = await chatApi.updateMessage(action.roomId, action.messageId, content);
        change = { content: saved?.content ?? content, edited: true };
      }
      setMessageChanges((changes) => ({
        ...changes,
        [action.roomId]: { ...changes[action.roomId], [action.messageId]: change },
      }));
      setMessageAction((current) => current === action ? null : current);
    } catch (error) {
      const fallback = deleting ? '메시지를 삭제하지 못했습니다.' : '메시지를 수정하지 못했습니다.';
      const message = error.status === 403
        ? '이 메시지를 수정하거나 삭제할 권한이 없습니다.'
        : error.status === 404 || error.status === 405
          ? `${fallback} 메시지가 없거나 서버에서 이 기능을 사용할 수 없습니다.`
          : fallback;
      setMessageActionError({ roomId: action.roomId, message });
    } finally {
      managingMessageRef.current = false;
      setIsManagingMessage(false);
    }
  }

  async function submitMessage(event) {
    event.preventDefault();
    const content = messageDraft.trim();
    if (sendingRef.current || !content || !selectedContactId) return;
    sendingRef.current = true;
    setIsSending(true);

    const message = {
      id: `message-${Date.now()}`,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      if (onSendMessage) {
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
      } else {
        setLocalThreads((currentThreads) => ({
          ...currentThreads,
          [selectedContactId]: [...(currentThreads[selectedContactId] ?? []), message],
        }));
      }
      setMessageDraft('');
    } catch (error) {
      setSendError(error?.message ?? '메시지를 보내지 못했습니다.');
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
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
                {getUnreadCount(contact) > 0 && (
                  <strong
                    className="user-list-item__badge"
                    aria-label={`안 읽은 메시지 ${getUnreadCount(contact)}개`}
                  >
                    {getUnreadCount(contact) > 99 ? '99+' : getUnreadCount(contact)}
                  </strong>
                )}
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

            <div
              className="chat-messages"
              aria-live="polite"
              ref={messagesContainerRef}
              onScroll={() => cancelMessagePress(messagePressRef)}
            >
              {selectedMessages.length > 0 ? (
                selectedMessages.map((message) => {
                  const isMine = message.sender === 'me' || message.isMine;
                  const canManage = isMine && roomId != null && /^\d+$/.test(String(message.id));
                  const action = canManage && activeMessageAction?.messageId === message.id
                    ? activeMessageAction
                    : null;
                  const canPress = canManage && action?.mode !== 'edit';
                  const isMenuOpen = action?.mode === 'menu';
                  return (
                    <Fragment key={message.id}>
                      <div
                        className={`message ${isMine ? 'sent' : 'received'}${canPress ? ' chat-message-pressable' : ''}${isMenuOpen ? ' message--options-open' : ''}`}
                        role={canPress ? 'button' : undefined}
                        tabIndex={canPress ? 0 : undefined}
                        aria-expanded={canPress ? isMenuOpen : undefined}
                        aria-controls={isMenuOpen ? 'chat-message-options' : undefined}
                        onKeyDown={canPress ? (event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          if (event.repeat) return;
                          if (isMenuOpen) setMessageAction(null);
                          else openMessageAction(message, 'menu');
                        } : undefined}
                        onPointerDown={canPress ? (event) => startMessagePress(event, message) : undefined}
                        onPointerMove={canPress ? moveMessagePress : undefined}
                        onPointerUp={canPress ? () => cancelMessagePress(messagePressRef) : undefined}
                        onPointerLeave={canPress ? () => cancelMessagePress(messagePressRef) : undefined}
                        onPointerCancel={canPress ? () => cancelMessagePress(messagePressRef) : undefined}
                        onContextMenu={canPress ? (event) => event.preventDefault() : undefined}
                      >
                        {action?.mode === 'edit' ? (
                          <form className="chat-message-edit" onSubmit={(event) => {
                            event.preventDefault();
                            void applyMessageAction(action);
                          }}>
                            <textarea
                              aria-label="메시지 수정"
                              autoFocus
                              rows={3}
                              maxLength={2000}
                              value={action.draft}
                              disabled={isManagingMessage}
                              onChange={(event) => setMessageAction({ ...action, draft: event.target.value })}
                              onKeyDown={(event) => {
                                if (event.key === 'Escape' && !isManagingMessage) setMessageAction(null);
                              }}
                            />
                            <div className="chat-message-actions">
                              <Button disabled={isManagingMessage} onClick={() => setMessageAction(null)}>취소</Button>
                              <Button
                                type="submit"
                                className="chat-message-save"
                                loading={isManagingMessage}
                                loadingText="저장 중…"
                                disabled={!action.draft.trim() || action.draft.trim() === (message.content ?? message.text)}
                              >
                                저장
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <span className="chat-message-content">{message.content ?? message.text}</span>
                            {message.edited && <small className="chat-message-edited">수정됨</small>}
                          </>
                        )}
                      </div>
                      {isMenuOpen && (
                        <div
                          className="chat-message-options"
                          id="chat-message-options"
                          ref={messageOptionsRef}
                          role="group"
                          aria-label="메시지 옵션"
                        >
                          <Button onClick={() => openMessageAction(message, 'edit')}>수정</Button>
                          <Button
                            className="chat-message-options__delete"
                            onClick={() => openMessageAction(message, 'delete')}
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </Fragment>
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
            {messageActionError && messageActionError.roomId === roomId && (
              <p className="chat-send-error" role="alert">{messageActionError.message}</p>
            )}
            {activeMessageAction?.mode === 'delete' && (
              <ConfirmationModal
                message="이 메시지를 삭제할까요? 삭제한 메시지는 복구할 수 없습니다."
                onCancel={() => setMessageAction(null)}
                onConfirm={() => void applyMessageAction(activeMessageAction)}
              />
            )}

            <form className="chat-composer" onSubmit={submitMessage}>
              <input
                aria-label="메시지 입력"
                placeholder="메시지를 입력해 주세요"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
              />
              <Button
                type="submit"
                loading={isSending}
                loadingText="전송 중..."
                disabled={!messageDraft.trim()}
              >
                전송
              </Button>
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
