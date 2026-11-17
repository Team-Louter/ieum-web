import { useState } from 'react';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import PasswordField from '../../components/auth/PasswordField';
import Button from '../../components/common/Button/Button';

// 관리자 계정은 따로 없고 관리자 비밀번호 하나로만 들어옵니다.
function AdminLogin({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(password);
    } catch (error) {
      setErrorMessage(error?.message ?? '관리자 비밀번호가 맞지 않습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page admin-login">
      <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />
      <form onSubmit={handleSubmit}>
        <h1>관리자 페이지</h1>
        <p>관리자 비밀번호를 입력해 주세요.</p>
        <PasswordField
          id="admin-password"
          label="관리자 비밀번호"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage('');
          }}
        />
        {errorMessage && <p className="error-msg" role="alert">{errorMessage}</p>}
        <Button type="submit" className="login" loading={isSubmitting} loadingText="확인 중…">
          들어가기
        </Button>
      </form>
    </main>
  );
}

export default AdminLogin;
