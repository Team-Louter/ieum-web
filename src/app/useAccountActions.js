import {
  authApi,
  clearTokens,
  familyApi,
  notificationApi,
  profileApi,
  saveTokens,
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
      () => familyApi.connect(guardianEmail),
      '보호자 계정을 연결했습니다.',
    );
  }

  async function disconnectFamily(loginId) {
    return runAction(() => familyApi.disconnect(loginId), '가족 연결을 해제했습니다.');
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

  function deleteAccountData() {
    const shouldDelete = window.confirm(
      '이 브라우저에 저장된 데모 데이터와 로그인 상태를 삭제할까요? 실제 서버 계정은 삭제되지 않습니다.',
    );
    if (!shouldDelete) return;

    clearDemoScope(demoScope);
    clearTokens();
    setAccessToken(null);
    setFeedback('이 브라우저의 데모 데이터를 삭제하고 로그아웃했습니다. 서버 계정은 유지됩니다.');
    setFeedbackIsError(false);
    movePage('/login');
  }

  return {
    login,
    signup,
    connectGuardian,
    disconnectFamily,
    updateProfile,
    changeSetting,
    sendRecoveryCode,
    verifyRecoveryCode,
    resetPassword,
    logout,
    saveLocalAccountField,
    deleteAccountData,
  };
}
