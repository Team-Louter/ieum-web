import SettingItem from '../../setting/SettingItem/SettingItem';
import SettingSidebar from '../../setting/SettingSidebar/SettingSidebar';
import '../../../pages/setting/SettingsPage/SettingsPage.css';
import '../../../pages/AddFriend/AddFriendPage.css';
import '../../myProfile/MyProfileEditButtons/MyProfileEditButtons.css';
import '../../myProfile/MyProfileInfo/MyProfileInfo.css';
import '../../profile/ProfileInfo/ProfileInfo.css';
import '../../profile/ProfileActionButtons/ProfileActionButtons.css';
import '../../../pages/Profile/ProfilePageContent.css';
import '../../../pages/MyProfile/MyProfilePageContent.css';
import backIcon from '../../../assets/images/arrow.svg';
import Layout from '../Layout/Layout';
import LikeButton from '../../neighbor/LikeButton/LikeButton';
import CommentButton from '../../neighbor/CommentButton/CommentButton';
import dotSetting from '../../../assets/dot_setting.svg';
import '../../meeting/MeetingKebabMenu/MeetingKebabMenu.css';
import mapIcon from '../../../assets/images/mapfriend.svg';
import searchIcon from '../../../assets/images/search.svg';
import '../../../pages/Chatting/ChattingPage.css';
import '../../neighbor/PostCard/PostCard.css';
import '../../market/MarketPostCard/MarketPostCard.css';
import '../../market/MarketMyPostCard/MarketMyPostCard.css';
import '../../../pages/market/MarketMyPostPage.css';
import '../../neighbor/MyPostCard/MyPostCard.css';
import '../../../pages/Neighbor/NeighborMyPostsPage.css';
import '../../meeting/MeetingCard/MeetingCard.css';
import '../../../pages/Guardian/GuardianPage.css';
import '../../../pages/Meeting/MeetingManagementPage/MeetingManagementPage.css';
import '../../meeting/MeetingMake/MeetingInputBox.css';
import MeetingMakeOption from '../../meeting/MeetingMake/MeetingMakeOption';
import '../../../pages/Meeting/MeetingMyPage/MeetingMyPage.css';
import '../../meeting/MeetingMy/MeetingMyAnnouncement.css';
import '../../meeting/MeetingMy/MeetingMyMemberList.css';
import NotificationPageSkeleton from './NotificationSkeleton';
import PageTabNavigation from '../PageTabNavigation/PageTabNavigation';
import Skeleton from '../Skeleton/Skeleton';
import './PageSkeleton.css';

// 데이터를 불러오는 경로마다 어떤 모양의 스켈레톤을 보여줄지 정합니다.
const skeletonVariants = {
  '/neighbor': 'feed',
  '/neighbor/my': 'myGrid',
  '/market': 'grid',
  '/market/my': 'marketMy',
  '/market/feedin': 'detail',
  '/meeting': 'meetingList',
  '/meeting/my': 'meetingList',
  '/meeting/detail': 'meetingDetail',
  '/meeting/my/detail': 'meetingDetail',
  '/meeting/my/member-list': 'members',
  '/meeting/management': 'form',
  '/profile': 'userProfile',
  '/profile/meetings': 'userProfile',
  '/profile/friends': 'userProfile',
  '/myProfile': 'profile',
  '/myProfile/meetings': 'profile',
  '/myProfile/friends': 'profile',
  '/addfriend': 'addFriend',
  '/chatting': 'chat',
  '/settings': 'settings',
  '/guardian': 'guardian',
  '/notifications': 'notifications',
};

const tabbedVariants = [
  'feed',
  'myGrid',
  'marketMy',
  'grid',
  'meetingList',
  'detail',
  'meetingDetail',
  'members',
  'form',
];


const feedTabs = (base, labels, createPath) => (pathname) => [
  { label: labels[0], href: base, isActive: pathname === base },
  { label: labels[1], href: `${base}/my`, isActive: pathname.startsWith(`${base}/my`) },
  { label: labels[2], href: createPath, isActive: pathname === createPath },
];

// 실제 페이지와 같은 탭 이름·주소를 쓰므로 로딩 중에도 탭은 그대로 보입니다.
function getFixedTabs(pathname) {
  if (pathname.startsWith('/neighbor')) {
    return feedTabs('/neighbor', ['게시물 보기', '내 게시물', '게시물 만들기'], '/neighbor/create')(pathname);
  }
  if (pathname.startsWith('/market')) {
    return feedTabs('/market', ['게시물 보기', '내 게시물', '게시물 만들기'], '/market/create')(pathname);
  }
  return feedTabs('/meeting', ['모임 보기', '내 모임', '모임 만들기'], '/meeting/make')(pathname);
}

function getProfileTabs(pathname) {
  return [
    { label: '내 게시물', href: '/myProfile', isActive: pathname === '/myProfile' },
    { label: '내 모임', href: '/myProfile/meetings', isActive: pathname === '/myProfile/meetings' },
    { label: '내 친구', href: '/myProfile/friends', isActive: pathname === '/myProfile/friends' },
  ];
}

/** 다른 사용자 프로필 탭은 주소 뒤의 ?userId=번호를 그대로 이어 붙입니다. */
function getUserProfileTabs(pathname, search = '') {
  return [
    { label: '게시물', href: `/profile${search}`, isActive: pathname === '/profile' },
    { label: '모임', href: `/profile/meetings${search}`, isActive: pathname === '/profile/meetings' },
    { label: '친구', href: `/profile/friends${search}`, isActive: pathname === '/profile/friends' },
  ];
}

const noop = () => {};

/** 프로필 화면의 내용 영역: 게시물은 카드 격자, 모임은 700x180 카드, 친구는 220폭 프로필 목록입니다. */
function renderProfileContent(pathname) {
  if (pathname.endsWith('/meetings')) {
    return (
      <div className="page-skeleton__profile-meetings">
        {Array.from({ length: 2 }, (_, index) => (
          <MeetingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (pathname.endsWith('/friends')) {
    return (
      <div className="page-skeleton__people page-skeleton__people--profile">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="page-skeleton__person" key={index}>
            <Skeleton circle width={50} height={50} />
            <Skeleton text width={90} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div id="content-container">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton
          key={index}
          width="100%"
          style={{ aspectRatio: '270 / 373.5', height: 'auto', borderRadius: 10 }}
        />
      ))}
    </div>
  );
}

/** 경로에 맞는 스켈레톤 종류를 돌려줍니다. 데이터를 불러오지 않는 경로는 null입니다. */
export function getSkeletonVariant(routeKey) {
  return skeletonVariants[routeKey] ?? null;
}

function TextLines({ lines = 2 }) {
  return (
    <>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} text width={index === lines - 1 ? '60%' : '100%'} />
      ))}
    </>
  );
}

/** 모임 카드 한 장의 로딩 모습입니다. 실제 MeetingCard의 클래스를 그대로 씁니다. */
function MeetingCardSkeleton() {
  return (
    <div className="meeting-card" aria-hidden="true">
      <Skeleton className="meeting-card-img" width={150} height={150} />
      <div className="meeting-card-info">
        <Skeleton text width={160} height={29} />
        <Skeleton text width={260} height={22} />
        <Skeleton text width={120} height={22} />
      </div>
    </div>
  );
}

/** 보호자 화면: 실제 화면의 클래스(배너, 복약 알림 카드, 위치 카드, 지도)를 그대로 써서 크기를 맞춥니다. */
function GuardianSkeleton({ status }) {
  return (
    <Layout className="guardian-layout">
      <section className="guardian-page" {...status}>
        <div className="guardian-page__content guardian-page__content--elder-tabs">
          <div className="guardian-page__elder-tabs">
            <Skeleton width={71} height={38} style={{ borderRadius: 999 }} />
            <Skeleton width={74} height={38} style={{ borderRadius: 999 }} />
            <Skeleton width={74} height={38} style={{ borderRadius: 999 }} />
          </div>
          <section className="guardian-status-banner">
            <Skeleton text width="45%" height={32} style={{ margin: '0 auto' }} />
            <Skeleton text width="65%" height={40} style={{ margin: '0 auto' }} />
          </section>
          <div className="guardian-page__summary">
            <section className="guardian-info-card guardian-medication-list">
              <h2 className="guardian-medication-list__title">복약 알림</h2>
              <div className="guardian-medication-list__items">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="guardian-medication-list__item" key={index}>
                    <Skeleton
                      width={108}
                      height="calc(var(--font-size-small) * 1.25 + 10px)"
                      style={{ borderRadius: 999 }}
                    />
                    <Skeleton text width={140} />
                  </div>
                ))}
              </div>
            </section>
            <section className="guardian-info-card guardian-location-status">
              <div className="guardian-location-status__heading">
                <Skeleton text width={200} height={24} />
                <button className="guardian-location-status__refresh" type="button" disabled>
                  새로고침
                </button>
              </div>
              <p className="guardian-location-status__address">
                <img src={mapIcon} alt="" />
                <Skeleton text width="70%" height={24} />
              </p>
              <Skeleton text width="55%" height={26} />
            </section>
          </div>
          <div className="guardian-page__map">
            <Skeleton width="100%" height="100%" style={{ borderRadius: 0 }} />
          </div>
        </div>
      </section>
    </Layout>
  );
}

/** 회원 목록(제목줄 29 + 220x82 프로필): 실제 MeetingMyMemberList와 같은 클래스를 씁니다. */
function MemberListSkeleton() {
  return (
    <div className="member-list-container">
      <div>
        <div className="member-header">
          <p className="member-title">
            <Skeleton text width={90} height={29} />
          </p>
          <button className="member-more" type="button" disabled>
            더보기
          </button>
        </div>
      </div>
      <div className="member-list">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="page-skeleton__person" key={index}>
            <Skeleton circle width={50} height={50} />
            <Skeleton text width={90} />
          </div>
        ))}
      </div>
    </div>
  );
}

function renderVariant(variant) {
  switch (variant) {
    case 'feed':
      // 이웃마당 게시물: 실제 PostCard와 같은 클래스·구조 (프로필 줄 40, 영상 522, 반응 줄 28, 본문 58)
      return Array.from({ length: 3 }, (_, index) => (
        <div className="content-container" key={index}>
          <div className="content-profile-container">
            <div>
              <Skeleton circle width={40} height={40} />
              <Skeleton text width={35} height={24} />
            </div>
            <a href="/profile" tabIndex={-1}>
              <p>프로필 보기</p>
            </a>
          </div>
          <Skeleton className="content-video" />
          <div className="content-info-icon-container">
            <LikeButton likeCount={0} />
            <CommentButton />
          </div>
          <div className="content-info-p">
            <Skeleton text width="100%" height={24} />
            <Skeleton text width="60%" height={24} />
          </div>
        </div>
      ));
    case 'myGrid':
      // 이웃마당 내 게시물: 실제 .my-content-grid / .my-content (3열, 비율 270:373.5)
      return (
        <div className="my-content-grid">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="my-content"
              width="100%"
              style={{ height: 'auto', borderRadius: 10 }}
            />
          ))}
        </div>
      );
    case 'marketMy':
      // 중고장터 내 게시물: 실제 #post-card-list / .market-my-post-card (사진, 정보 3줄, 버튼 3개)
      return (
        <div id="post-card-list">
          {Array.from({ length: 3 }, (_, index) => (
            <article className="market-my-post-card" key={index} aria-hidden="true">
              <div className="market-my-post-card__image">
                <Skeleton width="100%" height="100%" style={{ borderRadius: 0 }} />
              </div>
              <div className="market-my-post-card__info">
                <Skeleton text width="80%" height={24} />
                <Skeleton text width="50%" height={24} />
                <Skeleton text width="60%" height={24} />
              </div>
              <div className="market-my-post-card__button-container">
                <button type="button" disabled>
                  거래완료 처리
                </button>
                <button type="button" disabled>
                  수정하기
                </button>
                <button type="button" disabled>
                  삭제하기
                </button>
              </div>
            </article>
          ))}
        </div>
      );
    case 'grid':
      // 중고장터 카드: 실제 MarketPostCard와 같은 클래스 (270 폭, 사진 250x250, 정보 3줄 82)
      return (
        <div className="page-skeleton__grid">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="market-post-card" key={index} aria-hidden="true">
              <div className="market-post-card__image">
                <Skeleton width="100%" height="100%" style={{ borderRadius: 0 }} />
              </div>
              <div className="market-post-card__info">
                <Skeleton text width="80%" height={24} />
                <Skeleton text width="50%" height={24} />
                <Skeleton text width="60%" height={24} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'meetingList':
      // 모임 카드: 실제 MeetingCard와 같은 클래스 (700 폭, 안쪽 여백 15, 사진 150x150, 테두리 없음)
      return Array.from({ length: 4 }, (_, index) => <MeetingCardSkeleton key={index} />);
    case 'detail':
      // 중고장터 상세: 폭 900, 뒤로가기 35 / 이미지 400x400 + 글 / 판매자 75, 간격 30
      return (
        <div className="page-skeleton__detail">
          <div className="page-skeleton__back" aria-hidden="true">
            <img src={backIcon} alt="" />
            <span>뒤로가기</span>
          </div>
          <div className="page-skeleton__detail-main">
            <Skeleton width={400} height={400} />
            <div className="page-skeleton__detail-info">
              <div className="page-skeleton__column">
                <Skeleton text width="70%" height={29} />
                <Skeleton text width="35%" height={29} />
                <Skeleton text width="90%" />
              </div>
              <Skeleton width="100%" height={50} style={{ borderRadius: 8 }} />
            </div>
          </div>
          <div className="page-skeleton__row">
            <Skeleton circle width={75} height={75} />
            <div className="page-skeleton__column">
              <Skeleton text width={148} height={29} />
              <Skeleton text width={100} height={24} />
            </div>
          </div>
        </div>
      );
    case 'meetingDetail':
      // 모임 상세: 실제 MeetingMyPage와 같은 클래스 (카드 180, 구분선 2, 공지, 구분선 2, 회원 목록, 간격 50)
      return (
        <div className="contents-layout">
          <div className="meeting-my-card">
            <div className="meeting-my-contents">
              <Skeleton className="meeting-card-img" width={150} height={150} />
              <div className="meeting-card-info">
                <Skeleton text width={160} height={29} />
                <Skeleton text width={260} height={22} />
                <Skeleton text width={120} height={22} />
                <Skeleton width={130} height={30} style={{ borderRadius: 999 }} />
              </div>
            </div>
            <div className="meeting-my-card__actions">
              <div className="meeting-card-dot-container">
                <button className="meeting-card-dot-button" type="button" disabled>
                  <img className="meeting-card-dot-setting" src={dotSetting} alt="" />
                </button>
              </div>
            </div>
          </div>
          <div className="contents-horizen" />
          <div className="Announcement-container">
            <div className="Announcement-header" style={{ minHeight: 48 }}>
              <p className="Announcement-title">공지사항</p>
            </div>
            <Skeleton width="100%" height={200} style={{ borderRadius: 10 }} />
          </div>
          <div className="contents-horizen" />
          <MemberListSkeleton />
        </div>
      );
    case 'members':
      // 모임 회원 목록: 실제와 같은 제목줄 + 프로필 목록
      return <MemberListSkeleton />;
    case 'addFriend':
      // 친구 추가: 검색줄(고정 요소, 실제 모양 그대로) 48 + 28 간격 + 프로필 목록 (폭 700)
      return (
        <>
          <div className="add-friend-toolbar">
            <div className="add-friend-search">
              <input type="search" placeholder="사용자 아이디 검색" disabled />
              <button className="add-friend-search__button" type="button" disabled>
                검색
              </button>
            </div>
            <button className="add-friend-requests-button" type="button" disabled>
              받은 친구 신청
              <span>
                <Skeleton text width={10} />
              </span>
            </button>
          </div>
          {/* 페이지 안의 검색 로딩 스켈레톤과 같은 클래스·개수를 써서 중간에 모양이 바뀌지 않게 합니다. */}
          <div className="add-friend-list add-friend-list--loading">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="add-friend-profile add-friend-profile--skeleton" key={index}>
                <Skeleton circle width="50px" height="50px" />
                <Skeleton text width="110px" height="18px" />
              </div>
            ))}
          </div>
        </>
      );
    case 'form':
      // 모임 관리: 실제 화면과 같은 클래스 (사진 300x300, 입력 650x60·60·170, 옵션 2줄, 저장 버튼 60, 구분선, 회원 목록)
      return (
        <div className="meeting-management">
          <div className="meeting-management-form">
            <div className="input-container">
              <Skeleton width={300} height={300} style={{ borderRadius: 10 }} />
              <div className="meeting-input-subcontainer">
                <Skeleton width="100%" height={60} style={{ borderRadius: 10 }} />
                <Skeleton width="100%" height={60} style={{ borderRadius: 10 }} />
                <Skeleton width="100%" height={170} style={{ borderRadius: 10 }} />
              </div>
            </div>
            <div className="meeting-management-options">
              <MeetingMakeOption
                name="requireApproval"
                checked={false}
                onChange={noop}
                title="가입 승인 설정"
                desc="가입 신청을 관리자가 승인한 뒤 모임에 참여할 수 있습니다."
              />
              <MeetingMakeOption
                name="isPrivate"
                checked={false}
                onChange={noop}
                title="모임 비공개 설정"
                desc="비공개 모임은 목록에 공개되지 않습니다."
              />
            </div>
            <button className="meeting-management-save" type="button" disabled>
              변경 사항 저장
            </button>
          </div>
          <div className="meeting-management-divider" />
          <section className="meeting-management-members">
            <MemberListSkeleton />
          </section>
        </div>
      );
    case 'userProfile':
      // 다른 사용자 프로필: 실제와 같은 #profile-box(폭 916) 안에 정보 136, 버튼 60, 탭 40, 내용
      return (
        <div id="profile-box">
          <div className="profile-info">
            <Skeleton circle width={136} height={136} />
            <div className="profile-info__text">
              <Skeleton text width={160} height={38} />
              <Skeleton text width={120} height={24} />
              <Skeleton text width={160} height={22} />
            </div>
          </div>
          <div className="profile-action-buttons">
            <button type="button" disabled>
              친구 추가하기
            </button>
            <button type="button" disabled>
              채팅하기
            </button>
          </div>
          <PageTabNavigation
            ariaLabel="프로필 콘텐츠 메뉴"
            items={getUserProfileTabs(
              window.location.pathname.replace(/\/$/, ''),
              window.location.search,
            )}
          />
          {renderProfileContent(window.location.pathname.replace(/\/$/, ''))}
        </div>
      );
    case 'profile':
      // 내 프로필: 실제와 같은 #profile-box(폭 916, 간격 46) 안에 정보 136, 버튼 54, 탭 40, 내용 카드
      return (
        <div id="profile-box">
          <div className="my-profile-info">
            <Skeleton circle width={136} height={136} />
            <div className="my-profile-info__text">
              <Skeleton text width={160} height={38} />
              <Skeleton text width={120} height={24} />
              <Skeleton text width={160} height={22} />
            </div>
          </div>
          <div className="my-profile-edit-buttons">
            <button type="button" disabled>
              프로필 수정하기
            </button>
          </div>
          <PageTabNavigation
            ariaLabel="프로필 콘텐츠 메뉴"
            items={getProfileTabs(window.location.pathname.replace(/\/$/, ''))}
          />
          {renderProfileContent(window.location.pathname.replace(/\/$/, ''))}
        </div>
      );
    case 'chat':
      // 채팅: 실제 ChattingPage와 같은 클래스 (목록 350, 검색 50, 연락처 74, 대화방 머리 72, 입력줄 91)
      return (
        <>
          <div className="user-list-section">
            <div className="user-search">
              <img src={searchIcon} alt="" />
              <input type="search" placeholder="검색하기" disabled />
            </div>
            <div className="user-list">
              {Array.from({ length: 3 }, (_, index) => (
                <div className="user-list-item" key={index}>
                  <Skeleton circle width={50} height={50} />
                  <Skeleton text width={46} height={24} />
                </div>
              ))}
            </div>
          </div>
          <div className="chat-room">
            <div className="chat-room-header">
              <Skeleton circle width={50} height={50} />
              <Skeleton text width={46} height={24} />
            </div>
            <div className="chat-messages" />
            <form className="chat-composer">
              <input aria-label="메시지 입력" placeholder="메시지를 입력해 주세요" disabled />
              <button type="button" disabled>
                전송
              </button>
            </form>
          </div>
        </>
      );
    case 'settings':
    default:
      // 내 계정: 실제 SettingAccountPage와 같은 구조. 제목·버튼은 고정 글자 그대로, 아이디만 불러오는 값입니다.
      return (
        <div className="setting-page-section">
          <SettingItem
            title="아이디"
            description={<Skeleton text width={220} height={25} />}
          />
          <SettingItem
            title="비밀번호"
            description="이메일 인증 후 비밀번호를 변경할 수 있습니다."
            actionLabel="변경하기"
            onAction={noop}
          />
          <SettingItem
            title="이용약관"
            description="이음 서비스의 이용약관을 확인할 수 있습니다."
            actionLabel="확인하기"
            onAction={noop}
          />
          <SettingItem
            title="개인정보 처리방침"
            description="이음 서비스의 개인정보 처리방침을 확인할 수 있습니다."
            actionLabel="확인하기"
            onAction={noop}
          />
        </div>
      );
  }
}

// 화면마다 실제 페이지가 쓰는 바깥 틀(Layout 클래스)을 그대로 따라 위치와 여백을 맞춥니다.
const layoutClasses = {
  profile: 'profile-layout',
  userProfile: 'profile-layout',
  addFriend: 'add-friend-layout',
};

/** 페이지 데이터를 처음 불러오는 동안 실제 화면과 비슷한 모양의 회색 블록을 보여줍니다. */
function PageSkeleton({ variant, role }) {
  const hasTabs = tabbedVariants.includes(variant);
  const status = { role: 'status', 'aria-busy': true, 'aria-label': '불러오는 중' };

  if (variant === 'guardian') {
    return <GuardianSkeleton status={status} />;
  }

  if (variant === 'notifications') {
    return (
      <Layout className="notifications-layout">
        <NotificationPageSkeleton showMedication={role === 'ROLE_SENIOR'} status={status} />
      </Layout>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="chatting-page" {...status}>
        {renderVariant(variant)}
      </div>
    );
  }

  if (variant === 'settings') {
    return (
      <div className="settings-layout" {...status}>
        <div className="settings-layout__main">
          <section className="settings-page" aria-label="설정">
            <SettingSidebar
              activeSection="account"
              onSelect={noop}
              onLogout={noop}
              onAccountDelete={noop}
            />
            <div className="settings-page__content">{renderVariant(variant)}</div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <Layout className={layoutClasses[variant] ?? ''}>
      {hasTabs && (
        <PageTabNavigation
          ariaLabel="메뉴"
          isFixed
          items={getFixedTabs(window.location.pathname.replace(/\/$/, '') || '/')}
        />
      )}
      <div
        className={`page-skeleton page-skeleton--${variant}${variant === 'addFriend' ? ' add-friend-page' : ''}`}
        {...status}
      >
        {renderVariant(variant)}
      </div>
    </Layout>
  );
}

export default PageSkeleton;
