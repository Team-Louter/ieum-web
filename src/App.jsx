import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar/Sidebar';
import PageSkeleton, { getSkeletonVariant } from './components/common/PageSkeleton/PageSkeleton';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import { profileApi, resolveApiAssetUrl, userApi } from './api/client';
import useAuthSession from './hooks/useAuthSession';
import useChatUnreadCount from './hooks/useChatUnreadCount';
import useNotifications from './hooks/useNotifications';
import usePageApiData from './hooks/usePageApiData';
import useAccountActions from './app/useAccountActions';
import useFriendActions from './app/useFriendActions';
import useMedicationActions from './app/useMedicationActions';
import useMeetingActions from './app/useMeetingActions';
import usePostActions from './app/usePostActions';
import {
  defaultGuardian,
  defaultMeeting,
  defaultProfile,
  defaultSelectedPost,
  defaultSettings,
} from './app/constants';
import { getRouteId, getRouteKey, pageRoutes, publicRoutes } from './app/routes';
import './App.css';

function AppContent({ accessToken, setAccessToken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, '') || '/login';
  const routeKey = getRouteKey(currentPath);
  // 다른 사용자 프로필은 /profile?userId=번호 형태로 열립니다.
  const profileUserId = currentPath.startsWith('/profile')
    ? Number(new URLSearchParams(location.search).get('userId')) || null
    : null;
  const selectedId =
    getRouteId(currentPath) ??
    location.state?.sharingId ??
    location.state?.meetingId ??
    profileUserId;
  const Page = pageRoutes[routeKey];

  // 앱 전체에서 여러 화면이 함께 사용하는 상태입니다.
  const [reloadKey, setReloadKey] = useState(0);
  const [chatSelection, setChatSelection] = useState({ path: '', roomId: null });
  const [feedback, setFeedbackState] = useState('');
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [sidebarProfile, setSidebarProfile] = useState({ loginId: '', image: '', nickname: '' });

  const setFeedback = useCallback((message) => {
    setFeedbackState(message);
    setFeedbackVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      setFeedbackState('');
      setFeedbackIsError(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [feedback, feedbackVersion]);

  useEffect(() => {
    if (routeKey === '/chatting') return;
    setChatSelection((current) =>
      current.path === '/chatting' ? { path: '', roomId: null } : current,
    );
  }, [routeKey]);

  const activeChatRoomId = chatSelection.path === routeKey ? chatSelection.roomId : null;

  const selectChatRoom = useCallback(
    (roomId) => {
      setChatSelection({ path: routeKey, roomId });
    },
    [routeKey],
  );

  const selectDefaultChatRoom = useCallback(
    (roomId, availableRoomIds = []) => {
      setChatSelection((current) => {
        const selectedRoomExists = availableRoomIds.some(
          (availableRoomId) => String(availableRoomId) === String(current.roomId),
        );
        if (current.path === routeKey && current.roomId != null && selectedRoomExists) {
          return current;
        }
        return { path: routeKey, roomId: roomId ?? null };
      });
    },
    [routeKey],
  );

  // 현재 화면에 필요한 API 데이터를 불러옵니다.
  // 프로필의 게시물·모임·친구 탭은 같은 데이터를 쓰므로, 탭을 바꿔도 다시 불러오지 않습니다.
  const dataPath = routeKey.startsWith('/myProfile')
    ? '/myProfile'
    : routeKey.startsWith('/profile')
      ? '/profile'
      : routeKey;
  const { data, error, loading, initialLoading, user } = usePageApiData({
    path: dataPath,
    selectedId,
    activeChatRoomId,
    accessToken,
    reloadKey,
    onDefaultChatRoom: selectDefaultChatRoom,
  });
  const notificationState = useNotifications({
    enabled: Boolean(accessToken),
    sessionKey: accessToken,
  });
  const unreadNotificationCount = notificationState.notifications.filter(
    (notification) => !(notification.read ?? notification.isRead),
  ).length;
  const { unreadCount: unreadChatCount, refreshUnreadCount } = useChatUnreadCount({
    accessToken,
    currentUserId: user.userId,
    isChatPage: routeKey === '/chatting',
  });

  useEffect(() => {
    if (!accessToken) return undefined;

    let isActive = true;
    profileApi.get().then((profile) => {
      if (isActive) {
        setSidebarProfile({
          loginId: user.loginId,
          nickname: profile?.nickname ?? '',
          image: resolveApiAssetUrl(profile?.profileImageUrl ?? ''),
        });
      }
    }).catch(() => {
      // 프로필을 불러오지 못하면 기본 사진을 보여줍니다.
    });

    return () => { isActive = false; };
  }, [accessToken, reloadKey, user.loginId]);

  function movePage(pageName, options) {
    window.scrollTo(0, 0);
    navigate(pageName, options);
  }

  // API 작업의 성공/실패 알림과 데이터 새로고침을 공통 처리합니다.
  async function runAction(action, successMessage) {
    try {
      const result = await action();
      const message =
        typeof successMessage === 'function'
          ? successMessage(result)
          : (successMessage ?? '저장했습니다.');
      // successMessage가 null이면 성공 알림(토스트)을 띄우지 않습니다.
      if (successMessage !== null) {
        setFeedback(message);
        setFeedbackIsError(false);
      }
      setReloadKey((value) => value + 1);
      return result;
    } catch (actionError) {
      setFeedback(actionError?.message ?? '요청에 실패했습니다.');
      setFeedbackIsError(true);
      throw actionError;
    }
  }

  // 각 기능별 이벤트 처리는 별도 파일에 정리했습니다.
  const accountActions = useAccountActions({
    user,
    runAction,
    movePage,
    setAccessToken,
    setFeedback,
    setFeedbackIsError,
    setReloadKey,
  });

  const medicationActions = useMedicationActions({
    runAction,
  });

  const friendActions = useFriendActions({
    runAction,
    movePage,
    setChatSelection,
  });

  const meetingActions = useMeetingActions({ runAction, movePage });

  const postActions = usePostActions({ runAction, movePage });

  // 화면 컴포넌트에 전달할 데이터와 클릭 동작을 한곳에 모읍니다.
  const submitHandlers = {
    '/neighbor/create': postActions.createNeighborPost,
    '/market/create': (values) =>
      location.state?.editPost
        ? postActions.updateSharing(location.state.editPost, values)
        : postActions.createSharing(values),
    '/meeting/make': meetingActions.createMeeting,
    '/meeting/announcement/make': (values) => meetingActions.createNotice(selectedId, values),
    '/meeting/management': (values) =>
      meetingActions.updateMeeting(
        data.meeting ?? location.state?.meeting ?? defaultMeeting,
        values,
      ),
  };

  const commonProps = {
    onNavigate: movePage,
    isLoading: loading,
    apiError: error,
    onRefreshFriendRequests: () => setReloadKey((value) => value + 1),

    onLogin: accountActions.login,
    onSignup: accountActions.signup,
    onLogout: accountActions.logout,
    onProfileUpdate: accountActions.updateProfile,
    onAccountDelete: accountActions.deleteAccount,
    onFamilyConnect: accountActions.connectGuardian,
    onRequestSenior: accountActions.requestSenior,
    onFamilyAccept: accountActions.acceptFamilyConnection,
    onFamilyReject: accountActions.rejectFamilyConnection,
    onFamilyDisconnect: accountActions.disconnectFamily,
    onSendRecoveryCode: accountActions.sendRecoveryCode,
    onVerifyRecoveryCode: accountActions.verifyRecoveryCode,
    onResetPassword: accountActions.resetPassword,
    currentLoginId: user.loginId,
    accountEmail: user.email || '',

    profile: data.profile ?? defaultProfile,
    settings: data.settings ?? defaultSettings,
    guardians: data.guardians ?? [],
    pendingConnections: data.pendingConnections ?? [],
    medicationSchedule: data.medicationSchedule ?? [],
    medications: data.medications ?? [],
    guardian: data.guardian ?? defaultGuardian,
    elders: data.elders ?? [],
    friends: data.friends ?? [],
    friendRequests: data.friendRequests ?? [],
    posts: data.posts ?? [],
    meetings: data.meetings ?? [],
    meeting: data.meeting ?? location.state?.meeting ?? defaultMeeting,
    meetingId: selectedId,
    membership: data.membership ?? null,
    announcement: data.announcement ?? {},
    notices: data.notices ?? [],
    members: data.members ?? [],
    products: data.products ?? [],
    selectedPost: data.selectedPost ?? location.state?.post ?? defaultSelectedPost,
    contacts: data.contacts ?? [],
    activeContactId: activeChatRoomId ?? data.activeContactId,
    messagesRoomId: data.activeContactId,
    messages: data.messages ?? [],
    notificationState,

    onSettingChange: accountActions.changeSetting,
    onMedicationCreate: medicationActions.createMedication,
    onMedicationDelete: medicationActions.deleteMedication,
    onMedicationCheck: medicationActions.checkMedication,
    role: user.role,

    onAddFriend: friendActions.sendFriendRequest,
    onSearchUsers: userApi.search,
    onAcceptFriendRequest: friendActions.acceptFriendRequest,
    onRejectFriendRequest: friendActions.rejectFriendRequest,
    onRemoveFriend: friendActions.removeFriend,
    onStartChat: friendActions.startChat,
    onSendMessage: friendActions.sendChatMessage,
    onSelectContact: selectChatRoom,
    onChatReconnected: () => {
      setReloadKey((value) => value + 1);
      void refreshUnreadCount();
    },
    onUnreadChange: refreshUnreadCount,

    onMeetingSelect: (meeting) => movePage(`/meeting/detail/${meeting.id}`),
    onJoin: (meetingId) => meetingActions.joinMeeting(meetingId).catch(() => {}),
    onLeave: (meetingId) => meetingActions.leaveMeeting(meetingId).catch(() => {}),
    onDelete: (meetingId) => meetingActions.deleteMeeting(meetingId).catch(() => {}),
    onMemberAction: (member, action) =>
      meetingActions.handleMemberAction(selectedId, member, action).catch(() => {}),
    onInviteCreate: () => meetingActions.createInvite(selectedId),
    onInviteLoad: meetingActions.loadInvite,
    onInviteJoin: meetingActions.joinByInvite,
    onAnnouncementCreate: (meetingId) =>
      movePage('/meeting/announcement/make', { state: { meetingId } }),
    onAnnouncementUpdate: (noticeId, values) =>
      meetingActions.updateNotice(selectedId, noticeId, values),
    onAnnouncementDelete: (noticeId) => meetingActions.deleteNotice(selectedId, noticeId),
    onAnnouncementLoad: (noticeId) => meetingActions.getNotice(selectedId, noticeId),
    onEditPost: (post) => movePage('/market/create', { state: { editPost: post } }),
    onProductSelect: (product) =>
      movePage(`/market/feedin/${product.id}`, { state: { post: product } }),
    onLike: postActions.toggleNeighborLike,
    onSubmitComment: postActions.addNeighborComment,
    onUpdatePost: postActions.updateNeighborPost,
    onUpdateComment: postActions.updateNeighborComment,
    onDeleteComment: postActions.deleteNeighborComment,
    onDeletePost:
      routeKey.startsWith('/neighbor') || routeKey.startsWith('/myProfile')
        ? postActions.deleteNeighborPost
        : postActions.deleteSharing,
    onSubmit: submitHandlers[routeKey],
    onMarkSold: postActions.markSharingComplete,
    onChat: (post) => {
      const sellerId = post?.sellerId;

      if (sellerId == null) {
        setFeedback('판매자 정보를 확인할 수 없어 채팅을 시작할 수 없습니다.');
        setFeedbackIsError(true);
        return;
      }

      if (String(sellerId) === String(user.userId)) {
        setFeedback('내 게시물에는 채팅을 시작할 수 없습니다.');
        setFeedbackIsError(true);
        return;
      }

      return friendActions.startChat(sellerId);
    },

    accessToken,
    currentUserId: user.userId,
    onRetry: () => setReloadKey((value) => value + 1),
  };

  if (!Page) {
    return <NotFoundPage onNavigate={() => movePage(accessToken ? '/neighbor' : '/login')} />;
  }

  // 로그인하지 않았다면 서비스 화면 대신 로그인 화면으로 보냅니다.
  if (!publicRoutes.includes(routeKey) && !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (routeKey === '/guardian' && user.role !== 'ROLE_GUARDIAN') {
    return <Navigate to={accessToken ? '/neighbor' : '/login'} replace />;
  }

  // 화면 데이터를 처음 불러오는 동안에는 전체를 가리는 대신 스켈레톤을 보여줍니다.
  const skeletonVariant = initialLoading && accessToken ? getSkeletonVariant(routeKey) : null;

  return (
    <>
      {!publicRoutes.includes(routeKey) && (
        <Sidebar
          role={user.role}
          profileImage={sidebarProfile.loginId === user.loginId ? sidebarProfile.image : ''}
          nickname={sidebarProfile.loginId === user.loginId ? sidebarProfile.nickname : ''}
          unreadChatCount={unreadChatCount}
          unreadNotificationCount={unreadNotificationCount}
        />
      )}
      {skeletonVariant ? <PageSkeleton variant={skeletonVariant} role={user.role} /> : <Page {...commonProps} />}
      {feedback && (
        <FeedbackMessage
          message={error || feedback}
          isError={Boolean(error || feedbackIsError)}
          onRetry={error ? () => setReloadKey((value) => value + 1) : null}
          onClose={() => {
            setFeedbackState('');
            setFeedbackIsError(false);
          }}
        />
      )}
    </>
  );
}

function FeedbackMessage({ message, isError, onRetry, onClose }) {
  const className = `app-api-notice${isError ? ' app-api-notice--error' : ''}`;

  return (
    <div className={className} role="status" aria-live="polite">
      <span className="app-api-notice__message">{message}</span>
      {onRetry && (
        <button className="app-api-notice__retry" type="button" onClick={onRetry}>
          다시 시도
        </button>
      )}
      <button
        className="app-api-notice__close"
        type="button"
        aria-label="알림 닫기"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

function SessionApp() {
  const location = useLocation();
  const session = useAuthSession();
  const path = location.pathname.replace(/\/$/, '') || '/login';
  if (!publicRoutes.includes(path)) {
    if (session.checking) return <PageSkeleton variant={getSkeletonVariant(getRouteKey(path)) ?? 'settings'} />;
    if (session.error)
      return (
        <div role="alert">
          {session.error}
          <button type="button" onClick={session.retry}>
            다시 시도
          </button>
        </div>
      );
    if (!session.accessToken) return <Navigate to="/login" replace />;
  }
  return <AppContent accessToken={session.accessToken} setAccessToken={session.setAccessToken} />;
}

function App() {
  return (
    <Router>
      <SessionApp />
    </Router>
  );
}

export default App;
