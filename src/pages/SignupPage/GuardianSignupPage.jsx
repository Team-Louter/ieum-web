import { useState } from 'react';
import './SignupPage.css';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import FieldWithButton from '../../components/auth/FieldWithButton';
import PasswordField from '../../components/auth/PasswordField';

/* 이메일 형식 확인 */
function isEmailFormatValid(emailValue) {
    const atPosition = emailValue.indexOf('@');
    const dotPosition = emailValue.lastIndexOf('.');

    const hasTextBeforeAt = atPosition > 0;
    const hasTextBetweenAtAndDot = dotPosition > atPosition + 1;
    const hasTextAfterDot = dotPosition < emailValue.length - 1;

    return hasTextBeforeAt && hasTextBetweenAtAndDot && hasTextAfterDot;
}

function GuardianSignupPage({ onNavigate }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [idError, setIdError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordCheckError, setPasswordCheckError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [userEmailError, setUserEmailError] = useState('');

    const [idSuccess, setIdSuccess] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [userEmailSuccess, setUserEmailSuccess] = useState(false);
    const [emailButtonText, setEmailButtonText] = useState('인증하기');

    function handleIdChange(event) {
        setId(event.target.value);
        setIdError('');
        setIdSuccess(false);
    }

    function handlePasswordChange(event) {
        const newPassword = event.target.value;
        setPassword(newPassword);

        /* 비밀번호 조건 확인 */
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(newPassword);

        if (newPassword === '') {
            setPasswordError('');
        } else if (newPassword.length < 8 || !hasLetter || !hasNumber || !hasSpecialCharacter) {
            setPasswordError('비밀번호는 8자 이상, 영문자/숫자/특수문자를 사용해주세요');
        } else {
            setPasswordError('');
        }
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

    function handleUserEmailChange(event) {
        setUserEmail(event.target.value);
        setUserEmailError('');
        setUserEmailSuccess(false);
    }

    function checkId() {
        if (id === '') {
            setIdError('필수 입력정보 입니다');
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
            setEmailError('필수 입력정보 입니다');
            return;
        }

        if (!isEmailFormatValid(email)) {
            setEmailError('올바르지 않은 형식입니다');
            return;
        }

        setEmailSuccess(true);
        setEmailButtonText('인증완료');
    }

    function checkUserEmail() {
        if (userEmail === '') {
            setUserEmailError('필수 입력정보 입니다');
            return;
        }

        if (!isEmailFormatValid(userEmail)) {
            setUserEmailError('올바르지 않은 형식입니다');
            return;
        }

        /* 임시 사용자 이메일 */
        if (userEmail !== 'ieum@ieum.com') {
            setUserEmailError('존재하지 않는 이메일입니다');
            return;
        }

        setUserEmailSuccess(true);
    }

    function handleSubmit(event) {
        event.preventDefault();
        let hasError = false;

        if (id === '') {
            setIdError('필수 입력정보 입니다');
            hasError = true;
        } else if (id === 'ieum') {
            setIdError('중복된 아이디입니다.');
            hasError = true;
        } else if (!idSuccess) {
            setIdError('아이디 중복확인을 해주세요.');
            hasError = true;
        }

        /* 비밀번호 조건 확인 */
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialCharacter = /[^a-zA-Z0-9]/.test(password);

        if (password === '') {
            setPasswordError('필수 입력정보 입니다');
            hasError = true;
        } else if (password.length < 8 || !hasLetter || !hasNumber || !hasSpecialCharacter) {
            setPasswordError('비밀번호는 8자 이상, 영문자/숫자/특수문자를 사용해주세요');
            hasError = true;
        }

        if (passwordCheck === '') {
            setPasswordCheckError('필수 입력정보 입니다');
            hasError = true;
        } else if (password !== passwordCheck) {
            setPasswordCheckError('비밀번호가 일치하지 않습니다.');
            hasError = true;
        }

        if (email === '') {
            setEmailError('필수 입력정보 입니다');
            hasError = true;
        } else if (!isEmailFormatValid(email)) {
            setEmailError('올바르지 않은 형식입니다');
            hasError = true;
        } else if (!emailSuccess) {
            setEmailError('이메일 인증에 실패했습니다');
            hasError = true;
        }

        if (userEmail === '') {
            setUserEmailError('필수 입력정보 입니다');
            hasError = true;
        } else if (!isEmailFormatValid(userEmail)) {
            setUserEmailError('올바르지 않은 형식입니다');
            hasError = true;
        } else if (!userEmailSuccess) {
            setUserEmailError('존재하지 않는 이메일입니다');
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
                <div className="signup-field">
                    <FieldWithButton id="guardian-id" label="아이디" value={id} onChange={handleIdChange} buttonText="중복확인" onButtonClick={checkId} />
                    {idError && <p className="input-error-msg">{idError}</p>}
                    {idSuccess && <p className="input-success-msg">사용 가능한 아이디입니다.</p>}
                </div>

                <div className="signup-field">
                    <PasswordField id="guardian-password" label="비밀번호 (8자 이상, 영문자/숫자/특수문자 사용)" value={password} onChange={handlePasswordChange} />
                    {passwordError && <p className="input-error-msg">{passwordError}</p>}
                </div>

                <div className="signup-field">
                    <PasswordField id="guardian-password-check" label="비밀번호 확인 (비밀번호를 한 번 더 입력해 주세요)" value={passwordCheck} onChange={handlePasswordCheckChange} />
                    {passwordCheckError && <p className="input-error-msg">{passwordCheckError}</p>}
                </div>

                <div className="signup-field">
                    <FieldWithButton id="guardian-email" label="이메일" type="email" value={email} onChange={handleEmailChange} buttonText={emailButtonText} onButtonClick={checkEmail} />
                    {emailError && <p className="input-error-msg">{emailError}</p>}
                    {emailSuccess && <p className="input-success-msg">이메일 인증에 성공했습니다.</p>}
                </div>

                <div className="signup-field">
                    <FieldWithButton id="linked-user-email" label="연결할 사용자 이메일" type="email" value={userEmail} onChange={handleUserEmailChange} buttonText="사용자 확인" onButtonClick={checkUserEmail} />
                    {userEmailError && <p className="input-error-msg">{userEmailError}</p>}
                    {userEmailSuccess && <p className="input-success-msg">사용자 이메일을 확인했습니다.</p>}
                </div>

                <button type="submit" className="signup-submit">계정 만들기</button>
            </form>

            <button type="button" className="back-to-login" onClick={() => onNavigate('login')}>
                로그인으로 돌아가기
            </button>
        </main>
    );
}

export default GuardianSignupPage;
