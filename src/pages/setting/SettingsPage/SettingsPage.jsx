import { useState } from 'react';
import SettingSidebar from '../../../components/setting/SettingSidebar/SettingSidebar';
import SettingAccountPage from '../SettingAccountPage/SettingAccountPage';
import SettingFeaturePage from '../SettingFeaturePage/SettingFeaturePage';
import SettingGeneralPage from '../SettingGeneralPage/SettingGeneralPage';
import SettingGuardianPage from '../SettingGuardianPage/SettingGuardianPage';
import SettingSupportPage from '../SettingSupportPage/SettingSupportPage';
import './SettingsPage.css';

const initialSettings = {
  darkMode: false,
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
}) {
  const [activeSection, setActiveSection] = useState('general');
  const [localSettings, setLocalSettings] = useState(() => {
    const savedSettings = {};
    ['darkMode', 'interactionAlert', 'mentionAlert', 'guardianLocation'].forEach((key) => {
      const savedValue = window.localStorage.getItem(`ieum.setting.${key}`)
        ?? (key === 'darkMode' ? window.localStorage.getItem('ieum.darkMode') : null);
      if (savedValue !== null) savedSettings[key] = savedValue === 'true';
    });
    return savedSettings;
  });
  const settings = { ...initialSettings, ...(settingsFromProps ?? {}), ...localSettings };

  const toggle = (key) => {
    const nextValue = !settings[key];
    if (['darkMode', 'interactionAlert', 'mentionAlert', 'guardianLocation'].includes(key)) {
      window.localStorage.setItem(`ieum.setting.${key}`, String(nextValue));
      if (key === 'darkMode') window.localStorage.setItem('ieum.darkMode', String(nextValue));
      setLocalSettings((currentSettings) => ({ ...currentSettings, [key]: nextValue }));
      return;
    }
    onSettingChange?.(key, nextValue);
  };

  const pageProps = { settings, onToggle: toggle, role };
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
    guardian: (
      <SettingGuardianPage
        {...pageProps}
        guardians={guardians}
      />
    ),
    general: (
      <SettingGeneralPage
        {...pageProps}
        medicationSchedule={medicationSchedule}
        onMedicationScheduleEdit={onMedicationScheduleEdit}
        onMedicationCreate={onMedicationCreate}
        onMedicationDelete={onMedicationDelete}
      />
    ),
    feature: <SettingFeaturePage />,
    support: <SettingSupportPage accountEmail={accountEmail} signupEmail={signupEmail} currentLoginId={currentLoginId} />,
  };

  return (
    <div className={`settings-layout${settings.darkMode ? ' settings-layout--dark' : ''}`}>
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
