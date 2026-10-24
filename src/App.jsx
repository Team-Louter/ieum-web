import { useCallback, useState } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar/Sidebar';
import LoginPage from './pages/LoginPage/LoginPage';
import { getAccessToken } from './api/client';
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
  const [chatSelection, setChatSelection] = useState({ path: '', roomId: null });
  const [feedback, setFeedback] = useState('');
  const [feedbackIsError, setFeedbackIsError] = useState(false);

  const activeChatRoomId = chatSelection.path === routeKey ? chatSelection.roomId : null;

  const selectChatRoom = useCallback(
    (roomId) => {
      setChatSelection({ path: routeKey, roomId });
    },
    [routeKey],
  );

  const selectDefaultChatRoom = useCallback(
    (roomId) => {
      setChatSelection((current) => {
        if (current.path === routeKey && current.roomId != null) return current;
        return { path: routeKey, roomId };
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
    setFeedback,
    setFeedbackIsError,
    setReloadKey,
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

    onLogin: accountActions.login,
    onSignup: accountActions.signup,
    onLogout: accountActions.logout,
    onProfileUpdate: accountActions.updateProfile,
    onLocalAccountChange: accountActions.saveLocalAccountField,
    onAccountDelete: accountActions.deleteAccountData,
    onSendRecoveryCode: accountActions.sendRecoveryCode,
    onVerifyRecoveryCode: accountActions.verifyRecoveryCode,
    onResetPassword: accountActions.resetPassword,
    currentLoginId: savedAccount.loginId || user.loginId,
    accountEmail: savedAccount.email || '',
    signupEmail: savedAccount.registrationEmail || user.email || savedAccount.email || '',

    profile: data.profile ?? defaultProfile,
    settings: data.settings ?? defaultSettings,
    guardians: data.guardians ?? [],
    medicationSchedule: data.medicationSchedule ?? [],
    medications: data.medications ?? [],
    guardian: data.guardian ?? defaultGuardian,
    friends: data.friends ?? [],
    friendDirectory: data.friendDirectory ?? [],
    friendRequests: data.friendRequests ?? [],
    posts: data.posts ?? [],
    meetings: data.meetings ?? [],
    meeting: data.meeting ?? defaultMeeting,
    announcement: data.announcement ?? {},
    members: data.members ?? [],
    products: data.products ?? [],
    selectedPost: data.selectedPost ?? location.state?.post ?? defaultSelectedPost,
    contacts: data.contacts ?? [],
    activeContactId: activeChatRoomId ?? data.activeContactId,
    messages: data.messages ?? [],

    onSettingChange: accountActions.changeSetting,
    onMedicationCreate: medicationActions.createMedication,
    onMedicationDelete: medicationActions.deleteMedication,
    onMedicationCheck: medicationActions.checkMedication,
    checkedMedicationIds,
    role: user.role,

    onAddFriend: friendActions.sendFriendRequest,
    onAcceptFriendRequest: friendActions.acceptFriendRequest,
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
    onChat: () => {
      setFeedback(
        '나눔 API 응답에 판매자 숫자 사용자 ID가 없어 채팅을 시작할 수 없습니다. 백엔드에서 작성자 ID를 제공해야 합니다.',
      );
      setFeedbackIsError(true);
    },

    accessToken,
    currentUserId: user.userId,
    onRetry: () => setReloadKey((value) => value + 1),
  };

  if (!Page) {
    return <LoginPage onNavigate={movePage} onLogin={accountActions.login} />;
  }

  return (
    <>
      {!publicRoutes.includes(routeKey) && <Sidebar />}
      <Page {...commonProps} />

      {loading && accessToken && <LoadingMessage />}
      {feedback && (
        <FeedbackMessage
          message={error || feedback}
          isError={Boolean(error || feedbackIsError)}
          onRetry={error ? () => setReloadKey((value) => value + 1) : null}
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

function FeedbackMessage({ message, isError, onRetry }) {
  const className = `app-api-notice${isError ? ' app-api-notice--error' : ''}`;

  return (
    <div className={className} role="status" aria-live="polite">
      {message}
      {onRetry && (
        <button type="button" onClick={onRetry}>
          다시 시도
        </button>
      )}
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
