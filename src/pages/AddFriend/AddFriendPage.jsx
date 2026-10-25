import { useMemo, useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import FriendRequestsModal from '../../components/friends/FriendRequestsModal/FriendRequestsModal';
import './AddFriendPage.css';

const pageSize = 30;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function normalizeId(value) {
  return value == null ? '' : String(value).trim().toLowerCase();
}

function AddFriendPage({
  friends = [],
  friendDirectory = [],
  friendRequests = [],
  currentLoginId = '',
  currentUserId = null,
  onAddFriend,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onRefreshFriendRequests,
}) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFriendId, setOpenFriendId] = useState(null);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const normalizedSearchText = searchText.trim().toLowerCase();
  const sourceDirectory = Array.isArray(friendDirectory) ? friendDirectory : [];
  const visibleDirectory = useMemo(() => {
    const ownLoginId = normalizeId(currentLoginId);
    const ownUserId = normalizeId(currentUserId);
    const existingFriendIds = new Set(friends.map((friend) => (
      normalizeId(friend.userId ?? friend.id)
    )));
    const otherAccounts = sourceDirectory.filter((friend) => {
      const isOwnLogin = ownLoginId && normalizeId(friend.loginId) === ownLoginId;
      const isOwnUser = ownUserId && [friend.userId, friend.memberId, friend.id]
        .some((value) => normalizeId(value) === ownUserId);
      const isAlreadyFriend = existingFriendIds.has(normalizeId(friend.userId ?? friend.id));
      return !isOwnLogin && !isOwnUser && !isAlreadyFriend;
    });

    return shuffle(otherAccounts);
  }, [sourceDirectory, currentLoginId, currentUserId, friends]);
  const numericSearchId = /^\d+$/.test(normalizedSearchText)
    ? Number(normalizedSearchText)
    : null;
  const isOwnNumericId = numericSearchId != null
    && String(currentUserId) === String(numericSearchId);
  const filteredFriends = visibleDirectory.filter((friend) => {
    if (numericSearchId != null) {
      return String(friend.userId ?? friend.memberId ?? friend.id) === String(numericSearchId);
    }

    const searchableValues = [
      friend.loginId,
      friend.name,
      friend.nickname,
      friend.userId,
      friend.id,
    ];

    return searchableValues.some((value) => (
      String(value ?? '').toLowerCase().includes(normalizedSearchText)
    ));
  });
  const searchResults = isOwnNumericId ? [] : filteredFriends;
  const totalPages = Math.ceil(searchResults.length / pageSize);
  const page = Math.min(currentPage, totalPages || 1);
  const pageNumbers = [...new Set([
    1,
    page - 1,
    page,
    page + 1,
    totalPages,
  ].filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages))].sort((a, b) => a - b);
  const paginationItems = pageNumbers.flatMap((pageNumber, index) => (
    index > 0 && pageNumber - pageNumbers[index - 1] > 1
      ? [`ellipsis-${pageNumber}`, pageNumber]
      : [pageNumber]
  ));
  const visibleFriends = searchResults.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function handleSearch(event) {
    setSearchText(event.target.value);
    setCurrentPage(1);
    setOpenFriendId(null);
  }

  async function handleAddFriend(friend) {
    try {
      if (friend.isRequested || friend.isFriend || friend.isCurrentUser) return;
      await onAddFriend?.(friend);
    } catch {
      // App의 공통 API 오류 알림을 표시합니다.
    }
  }

  async function handleAcceptRequest(friendshipId) {
    try {
      await onAcceptFriendRequest?.(friendshipId);
    } catch {
      // App의 공통 API 오류 알림을 표시합니다.
    }
  }

  async function handleRejectRequest(friendshipId) {
    try {
      await onRejectFriendRequest?.(friendshipId);
    } catch {
      // App의 공통 API 오류 알림을 표시합니다.
    }
  }

  function friendActionLabel(friend) {
    if (friend.isCurrentUser) return '내 계정';
    if (friend.isFriend) return '이미 친구';
    return friend.isRequested ? '신청 완료' : '친구 추가하기';
  }

  return (
    <Layout className="add-friend-layout">
      <section className="add-friend-page">
        <div className="add-friend-toolbar">
          <label className="add-friend-search">
            <input
              type="search"
              value={searchText}
              onChange={handleSearch}
              placeholder="사용자 아이디 검색"
            />
          </label>
          <button
            className="add-friend-requests-button"
            type="button"
            onClick={() => {
              setIsRequestsModalOpen(true);
              onRefreshFriendRequests?.();
            }}
          >
            받은 친구 신청
            <span aria-label={`${friendRequests.length}건`}>{friendRequests.length}</span>
          </button>
        </div>
        <div className="add-friend-list">
          {visibleFriends.map((friend) => (
            <div className="add-friend-profile" key={friend.id ?? friend.userId ?? friend.loginId}>
              <MeetingMyMemberProfile
                id={friend.loginId ?? friend.name ?? friend.nickname ?? friend.id ?? ''}
                role="회원"
                profile_image={friend.profileImage ?? friend.profile_image}
                isMenuOpen={openFriendId === (friend.id ?? friend.userId ?? friend.loginId)}
                onToggle={() => setOpenFriendId((openId) => (
                  openId === (friend.id ?? friend.userId ?? friend.loginId)
                    ? null
                    : (friend.id ?? friend.userId ?? friend.loginId)
                ))}
                actionItems={[friendActionLabel(friend)]}
                onAction={() => handleAddFriend(friend)}
              />
            </div>
          ))}
          {searchResults.length === 0 && (
            <p className="add-friend-empty">
              {isOwnNumericId
                ? '내 계정은 친구 목록에 표시되지 않습니다.'
                : normalizedSearchText
                  ? '계정 검색 API가 없어 입력한 아이디의 가입 여부를 확인할 수 없습니다.'
                  : '계정 검색 API가 없어 가입 계정 목록을 표시할 수 없습니다.'}
            </p>
          )}
        </div>
        {totalPages > 1 && (
          <nav className="add-friend-pagination" aria-label="친구 목록 페이지 이동">
            <button
              type="button"
              onClick={() => {
                setCurrentPage(page - 1);
                setOpenFriendId(null);
              }}
              disabled={page === 1}
              aria-label="이전 페이지"
            >
              &lt;
            </button>
            {paginationItems.map((item) => typeof item === 'string' ? (
              <span className="add-friend-pagination-gap" key={item} aria-hidden="true">…</span>
            ) : (
              <button
                type="button"
                key={item}
                className={item === page ? 'is-current' : ''}
                onClick={() => {
                  setCurrentPage(item);
                  setOpenFriendId(null);
                }}
                aria-label={`${item}페이지`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCurrentPage(page + 1);
                setOpenFriendId(null);
              }}
              disabled={page === totalPages}
              aria-label="다음 페이지"
            >
              &gt;
            </button>
          </nav>
        )}
      </section>
      {isRequestsModalOpen && (
        <FriendRequestsModal
          requests={friendRequests}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onClose={() => setIsRequestsModalOpen(false)}
        />
      )}
    </Layout>
  );
}

export default AddFriendPage;
