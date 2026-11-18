import {
  authApi,
  clearTokens,
  connectionApi,
  familyApi,
  notificationApi,
  profileApi,
  saveTokens,
  userApi,
} from '../api/client';
import { settingApiFields } from './constants';
import { takePostLoginPath } from '../utils/postLoginRedirect';

// 로그인, 가입, 프로필, 계정 설정처럼 계정과 관련된 동작을 모아둡니다.
export default function useAccountActions({
  user,
  runAction,
  movePage,
  setAccessToken,
  setFeedback,
  setFeedbackIsError,
  setReloadKey,
}) {
  async function login({ loginId, password }) {
    const tokens = await authApi.login(loginId, password);
    saveTokens(tokens);
    setAccessToken(tokens.accessToken);
    setFeedback('로그인했습니다.');
    setFeedbackIsError(false);
    setReloadKey((value) => value + 1);
    movePage(takePostLoginPath() ?? '/neighbor');
  }

  async function signup({ loginId, nickname, email, password, address, role, verificationToken }) {
    await authApi.signup({ loginId, nickname, email, password, address, role, verificationToken });

    const tokens = await authApi.login(loginId, password);
    saveTokens(tokens);
    setAccessToken(tokens.accessToken);
    setReloadKey((value) => value + 1);

    setFeedback('회원가입이 완료되었습니다. 어르신 계정에서 보호자를 연결할 수 있습니다.');
    setFeedbackIsError(false);
    movePage(takePostLoginPath() ?? '/neighbor');
  }

  // 어르신 계정은 POST /api/connect 로 보호자 이메일만 보내 보호자를 바로 연결합니다.
  // (/api/connections/request 는 어르신 이메일 검증 때문에 어르신 계정에서 400을 반환합니다.)
  async function connectGuardian(guardianEmail) {
    return runAction(() => familyApi.connect(guardianEmail), '보호자를 연결했습니다.');
  }

  // 보호자 계정은 POST /api/connections/request 로 어르신 이메일(seniorEmail)을 보내 연결을 요청합니다.
  async function requestSenior(seniorEmail) {
    return runAction(
      () => connectionApi.requestSenior(seniorEmail),
      '어르신에게 연결 요청을 보냈습니다.',
    );
  }

  async function acceptFamilyConnection(connectionId) {
    return runAction(
      () => connectionApi.accept(connectionId),
      '연결 요청을 수락했습니다.',
    );
  }

  async function rejectFamilyConnection(connectionId) {
    return runAction(
      () => connectionApi.remove(connectionId),
      '연결 요청을 거절했습니다.',
    );
  }

  async function disconnectFamily(connection) {
    const connectionId = typeof connection === 'object' ? connection?.connectionId : null;
    const loginId = typeof connection === 'string' ? connection : connection?.loginId;
    return runAction(
      () => (connectionId ? connectionApi.remove(connectionId) : familyApi.disconnect(loginId)),
      '가족 연결을 해제했습니다.',
    );
  }

  async function updateProfile(updatedProfile) {
    return runAction(async () => {
      const profileImage =
        updatedProfile.profileImage instanceof File ? updatedProfile.profileImage : null;
      const response = await profileApi.update(
        {
          nickname: updatedProfile.nickname ?? updatedProfile.id ?? user.loginId,
          bio: updatedProfile.bio ?? updatedProfile.introduction ?? '',
          // 기본 사진으로 되돌릴 때는 사진 주소를 비워서 보냅니다. (서버 지원 여부 확인 필요)
          ...(updatedProfile.resetProfileImage && !profileImage ? { profileImageUrl: '' } : {}),
        },
        profileImage,
      );
      // 수정 응답이 안내 문자열이면 프로필을 다시 읽어 서버에 저장된 값을 돌려줍니다.
      return response && typeof response === 'object' ? response : profileApi.get();
    }, '프로필을 수정했습니다.');
  }

  async function changeSetting(key, value) {
    const apiField = settingApiFields[key];

    if (!apiField) {
      setFeedback('서버에서 아직 지원하지 않는 설정입니다.');
      setFeedbackIsError(true);
      return;
    }

    await runAction(
      () => notificationApi.updateSettings({ [apiField]: value }),
      '알림 설정을 저장했습니다.',
    );
  }

  async function sendRecoveryCode(email) {
    return runAction(
      () => authApi.sendEmailCode(email, true),
      '인증 코드를 이메일로 발송했습니다.',
    );
  }

  async function verifyRecoveryCode(email, code) {
    return runAction(() => authApi.verifyEmailCode(email, code), '이메일 인증이 완료되었습니다.');
  }

  async function resetPassword(email, newPassword, verificationToken) {
    return runAction(
      () => authApi.resetPassword(email, newPassword, verificationToken),
      '비밀번호를 변경했습니다.',
    );
  }

  function logout() {
    clearTokens();
    setAccessToken(null);
    setFeedback('로그아웃되었습니다.');
    setFeedbackIsError(false);
    movePage('/login');
  }

  async function deleteAccount() {
    try {
      await userApi.removeCurrent();
      clearTokens();
      setAccessToken(null);
      setFeedback('계정을 삭제했습니다.');
      setFeedbackIsError(false);
      movePage('/login');
    } catch (error) {
      setFeedback(error?.message ?? '계정을 삭제하지 못했습니다.');
      setFeedbackIsError(true);
    }
  }

  return {
    login,
    signup,
    connectGuardian,
    requestSenior,
    acceptFamilyConnection,
    rejectFamilyConnection,
    disconnectFamily,
    updateProfile,
    changeSetting,
    sendRecoveryCode,
    verifyRecoveryCode,
    resetPassword,
    logout,
    deleteAccount,
  };
}
