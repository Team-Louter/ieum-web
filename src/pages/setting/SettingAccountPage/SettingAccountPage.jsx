import SettingItem from '../../../components/setting/SettingItem/SettingItem';

const accountItems = [
  { title: '아이디', description: '사용자 아이디를 확인할 수 있습니다.', actionLabel: '수정하기' },
  { title: '이메일', description: '사용자 이메일을 확인하거나 수정할 수 있습니다.', actionLabel: '수정하기' },
  { title: '비밀번호', description: '비밀번호를 확인하거나 수정할 수 있습니다.', actionLabel: '수정하기' },
  { title: '이용약관', description: '이음 서비스의 이용약관을 확인할 수 있습니다.', actionLabel: '확인하기' },
  { title: '개인정보 처리 방침', description: '이음 서비스의 개인정보 처리 방침을 확인할 수 있습니다.', actionLabel: '확인하기' },
];

function SettingAccountPage() {
  return (
    <div className="setting-page-section">
      {accountItems.map((item) => <SettingItem key={item.title} {...item} />)}
    </div>
  );
}

export default SettingAccountPage;
