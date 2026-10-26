import { useState } from 'react';
import './MeetingMyAnnouncement.css';
import profileImage from '../../../assets/images/profile.png';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../common/EmptyState/EmptyState';

export default function MeetingMyAnnouncement({
  announcement = {},
  notices = [],
  meetingId,
  canManage = false,
  onCreate,
  onUpdate,
  onDelete,
  isLoading = false,
  apiError = '',
}) {
  const navigate = useNavigate();
  const [isListOpen, setIsListOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [editValues, setEditValues] = useState({ title: '', content: '' });
  const noticeItems = Array.isArray(notices) ? notices : [];
  const noticeList = noticeItems.length
    ? noticeItems
    : announcement.title
      ? [announcement]
      : [];
  const latestNotice = noticeList[0] ?? announcement;
  const author = latestNotice.author ?? {};

  function handleCreate() {
    if (onCreate) onCreate(meetingId);
    else navigate('/meeting/announcement/make', { state: { meetingId } });
  }

  function startEditing(notice) {
    setEditingNoticeId(notice.id);
    setEditValues({ title: notice.title ?? '', content: notice.content ?? '' });
  }

  async function saveEdit(event) {
    event.preventDefault();
    try {
      await onUpdate?.(editingNoticeId, editValues);
      setEditingNoticeId(null);
    } catch {
      // API 오류는 공통 알림으로 표시되며, 수정 입력은 그대로 유지합니다.
    }
  }

  async function removeNotice(notice) {
    if (!window.confirm('이 공지사항을 삭제할까요?')) return;
    try {
      await onDelete?.(notice.id);
    } catch {
      // API 오류는 공통 알림으로 표시합니다.
    }
  }

  return (
    <div className="Announcement-container">
      <div className="Announcement-header">
        <p className="Announcement-title">공지사항</p>
        <div className="Announcement-actions">
          {canManage && (
            <button className="Announcement-write" type="button" onClick={handleCreate}>
              공지 올리기
            </button>
          )}
          {noticeList.length > 0 && (
            <button
              className="Announcement-more"
              type="button"
              onClick={() => setIsListOpen(true)}
            >
              더보기
            </button>
          )}
        </div>
      </div>
      {latestNotice.title ? (
        <div className="Announcement-card">
          <div className="Announcement-card-container">
            <div className="Announcement-profile">
              <img
                src={
                  author.profileImage ||
                  author.profile_image ||
                  author.profileImageUrl ||
                  profileImage
                }
                alt="프로필 사진"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = profileImage;
                }}
              />
              <p>{author.id ?? author.nickname ?? ''}</p>
            </div>
            <p className="announcement-card-title">{latestNotice.title}</p>
            <p className="announcement-card-info">{latestNotice.content ?? ''}</p>
          </div>
        </div>
      ) : !isLoading && !apiError ? (
        <EmptyState
          compact
          className="Announcement-card--empty"
          title="등록된 공지사항이 없어요"
          description="새 공지사항을 올리면 이곳에서 확인할 수 있어요."
        />
      ) : null}

      {isListOpen && (
        <div className="announcement-dialog-backdrop" onMouseDown={() => setIsListOpen(false)}>
          <section
            className="announcement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="announcement-dialog__header">
              <h2 id="announcement-dialog-title">공지사항</h2>
              <button
                type="button"
                className="announcement-dialog__close"
                aria-label="닫기"
                onClick={() => setIsListOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="announcement-dialog__list">
              {noticeList.length > 0 ? (
                noticeList.map((notice) => (
                  <article className="announcement-dialog__item" key={notice.id ?? notice.title}>
                    {editingNoticeId === notice.id ? (
                      <form className="announcement-dialog__edit" onSubmit={saveEdit}>
                        <input
                          aria-label="공지 제목"
                          value={editValues.title}
                          required
                          onChange={(event) =>
                            setEditValues((current) => ({ ...current, title: event.target.value }))
                          }
                        />
                        <textarea
                          aria-label="공지 내용"
                          value={editValues.content}
                          required
                          onChange={(event) =>
                            setEditValues((current) => ({ ...current, content: event.target.value }))
                          }
                        />
                        <div className="announcement-dialog__item-actions">
                          <button type="submit">저장</button>
                          <button type="button" onClick={() => setEditingNoticeId(null)}>
                            취소
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3>{notice.title}</h3>
                        <p>{notice.content}</p>
                        {canManage && (
                          <div className="announcement-dialog__item-actions">
                            {onUpdate && (
                              <button type="button" onClick={() => startEditing(notice)}>
                                수정
                              </button>
                            )}
                            {onDelete && (
                              <button
                                className="announcement-dialog__delete"
                                type="button"
                                onClick={() => removeNotice(notice)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))
              ) : !isLoading && !apiError ? (
                <EmptyState
                  compact
                  title="등록된 공지사항이 없어요"
                  description="새 공지사항을 올리면 이곳에서 확인할 수 있어요."
                />
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
