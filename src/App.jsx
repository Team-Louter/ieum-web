import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar/Sidebar';
import LoginPage from './pages/LoginPage/LoginPage';
import { getAccessToken, userApi } from './api/client';
import { readDemoValue } from './api/demoStore';
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

const CHAT_SELECTION_STORAGE_KEY = 'ieum.chatRoomId';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, '') || '/login';
  const routeKey = getRouteKey(currentPath);
  const selectedId =
    getRouteId(currentPath) ?? location.state?.sharingId ?? location.state?.meetingId ?? null;
  const Page = pageRoutes[routeKey];

  // 앱 전체에서 여러 화면이 함께 사용하는 상태입니다.
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [reloadKey, setReloadKey] = useState(0);
  const [checkedMedicationIds, setCheckedMedicationIds] = useState([]);
  const [chatSelection, setChatSelection] = useState(() => {
    if (routeKey !== '/chatting') return { path: '', roomId: null };

    const savedRoomId = Number(window.localStorage.getItem(CHAT_SELECTION_STORAGE_KEY));
    return Number.isSafeInteger(savedRoomId) && savedRoomId > 0
      ? { path: '/chatting', roomId: savedRoomId }
      : { path: '', roomId: null };
  });
  const [feedback, setFeedbackState] = useState('');
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const [feedbackIsError, setFeedbackIsError] = useState(false);

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
    if (chatSelection.path === '/chatting' && chatSelection.roomId != null) {
      window.localStorage.setItem(CHAT_SELECTION_STORAGE_KEY, String(chatSelection.roomId));
    } else {
      window.localStorage.removeItem(CHAT_SELECTION_STORAGE_KEY);
    }
  }, [chatSelection]);

  useEffect(() => {
    if (routeKey === '/chatting') return;
    window.localStorage.removeItem(CHAT_SELECTION_STORAGE_KEY);
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
  const { data, error, loading, user } = usePageApiData({
    path: routeKey,
    selectedId,
    activeChatRoomId,
    accessToken,
    reloadKey,
    onDefaultChatRoom: selectDefaultChatRoom,
  });

  const demoScope = user.loginId || (user.userId ? String(user.userId) : 'guest');

  function movePage(pageName, options) {
    window.scrollTo(0, 0);
    navigate(pageName, options);
  }

  // API 작업의 성공/실패 알림과 데이터 새로고침을 공통 처리합니다.
  async function runAction(action, successMessage) {
    try {
      const result = await action();
      setFeedback(successMessage ?? '저장했습니다.');
      setFeedbackIsError(false);
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
    demoScope,
    user,
    runAction,
    movePage,
    setAccessToken,
    setFeedback,
    setFeedbackIsError,
    setReloadKey,
  });

  const medicationActions = useMedicationActions({
    demoScope,
    runAction,
    setCheckedMedicationIds,
  });

  const friendActions = useFriendActions({
    demoScope,
    user,
    runAction,
    movePage,
    setChatSelection,
  });

  const meetingActions = useMeetingActions({ demoScope, user, runAction, movePage });

  const postActions = usePostActions({
    demoScope,
    user,
    runAction,
    movePage,
    setFeedback,
    setFeedbackIsError,
    setReloadKey,
  });

  // 화면 컴포넌트에 전달할 데이터와 클릭 동작을 한곳에 모읍니다.
  const savedAccount = readDemoValue('account', {}, demoScope);
  const submitHandlers = {
    '/neighbor/create': postActions.createNeighborPost,
    '/market/create': postActions.createSharing,
    '/meeting/make': meetingActions.createMeeting,
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
    onLocalAccountChange: accountActions.saveLocalAccountField,
    onAccountDelete: accountActions.deleteAccountData,
    onSendRecoveryCode: accountActions.sendRecoveryCode,
    onVerifyRecoveryCode: accountActions.verifyRecoveryCode,
    onResetPassword: accountActions.resetPassword,
    currentLoginId: user.loginId,
    accountEmail: savedAccount.email || '',
    signupEmail: savedAccount.registrationEmail || user.email || savedAccount.email || '',

    profile: data.profile ?? defaultProfile,
    settings: data.settings ?? defaultSettings,
    guardians: data.guardians ?? [],
    medicationSchedule: data.medicationSchedule ?? [],
    medications: data.medications ?? [],
    guardian: data.guardian ?? defaultGuardian,
    friends: data.friends ?? [],
    friendRequests: data.friendRequests ?? [],
    posts: data.posts ?? [],
    meetings: data.meetings ?? [],
    meeting: data.meeting ?? location.state?.meeting ?? defaultMeeting,
    announcement: data.announcement ?? {},
    members: data.members ?? [],
    products: data.products ?? [],
    selectedPost: data.selectedPost ?? location.state?.post ?? defaultSelectedPost,
    contacts: data.contacts ?? [],
    activeContactId: activeChatRoomId ?? data.activeContactId,
    messagesRoomId: data.activeContactId,
    messages: data.messages ?? [],

    onSettingChange: accountActions.changeSetting,
    onMedicationCreate: medicationActions.createMedication,
    onMedicationDelete: medicationActions.deleteMedication,
    onMedicationCheck: medicationActions.checkMedication,
    checkedMedicationIds,
    role: user.role,

    onAddFriend: friendActions.sendFriendRequest,
    onSearchUsers: userApi.search,
    onAcceptFriendRequest: friendActions.acceptFriendRequest,
    onRejectFriendRequest: friendActions.rejectFriendRequest,
    onRemoveFriend: friendActions.removeFriend,
    onStartChat: friendActions.startChat,
    onSendMessage: friendActions.sendChatMessage,
    onSelectContact: selectChatRoom,
    onChatReconnected: () => setReloadKey((value) => value + 1),

    onMeetingSelect: (meeting) => movePage(`/meeting/my/detail/${meeting.id}`),
    onProductSelect: (product) =>
      movePage(`/market/feedin/${product.id}`, { state: { post: product } }),
    onLike: postActions.toggleNeighborLike,
    onSubmitComment: postActions.addNeighborComment,
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
    return <LoginPage onNavigate={movePage} onLogin={accountActions.login} />;
  }

  if (routeKey === '/guardian' && user.role !== 'ROLE_GUARDIAN') {
    return <Navigate to={accessToken ? '/neighbor' : '/login'} replace />;
  }

  return (
    <>
      {!publicRoutes.includes(routeKey) && <Sidebar role={user.role} />}
      <Page {...commonProps} />

      {loading && accessToken && <LoadingMessage />}
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

function LoadingMessage() {
  return (
    <div className="app-loading-overlay" role="status" aria-live="polite">
      <div className="app-loading-card">
        <span className="app-loading-spinner" aria-hidden="true" />
        <span>데이터 불러오는 중입니다</span>
      </div>
    </div>
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
