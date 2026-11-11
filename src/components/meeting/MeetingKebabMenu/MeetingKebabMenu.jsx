import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetingKebabMenu.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

export default function MeetingKebabMenu({
  image,
  meeting,
  canManage = false,
  canLeave = false,
  onLeave,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  if (!canManage && !canLeave) return null;

  function manageMeeting() {
    const meetingId = meeting?.id;
    const hasNumericId = meetingId != null && /^\d+$/.test(String(meetingId));
    navigate(hasNumericId ? `/meeting/management/${meetingId}` : '/meeting/management', {
      state: { meeting },
    });
    setIsOpen(false);
  }

  return (
    <div className="meeting-card-dot-container">
      <button
        className="meeting-card-dot-button"
        type="button"
        aria-label="모임 메뉴"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img className="meeting-card-dot-setting" src={image} alt="" />
      </button>
      {isOpen && (
        <ul className="meeting-kebab-menu">
          {canManage && (
            <li>
              <button type="button" onClick={manageMeeting}>
                모임 관리하기
              </button>
            </li>
          )}
          {canLeave && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onLeave?.(meeting.id);
                }}
              >
                모임 탈퇴하기
              </button>
            </li>
          )}
          {canManage && (
            <li>
              <button
                className="meeting-kebab-menu__danger"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                모임 삭제하기
              </button>
            </li>
          )}
        </ul>
      )}
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          message="정말로 모임을 삭제하시겠습니까?"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            onDelete?.(meeting.id);
          }}
        />
      )}
    </div>
  );
}
