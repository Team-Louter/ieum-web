import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import './AddFriendPage.css';

const friends = Array.from({ length: 47 }, (_, index) => ({
  id: index + 1,
  name: '아이디',
}));
const pageSize = 30;

function AddFriendPage() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openFriendId, setOpenFriendId] = useState(null);
  const filteredFriends = friends.filter((friend) => (
    friend.name.toLowerCase().includes(searchText.toLowerCase())
  ));
  const totalPages = Math.ceil(filteredFriends.length / pageSize);
  const visibleFriends = filteredFriends.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function handleSearch(event) {
    setSearchText(event.target.value);
    setCurrentPage(1);
    setOpenFriendId(null);
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
            <div className="add-friend-profile" key={friend.id}>
              <MeetingMyMemberProfile
                id={friend.name}
                role="회원"
                isMenuOpen={openFriendId === friend.id}
                onToggle={() => setOpenFriendId((openId) => (
                  openId === friend.id ? null : friend.id
                ))}
                actionItems={['친구 추가하기']}
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
                setCurrentPage(currentPage - 1);
                setOpenFriendId(null);
              }}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              &lt;
            </button>
            <span>{currentPage}</span>
            <span>{totalPages}</span>
            <button
              type="button"
              onClick={() => {
                setCurrentPage(currentPage + 1);
                setOpenFriendId(null);
              }}
              disabled={currentPage === totalPages}
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
