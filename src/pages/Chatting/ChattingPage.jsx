import { useMemo, useState } from 'react';
import './ChattingPage.css';
import searchIcon from '../../assets/images/search.svg';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import { dummyChatContacts, dummyChatThreads } from '../../constants/dummy/dummyChats';

const EMPTY_CONTACTS = [];

function ChattingPage({
  contacts = dummyChatContacts,
  activeContactId,
  messages,
  onSelectContact,
  onSendMessage,
}) {
  const contactItems = contacts ?? EMPTY_CONTACTS;
  const [searchTerm, setSearchTerm] = useState('');
  const [localActiveContactId, setLocalActiveContactId] = useState(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [localThreads, setLocalThreads] = useState(dummyChatThreads);
  const selectedContactId = activeContactId ?? localActiveContactId ?? contactItems[0]?.id ?? null;
  const selectedContact = contactItems.find((contact) => contact.id === selectedContactId);
  const visibleContacts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
    return contactItems.filter((contact) => (contact.name ?? '').toLocaleLowerCase().includes(normalizedSearch));
  }, [contactItems, searchTerm]);
  const selectedMessages = messages ?? localThreads[selectedContactId] ?? [];

  function selectContact(contactId) {
    setLocalActiveContactId(contactId);
    onSelectContact?.(contactId);
  }

  function submitMessage(event) {
    event.preventDefault();
    const content = messageDraft.trim();
    if (!content || !selectedContactId) return;

    const message = {
      id: `message-${Date.now()}`,
      sender: 'me',
      content,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    onSendMessage?.({ contactId: selectedContactId, message });
    if (!onSendMessage) {
      setLocalThreads((currentThreads) => ({
        ...currentThreads,
        [selectedContactId]: [...(currentThreads[selectedContactId] ?? []), message],
      }));
    }
    setMessageDraft('');
  }

  return (
    <>
    <Sidebar />

    <div className="chatting-page">

      {/* 채팅 목록 */}
      <div className="user-list-section">

        <div className="user-search">
          <img src={searchIcon} alt="검색하기" />
          <input type="search" placeholder="검색하기" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>

        <div className="user-list">
          {visibleContacts.map((contact) => (
            <button
              className={`user-list-item${contact.id === selectedContactId ? ' user-list-item--active' : ''}`}
              key={contact.id}
              type="button"
              onClick={() => selectContact(contact.id)}
            >
              <img src={contact.profileImage ?? ''} alt="" />
              <span>{contact.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 채팅창 */}
      <div className="chat-room">

        {selectedContact ? (
          <>
            <div className="chat-room-header">
              <img src={selectedContact.profileImage ?? ''} alt="" />
              <span>{selectedContact.name}</span>
            </div>

            <div className="chat-messages" aria-live="polite">
              {selectedMessages.map((message) => {
                const isMine = message.sender === 'me' || message.isMine;
                return (
                  <div className={`message ${isMine ? 'sent' : 'received'}`} key={message.id}>
                    {message.content ?? message.text}
                  </div>
                );
              })}
            </div>

            <form className="chat-composer" onSubmit={submitMessage}>
              <input
                aria-label="메시지 입력"
                placeholder="메시지를 입력해 주세요"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
              />
              <button type="submit" disabled={!messageDraft.trim()}>전송</button>
            </form>
          </>
        ) : (
          <div className="chat-room-empty">대화를 선택해 주세요.</div>
        )}

      </div>

    </div>
    </>
  );
}

export default ChattingPage;
