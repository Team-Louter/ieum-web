import { useEffect, useMemo, useState } from 'react';
import { resolveApiAssetUrl } from '../../api/client';
import Layout from '../../components/common/Layout/Layout';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import FriendRequestsModal from '../../components/friends/FriendRequestsModal/FriendRequestsModal';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import './AddFriendPage.css';

const pageSize = 30;
const emptyUsers = [];

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
  friendRequests = [],
  currentLoginId = '',
  currentUserId = null,
  onAddFriend,
  onSearchUsers,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onRefreshFriendRequests,
  isLoading = false,
  apiError = '',
}) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchState, setSearchState] = useState({
    query: '',
    page: 1,
    users: [],
    hasNext: false,
    loading: true,
    error: '',
  });
  const [openFriendId, setOpenFriendId] = useState(null);
  const [requestedUserIds, setRequestedUserIds] = useState(() => new Set());
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const normalizedSearchText = searchText.trim();
  const isCurrentSearch =
    searchState.query === normalizedSearchText && searchState.page === currentPage;
  const isSearching = !isCurrentSearch || searchState.loading;
  const sourceDirectory = isCurrentSearch ? searchState.users : emptyUsers;

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await onSearchUsers?.(normalizedSearchText, currentPage - 1, pageSize);
        if (!isActive) return;
        setSearchState({
          query: normalizedSearchText,
          page: currentPage,
          users: Array.isArray(result?.users)
            ? normalizedSearchText ? result.users : shuffle(result.users)
            : [],
          hasNext: Boolean(result?.hasNext),
          loading: false,
          error: '',
        });
      } catch (error) {
        if (!isActive) return;
        setSearchState({
          query: normalizedSearchText,
          page: currentPage,
          users: [],
          hasNext: false,
          loading: false,
          error: error?.message ?? '계정을 검색하지 못했습니다.',
        });
      }
    }, normalizedSearchText ? 250 : 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [normalizedSearchText, currentPage, onSearchUsers]);

  const visibleDirectory = useMemo(() => {
    const ownLoginId = normalizeId(currentLoginId);
    const ownUserId = normalizeId(currentUserId);
    const existingFriendIds = new Set(
      friends.map((friend) => normalizeId(friend.userId ?? friend.id)),
    );
    const otherAccounts = sourceDirectory.filter((friend) => {
      const isOwnLogin = ownLoginId && normalizeId(friend.loginId) === ownLoginId;
      const isOwnUser =
        ownUserId &&
        [friend.userId, friend.memberId, friend.id].some(
          (value) => normalizeId(value) === ownUserId,
        );
      const isAlreadyFriend = existingFriendIds.has(normalizeId(friend.userId ?? friend.id));
      return !isOwnLogin && !isOwnUser && !isAlreadyFriend;
    });

    return otherAccounts;
  }, [sourceDirectory, currentLoginId, currentUserId, friends]);
  const hasNextPage = isCurrentSearch && searchState.hasNext;
  const pageNumbers = [
    ...new Set(
      [1, currentPage - 1, currentPage, ...(hasNextPage ? [currentPage + 1] : [])].filter(
        (pageNumber) => pageNumber >= 1,
      ),
    ),
  ].sort((a, b) => a - b);
  const paginationItems = pageNumbers.flatMap((pageNumber, index) =>
    index > 0 && pageNumber - pageNumbers[index - 1] > 1
      ? [`ellipsis-${pageNumber}`, pageNumber]
      : [pageNumber],
  );
  const visibleFriends = isSearching ? [] : visibleDirectory;
  const isEmptyDirectory = visibleFriends.length === 0 && !isSearching && !searchState.error;

  function handleSearch(event) {
    setSearchText(event.target.value);
    setCurrentPage(1);
    setOpenFriendId(null);
  }

  async function handleAddFriend(friend) {
    try {
      const userId = friend.userId ?? friend.id;
      if (friend.isRequested || requestedUserIds.has(userId) || friend.isFriend || friend.isCurrentUser) return;
      await onAddFriend?.(friend);
      setRequestedUserIds((current) => new Set(current).add(userId));
      setOpenFriendId(null);
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
    return friend.isRequested || requestedUserIds.has(friend.userId ?? friend.id)
      ? '신청 완료'
      : '친구 추가하기';
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
        <div
          className={`add-friend-list${isSearching ? ' add-friend-list--loading' : ''}${isEmptyDirectory ? ' add-friend-list--empty' : ''}`}
        >
          {visibleFriends.map((friend) => (
            <div className="add-friend-profile" key={friend.id ?? friend.userId ?? friend.loginId}>
              <MeetingMyMemberProfile
                id={friend.loginId ?? friend.name ?? friend.nickname ?? friend.id ?? ''}
                role="회원"
                profile_image={resolveApiAssetUrl(
                  friend.profileImageUrl ?? friend.profileImage ?? friend.profile_image,
                )}
                isMenuOpen={openFriendId === (friend.id ?? friend.userId ?? friend.loginId)}
                onToggle={() =>
                  setOpenFriendId((openId) =>
                    openId === (friend.id ?? friend.userId ?? friend.loginId)
                      ? null
                      : (friend.id ?? friend.userId ?? friend.loginId),
                  )
                }
                actionItems={[friendActionLabel(friend)]}
                onAction={() => handleAddFriend(friend)}
              />
            </div>
          ))}
          {isSearching ? (
            <p className="add-friend-empty" role="status">계정을 불러오는 중입니다.</p>
          ) : searchState.error ? (
            <p className="add-friend-empty" role="alert">
              {normalizedSearchText
                ? '계정을 검색하지 못했습니다. 잠시 후 다시 시도해 주세요.'
                : '계정 목록을 불러오지 못했습니다. 아이디로 검색해 보세요.'}
            </p>
          ) : isEmptyDirectory ? (
            <EmptyState
              compact
              title={normalizedSearchText ? '검색 결과가 없어요' : '표시할 계정이 없어요'}
              description={
                normalizedSearchText
                  ? '다른 아이디로 다시 검색해 보세요.'
                  : '친구의 아이디를 검색하면 계정을 찾을 수 있어요.'
              }
            />
          ) : null
        </div>
        {!isSearching && (currentPage > 1 || hasNextPage) && (
          <nav className="add-friend-pagination" aria-label="친구 목록 페이지 이동">
            <button
              type="button"
              onClick={() => {
                setCurrentPage(currentPage - 1);
                setOpenFriendId(null);
              }}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              &lt;
            </button>
            {paginationItems.map((item) =>
              typeof item === 'string' ? (
                <span className="add-friend-pagination-gap" key={item} aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={item === currentPage ? 'is-current' : ''}
                  onClick={() => {
                    setCurrentPage(item);
                    setOpenFriendId(null);
                  }}
                  aria-label={`${item}페이지`}
                  aria-current={item === currentPage ? 'page' : undefined}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => {
                setCurrentPage(currentPage + 1);
                setOpenFriendId(null);
              }}
              disabled={!hasNextPage}
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
          isLoading={isLoading}
          apiError={apiError}
          onClose={() => setIsRequestsModalOpen(false)}
        />
      )}
    </Layout>
  );
}

export default AddFriendPage;
