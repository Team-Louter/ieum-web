import { useState } from 'react';
import './SignupPage.css';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import FieldWithButton from '../../components/auth/FieldWithButton';
import PasswordField from '../../components/auth/PasswordField';

function GuardianSignupPage({ onNavigate }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');

    const [idError, setIdError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordCheckError, setPasswordCheckError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [userIdError, setUserIdError] = useState('');

    const [idSuccess, setIdSuccess] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [userIdSuccess, setUserIdSuccess] = useState(false);
    const [emailButtonText, setEmailButtonText] = useState('인증하기');

    function handleIdChange(event) {
        setId(event.target.value);
        setIdError('');
        setIdSuccess(false);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
        setPasswordError('');
    }

    function handlePasswordCheckChange(event) {
        setPasswordCheck(event.target.value);
        setPasswordCheckError('');
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
        setEmailError('');
        setEmailSuccess(false);
        setEmailButtonText('인증하기');
    }

    function handleUserIdChange(event) {
        setUserId(event.target.value);
        setUserIdError('');
        setUserIdSuccess(false);
    }

    function checkId() {
        if (id === '') {
            setIdError('아이디를 입력해주세요.');
            return;
        }

        if (id === 'ieum') {
            setIdError('중복된 아이디입니다.');
            return;
        }

        setIdSuccess(true);
    }

    function checkEmail() {
        if (email === '') {
            setEmailError('이메일을 입력해주세요.');
            return;
        }

        if (!email.includes('@')) {
            setEmailError('이메일 형식이 아닙니다.');
            return;
        }

        setEmailSuccess(true);
        setEmailButtonText('인증완료');
    }

    function checkUserId() {
        if (userId === '') {
            setUserIdError('사용자 아이디를 입력해주세요.');
            return;
        }

        setUserIdSuccess(true);
    }

    function handleSubmit(event) {
        event.preventDefault();
        let hasError = false;

        if (id === '') {
            setIdError('아이디를 입력해주세요.');
            hasError = true;
        }
        if (password === '') {
            setPasswordError('비밀번호를 입력해주세요.');
            hasError = true;
        }
        if (passwordCheck === '') {
            setPasswordCheckError('비밀번호를 한번 더 입력해주세요.');
            hasError = true;
        }
        if (password !== '' && passwordCheck !== '' && password !== passwordCheck) {
            setPasswordCheckError('비밀번호가 일치하지 않습니다.');
            hasError = true;
        }
        if (email === '') {
            setEmailError('이메일을 입력해주세요.');
            hasError = true;
        }
        if (userId === '') {
            setUserIdError('연결할 사용자 아이디를 입력해주세요.');
            hasError = true;
        }
        if (hasError) return;

        alert('보호자 회원가입이 완료되었습니다!');
        onNavigate('community');
    }

    return (
        <main className="signup-page">
            <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />
            <h1>보호자 계정 만들기</h1>

            <form className="signup-form" onSubmit={handleSubmit} noValidate>
                <FieldWithButton id="guardian-id" label="아이디" value={id} onChange={handleIdChange} buttonText="중복확인" onButtonClick={checkId} />
                {idError && <p className="input-error-msg">{idError}</p>}
                {idSuccess && <p className="input-success-msg">사용 가능한 아이디입니다.</p>}

                <PasswordField id="guardian-password" label="비밀번호" value={password} onChange={handlePasswordChange} />
                {passwordError && <p className="input-error-msg">{passwordError}</p>}

                <PasswordField id="guardian-password-check" label="비밀번호 확인" value={passwordCheck} onChange={handlePasswordCheckChange} />
                {passwordCheckError && <p className="input-error-msg">{passwordCheckError}</p>}

                <FieldWithButton id="guardian-email" label="이메일" type="email" value={email} onChange={handleEmailChange} buttonText={emailButtonText} onButtonClick={checkEmail} />
                {emailError && <p className="input-error-msg">{emailError}</p>}
                {emailSuccess && <p className="input-success-msg">이메일 인증에 성공했습니다.</p>}

                <FieldWithButton id="linked-user-id" label="연결할 사용자 아이디" value={userId} onChange={handleUserIdChange} buttonText="사용자 확인" onButtonClick={checkUserId} />
                {userIdError && <p className="input-error-msg">{userIdError}</p>}
                {userIdSuccess && <p className="input-success-msg">사용자 아이디를 확인했습니다.</p>}

                <button type="submit" className="signup-submit">계정 만들기</button>
            </form>

            <button type="button" className="back-to-login" onClick={() => onNavigate('login')}>
                로그인으로 돌아가기
            </button>
        </main>
    );
}

export default GuardianSignupPage;
