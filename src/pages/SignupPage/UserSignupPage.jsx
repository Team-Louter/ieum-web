import { useState } from 'react';
import './SignupPage.css';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import FieldWithButton from '../../components/auth/FieldWithButton';
import PasswordField from '../../components/auth/PasswordField';
import { authApi } from '../../api/client';

function isEmailFormatValid(value) {
    const atPosition = value.indexOf('@');
    const dotPosition = value.lastIndexOf('.');
    return atPosition > 0 && dotPosition > atPosition + 1 && dotPosition < value.length - 1;
}

function isPasswordValid(value) {
    return value.length >= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value);
}

function UserSignupPage({ onNavigate, onSignup }) {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [address, setAddress] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageIsError, setMessageIsError] = useState(false);

    async function sendEmailCode() {
        if (!isEmailFormatValid(email)) {
            setMessage('올바른 이메일 주소를 입력해 주세요.');
            setMessageIsError(true);
            return;
        }
        try {
            await authApi.sendEmailCode(email);
            setEmailSent(true);
            setMessage('인증 번호를 이메일로 보냈습니다.');
            setMessageIsError(false);
        } catch (error) {
            setMessage(error?.message ?? '인증 메일을 보내지 못했습니다.');
            setMessageIsError(true);
        }
    }

    async function verifyEmailCode() {
        if (!emailCode.trim()) {
            setMessage('인증 번호를 입력해 주세요.');
            setMessageIsError(true);
            return;
        }
        try {
            await authApi.verifyEmailCode(email, emailCode.trim());
            setEmailVerified(true);
            setMessage('이메일 인증이 완료되었습니다.');
            setMessageIsError(false);
        } catch (error) {
            setMessage(error?.message ?? '이메일 인증에 실패했습니다.');
            setMessageIsError(true);
        }
    }

    function searchAddress() {
        if (!window.kakao?.Postcode) {
            setMessage('주소 검색 서비스를 사용할 수 없습니다. 주소를 직접 입력해 주세요.');
            setMessageIsError(true);
            return;
        }
        new window.kakao.Postcode({
            oncomplete: (data) => setAddress(data.roadAddress || data.jibunAddress),
        }).open();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!loginId.trim() || !address.trim()) {
            setMessage('아이디와 주소를 입력해 주세요.');
            setMessageIsError(true);
            return;
        }
        if (!isPasswordValid(password)) {
            setMessage('비밀번호는 8자 이상, 영문자·숫자·특수문자를 포함해야 합니다.');
            setMessageIsError(true);
            return;
        }
        if (password !== passwordCheck) {
            setMessage('비밀번호가 일치하지 않습니다.');
            setMessageIsError(true);
            return;
        }
        if (!isEmailFormatValid(email) || !emailVerified) {
            setMessage('이메일 인증을 완료해 주세요.');
            setMessageIsError(true);
            return;
        }
        setIsSubmitting(true);
        try {
            await onSignup?.({ loginId: loginId.trim(), nickname: loginId.trim(), email, password, address, role: 'ROLE_SENIOR' });
        } catch (error) {
            setMessage(error?.message ?? '회원가입에 실패했습니다.');
            setMessageIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="signup-page">
            <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />
            <h1>사용자 계정 만들기</h1>
            <form className="signup-form" onSubmit={handleSubmit} noValidate>
                <div className="signup-field">
                    <FieldWithButton id="user-id" label="아이디" value={loginId} onChange={(event) => setLoginId(event.target.value)} buttonText="중복확인" onButtonClick={() => { setMessage('아이디 중복확인 API가 없어 회원가입 시 서버에서 확인합니다.'); setMessageIsError(false); }} />
                </div>
                <div className="signup-field">
                    <PasswordField id="user-password" label="비밀번호 (8자 이상, 영문자/숫자/특수문자 사용)" value={password} onChange={(event) => setPassword(event.target.value)} />
                </div>
                <div className="signup-field">
                    <PasswordField id="user-password-check" label="비밀번호 확인" value={passwordCheck} onChange={(event) => setPasswordCheck(event.target.value)} />
                </div>
                <div className="signup-field">
                    <FieldWithButton id="user-email" label="이메일" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setEmailSent(false); setEmailVerified(false); }} buttonText={emailSent ? '재전송' : '인증하기'} onButtonClick={sendEmailCode} />
                </div>
                {emailSent && (
                    <div className="signup-field">
                        <FieldWithButton id="user-email-code" label="이메일 인증 번호" value={emailCode} onChange={(event) => setEmailCode(event.target.value)} buttonText={emailVerified ? '인증완료' : '인증확인'} onButtonClick={verifyEmailCode} readOnly={emailVerified} />
                    </div>
                )}
                <div className="signup-field">
                    <FieldWithButton id="user-address" label="주소" value={address} onChange={(event) => setAddress(event.target.value)} buttonText="주소검색" onButtonClick={searchAddress} />
                </div>
                {message && <p className={messageIsError ? 'input-error-msg' : 'input-success-msg'} role={messageIsError ? 'alert' : 'status'}>{message}</p>}
                <button type="submit" className="signup-submit" disabled={isSubmitting}>{isSubmitting ? '계정 생성 중…' : '계정 만들기'}</button>
            </form>
            <button type="button" className="back-to-login" onClick={() => onNavigate('/login')}>로그인으로 돌아가기</button>
        </main>
    );
}

export default UserSignupPage;
