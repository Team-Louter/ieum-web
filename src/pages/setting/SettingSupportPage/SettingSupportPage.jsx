import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import './SettingSupportPage.css';

const questions = [
  {
    question: '비밀번호를 잊어버렸어요.',
    answer:
      '내 계정 메뉴에서 비밀번호 변경을 누른 뒤, 가입 이메일로 인증 코드를 받아 새 비밀번호를 설정할 수 있습니다.',
  },
  {
    question: '보호자와 어르신 계정은 어떻게 연결하나요?',
    answer:
      '어르신 계정의 보호자 설정에서 보호자의 가입 이메일로 연결 요청을 보냅니다. 보호자가 요청을 수락해야 연결되며, 연결 해제도 같은 화면에서 할 수 있습니다.',
  },
  {
    question: '복약 시간과 약 이름을 바꾸고 싶어요.',
    answer:
      '일반 설정의 복약 설정에서 약 정보를 추가하거나 삭제할 수 있습니다. 현재 서버는 등록과 삭제를 지원하며 기존 항목 수정은 지원하지 않습니다.',
  },
  {
    question: '알림을 켰는데 알림이 오지 않아요.',
    answer:
      '현재 서버에서 저장하는 알림은 복약·활동 관련 설정입니다. 게시물 상호작용·호출 알림은 이 브라우저에 저장되는 환경설정이며 실제 푸시 발송 API는 아직 연결되어 있지 않습니다.',
  },
];

function SettingSupportPage() {
  return (
    <div className="setting-page-section setting-support-page">
      <SettingItem
        title="자주 묻는 질문"
        description="이음 사용 중 자주 찾는 도움말입니다."
        className="setting-support-page__card"
      >
        <div className="setting-support-page__questions">
          {questions.map(({ question, answer }) => (
            <details key={question} className="setting-support-page__question">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </SettingItem>
    </div>
  );
}

export default SettingSupportPage;
