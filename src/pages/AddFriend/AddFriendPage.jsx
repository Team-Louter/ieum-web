import { useMemo, useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import { dummyAddFriends } from '../../constants/dummy/dummyAddFriends';
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
  friends = dummyAddFriends,
  friendDirectory = friends,
  currentLoginId = '',
  currentUserId = null,
  onAddFriend,
}) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFriendId, setOpenFriendId] = useState(null);
  const normalizedSearchText = searchText.trim().toLowerCase();
  const sourceDirectory = Array.isArray(friendDirectory) && friendDirectory.length > 0
    ? friendDirectory
    : dummyAddFriends;
  const visibleDirectory = useMemo(() => {
    const ownLoginId = normalizeId(currentLoginId);
    const ownUserId = normalizeId(currentUserId);
    const otherAccounts = sourceDirectory.filter((friend) => {
      const isOwnLogin = ownLoginId && normalizeId(friend.loginId) === ownLoginId;
      const isOwnUser = ownUserId && [friend.userId, friend.memberId, friend.id]
        .some((value) => normalizeId(value) === ownUserId);
      return !isOwnLogin && !isOwnUser;
    });

    return shuffle(otherAccounts);
  }, [sourceDirectory, currentLoginId, currentUserId]);
  const filteredFriends = visibleDirectory.filter((friend) => {
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
  const totalPages = Math.ceil(filteredFriends.length / pageSize);
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
  const visibleFriends = filteredFriends.slice(
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
      if (friend.isRequested) return;
      await onAddFriend?.(friend);
    } catch {
      // App의 공통 API 오류 알림을 표시합니다.
    }
  }

  return (
    <Layout className="add-friend-layout">
      <section className="add-friend-page">
        <label className="add-friend-search">
          <input
            type="search"
            value={searchText}
            onChange={handleSearch}
            placeholder="검색하기"
          />
        </label>
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
                actionItems={[friend.isRequested ? '신청 완료' : '친구 추가하기']}
                onAction={() => handleAddFriend(friend)}
              />
            </div>
          ))}
          {filteredFriends.length === 0 && (
            <p className="add-friend-empty">검색 결과가 없습니다.</p>
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
    </Layout>
  );
}

export default AddFriendPage;
