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
  const [activeSection, setActiveSection] = useState('general');
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
        <section className="settings-page" aria-label="설정">
          <SettingSidebar
            activeSection={activeSection}
            onSelect={setActiveSection}
            onLogout={onLogout}
            onAccountDelete={onAccountDelete}
          />
          <div className="settings-page__content">{pages[activeSection]}</div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
