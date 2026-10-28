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
import {
  clearDemoScope,
  fileToDataUrl,
  isDemoFallbackError,
  readDemoValue,
  writeDemoValue,
} from '../api/demoStore';
import { settingApiFields } from './constants';

// 로그인, 가입, 프로필, 계정 설정처럼 계정과 관련된 동작을 모아둡니다.
export default function useAccountActions({
  demoScope,
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
    movePage('/neighbor');
  }

  async function signup({ loginId, nickname, email, password, address, role }) {
    await authApi.signup({ loginId, nickname, email, password, address, role });

    const savedAccount = readDemoValue('account', {}, loginId.trim());
    writeDemoValue('account', { ...savedAccount, registrationEmail: email }, loginId.trim());

    const tokens = await authApi.login(loginId, password);
    saveTokens(tokens);
    setAccessToken(tokens.accessToken);
    setReloadKey((value) => value + 1);

    setFeedback('회원가입이 완료되었습니다. 어르신 계정에서 보호자를 연결할 수 있습니다.');
    setFeedbackIsError(false);
    movePage('/neighbor');
  }

  async function connectGuardian(guardianEmail) {
    return runAction(
      () => connectionApi.requestGuardian(guardianEmail),
      '보호자에게 연결 요청을 보냈습니다.',
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
      const previousProfile = readDemoValue('profile', {}, demoScope);
      const profileImage =
        updatedProfile.profileImage instanceof File ? updatedProfile.profileImage : null;
      let serverProfile = null;

      try {
        const response = await profileApi.update(
          {
            nickname:
              updatedProfile.nickname ??
              updatedProfile.id ??
              previousProfile.nickname ??
              user.loginId,
            bio: updatedProfile.bio ?? updatedProfile.introduction ?? previousProfile.bio ?? '',
          },
          profileImage,
        );
        // 수정 응답이 안내 문자열이면 프로필을 다시 읽어 서버에 저장된 이미지 경로를 받습니다.
        serverProfile =
          response && typeof response === 'object' ? response : await profileApi.get();
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
      }

      const fallbackImage =
        profileImage && !serverProfile?.profileImageUrl
          ? await fileToDataUrl(profileImage)
          : (previousProfile.profileImageUrl ?? previousProfile.profileImage ?? '');
      const image = serverProfile?.profileImageUrl ?? fallbackImage;
      const profile = {
        ...previousProfile,
        ...serverProfile,
        nickname:
          serverProfile?.nickname ??
          updatedProfile.nickname ??
          previousProfile.nickname ??
          user.loginId,
        bio:
          serverProfile?.bio ??
          updatedProfile.bio ??
          updatedProfile.introduction ??
          previousProfile.bio ??
          '',
        profileImageUrl: image,
        id: updatedProfile.id ?? previousProfile.id,
        introduction:
          serverProfile?.bio ??
          updatedProfile.introduction ??
          updatedProfile.bio ??
          previousProfile.introduction ??
          '',
        profileImage: image,
      };

      writeDemoValue('profile', profile, demoScope);
      return profile;
    }, '프로필을 수정했습니다.');
  }

  async function changeSetting(key, value) {
    const apiField = settingApiFields[key];

    if (!apiField) {
      const currentSettings = readDemoValue('settings', {}, demoScope);
      writeDemoValue('settings', { ...currentSettings, [key]: value }, demoScope);
      setFeedback('설정을 저장했습니다.');
      setFeedbackIsError(false);
      setReloadKey((current) => current + 1);
      return;
    }

    await runAction(async () => {
      try {
        await notificationApi.updateSettings({ [apiField]: value });
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
        const currentSettings = readDemoValue('settings', {}, demoScope);
        writeDemoValue('settings', { ...currentSettings, [key]: value }, demoScope);
      }
    }, '알림 설정을 저장했습니다.');
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

  async function resetPassword(email, newPassword) {
    return runAction(() => authApi.resetPassword(email, newPassword), '비밀번호를 변경했습니다.');
  }

  function logout() {
    clearTokens();
    setAccessToken(null);
    setFeedback('로그아웃되었습니다.');
    setFeedbackIsError(false);
    movePage('/login');
  }

  function saveLocalAccountField(field, value) {
    const savedAccount = readDemoValue('account', {}, demoScope);
    writeDemoValue('account', { ...savedAccount, [field]: value }, demoScope);
    setFeedback('데모 계정 정보를 저장했습니다.');
    setFeedbackIsError(false);
    return value;
  }

  async function deleteAccount() {
    const shouldDelete = window.confirm(
      '계정을 삭제할까요? 삭제한 계정은 되돌릴 수 없습니다.',
    );
    if (!shouldDelete) return;

    try {
      await userApi.removeCurrent();
      clearDemoScope(demoScope);
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
    acceptFamilyConnection,
    rejectFamilyConnection,
    disconnectFamily,
    updateProfile,
    changeSetting,
    sendRecoveryCode,
    verifyRecoveryCode,
    resetPassword,
    logout,
    saveLocalAccountField,
    deleteAccount,
  };
}
