import { useState } from 'react';
import SettingSidebar from '../../../components/setting/SettingSidebar/SettingSidebar';
import SettingAccountPage from '../SettingAccountPage/SettingAccountPage';
import SettingFeaturePage from '../SettingFeaturePage/SettingFeaturePage';
import SettingGeneralPage from '../SettingGeneralPage/SettingGeneralPage';
import SettingGuardianPage from '../SettingGuardianPage/SettingGuardianPage';
import SettingSupportPage from '../SettingSupportPage/SettingSupportPage';
import './SettingsPage.css';

const initialSettings = {
  interactionAlert: false,
  mentionAlert: false,
  medicationAlert: true,
  guardianActivity: false,
  guardianMedication: false,
  guardianLocation: false,
};

function SettingsPage({
  guardians,
  medicationSchedule,
  onMedicationScheduleEdit,
  onMedicationCreate,
  onMedicationDelete,
  onMedicationCheck,
  checkedMedicationIds = [],
  settings: settingsFromProps,
  onSettingChange,
  onFamilyConnect,
  onFamilyAccept,
  onFamilyReject,
  onFamilyDisconnect,
  pendingConnections = [],
  role,
  currentLoginId,
  accountEmail,
  signupEmail,
  onLocalAccountChange,
  onLogout,
  onAccountDelete,
  onSendRecoveryCode,
  onVerifyRecoveryCode,
  onResetPassword,
  isLoading = false,
  apiError = '',
}) {
  const [activeSection, setActiveSection] = useState('account');
  // 모바일에서는 설정 목록을 먼저 보여 주고, 항목을 누르면 내용 화면으로 넘어갑니다.
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({});
  const settings = { ...initialSettings, ...(settingsFromProps ?? {}), ...localSettings };

  const toggle = (key) => {
    const nextValue = !settings[key];
    if (['interactionAlert', 'mentionAlert', 'guardianLocation'].includes(key)) {
      setLocalSettings((currentSettings) => ({ ...currentSettings, [key]: nextValue }));
      return;
    }
    onSettingChange?.(key, nextValue);
  };

  const pageProps = { settings, onToggle: toggle, role, isLoading, apiError };
  const pages = {
    account: (
      <SettingAccountPage
        currentLoginId={currentLoginId}
        accountEmail={accountEmail}
        onLocalAccountChange={onLocalAccountChange}
        onSendRecoveryCode={onSendRecoveryCode}
        onVerifyRecoveryCode={onVerifyRecoveryCode}
        onResetPassword={onResetPassword}
      />
    ),
    general: (
      <div className="settings-page__combined-sections">
        {role !== 'ROLE_GUARDIAN' && (
          <SettingGeneralPage
            {...pageProps}
            medicationSchedule={medicationSchedule}
            onMedicationScheduleEdit={onMedicationScheduleEdit}
            onMedicationCreate={onMedicationCreate}
            onMedicationDelete={onMedicationDelete}
            onMedicationCheck={onMedicationCheck}
            checkedMedicationIds={checkedMedicationIds}
          />
        )}
        <SettingGuardianPage
          {...pageProps}
          guardians={guardians}
          pendingConnections={pendingConnections}
          onConnect={onFamilyConnect}
          onAccept={onFamilyAccept}
          onReject={onFamilyReject}
          onDisconnect={onFamilyDisconnect}
        />
      </div>
    ),
    feature: <SettingFeaturePage />,
    support: (
      <SettingSupportPage
        accountEmail={accountEmail}
        signupEmail={signupEmail}
        currentLoginId={currentLoginId}
      />
    ),
  };

  return (
    <div className="settings-layout">
      <div className="settings-layout__main">
        <section
          className={`settings-page${isContentOpen ? ' settings-page--content-open' : ''}`}
          aria-label="설정"
        >
          <SettingSidebar
            activeSection={activeSection}
            onSelect={(sectionId) => {
              setActiveSection(sectionId);
              setIsContentOpen(true);
              window.scrollTo(0, 0);
            }}
            onLogout={onLogout}
            onAccountDelete={onAccountDelete}
          />
          <div className="settings-page__content">
            <button
              className="mobile-back-button"
              type="button"
              onClick={() => setIsContentOpen(false)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
              설정
            </button>
            {pages[activeSection]}
          </div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
