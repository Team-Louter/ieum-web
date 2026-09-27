import './MeetingCreatePage.css';
import MeetingInputBox from '../../../components/meeting/MeetingMake/MeetingInputBox';
import MeetingMakeOption from '../../../components/meeting/MeetingMake/MeetingMakeOption';
import MeetingMakeOptionSelect from '../../../components/meeting/MeetingMake/MeetingMakeOptionSelect';
import Layout from '../../../components/common/Layout/Layout';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';

export default function MeetingCreatePage() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="meeting-make-layout">
        <MeetingInputBox/>
        <div className="meeting-make-option-list">
          <MeetingMakeOption title="가입 승인 설정" desc="가입 시 관리자가 가입 승인을 해야 모임 가입이 완료 되는 설정입니다"/>
          <MeetingMakeOption title="모임 비공개 설정" desc="모임이 비공개로 전환되고 초대 링크로만 초대가 가능합니다."/>
          <MeetingMakeOptionSelect option1="개설자" option2="관리자 이상" option3="모든 회원" title="초대 링크 생성 설정" desc="모임 초대 링크 생성 권한을 설정합니다."/>
          <MeetingMakeOptionSelect option1="1일" option2="7일" option3="기한 없음" title="초대 링크 기한 기본 설정" desc="모임 초대 링크의 사용 기한을 설정합니다."/>
        </div>
        <button className="meeting-make-button">모임 만들기</button>
      </div>
    </Layout>
  )
}
