import Layout from '../../components/common/Layout/Layout';
import KakaoMap from '../../components/friendLocation/KakaoMap/KakaoMap';
import GuardianLocationStatus from '../../components/guardian/GuardianLocationStatus';
import GuardianMedicationList from '../../components/guardian/GuardianMedicationList';
import GuardianStatusBanner from '../../components/guardian/GuardianStatusBanner';
import './GuardianPage.css';

const guardianLocation = {
  id: 'senior-user',
  nickname: '어르신',
  latitude: 35.8534,
  longitude: 128.4722,
};

const medications = [
  { id: 'morning', time: '오전 00:00', name: '복용할 약 (녹용환)', status: 'complete' },
  { id: 'noon', time: '오전 00:00', name: '복용할 약 (미복용)', status: 'missed' },
  { id: 'night', time: '오전 00:00', name: '복용할 약 (0시간 남음)', status: 'upcoming' },
];

/** 보호자가 어르신의 상태, 복약 현황, 위치를 확인하는 페이지를 표시합니다. */
function GuardianPage() {
  return (
    <Layout className="guardian-layout">
      <section className="guardian-page" aria-labelledby="guardian-page-title">
        <h1 id="guardian-page-title">보호자 기능</h1>
        <GuardianStatusBanner lastLoginText="어르신께서 2시간 전에 접속하셨습니다." message="빠르게 어르신께 연락을 드리거나 찾으러 가세요!" isWarning />

        <div className="guardian-page__summary">
          <GuardianMedicationList medications={medications} />
          <GuardianLocationStatus address="대구광역시 달성군 구지면 창리로1길 93" statusMessage="현재 어르신께서 2시간 동안 외출중 입니다." />
        </div>

        <div className="guardian-page__map" aria-label="어르신 현재 위치">
          <KakaoMap locations={[guardianLocation]} center={guardianLocation} level={5} ariaLabel="어르신 현재 위치 지도" />
          <p className="guardian-page__map-address">대구광역시 달성군 구지면 창리로1길 93</p>
        </div>
      </section>
    </Layout>
  );
}

export default GuardianPage;
