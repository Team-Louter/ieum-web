import { useState } from 'react';
import Sidebar from '../../../components/common/Sidebar/Sidebar';
import SettingSidebar from '../../../components/setting/SettingSidebar/SettingSidebar';
import SettingAccountPage from '../SettingAccountPage/SettingAccountPage';
import SettingFeaturePage from '../SettingFeaturePage/SettingFeaturePage';
import SettingGeneralPage from '../SettingGeneralPage/SettingGeneralPage';
import SettingGuardianPage from '../SettingGuardianPage/SettingGuardianPage';
import SettingNotificationPage from '../SettingNotificationPage/SettingNotificationPage';
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
  settings: settingsFromProps,
  onSettingChange,
}) {
  const [activeSection, setActiveSection] = useState('general');
  const [localSettings, setLocalSettings] = useState(initialSettings);
  const settings = { ...initialSettings, ...(settingsFromProps ?? localSettings) };

  const toggle = (key) => {
    const nextValue = !settings[key];
    if (!settingsFromProps) {
      setLocalSettings((currentSettings) => ({ ...currentSettings, [key]: nextValue }));
    }
    onSettingChange?.(key, nextValue);
  };

  const pageProps = { settings, onToggle: toggle };
  const pages = {
    account: <SettingAccountPage />,
    guardian: <SettingGuardianPage {...pageProps} guardians={guardians} />,
    general: <SettingGeneralPage {...pageProps} />,
    feature: <SettingFeaturePage />,
    notification: (
      <SettingNotificationPage
        {...pageProps}
        medicationSchedule={medicationSchedule}
        onMedicationScheduleEdit={onMedicationScheduleEdit}
      />
    ),
  };

  return (
    <div className="settings-layout">
      <Sidebar />
      <div className="settings-layout__main">
        <section className="settings-page" aria-label="설정">
          <SettingSidebar activeSection={activeSection} onSelect={setActiveSection} />
          <div className="settings-page__content">{pages[activeSection]}</div>
        </section>
      </div>
    </div>
  );
}

export default SettingsPage;
