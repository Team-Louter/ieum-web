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

function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(initialSettings);

  const toggle = (key) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: !currentSettings[key],
    }));
  };

  const pageProps = { settings, onToggle: toggle };
  const pages = {
    account: <SettingAccountPage />,
    guardian: <SettingGuardianPage {...pageProps} />,
    general: <SettingGeneralPage {...pageProps} />,
    feature: <SettingFeaturePage />,
    notification: <SettingNotificationPage {...pageProps} />,
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
