import { useState } from 'react';
import './LoginPage.css';
import Button from '../../components/common/Button/Button';

import ieumLogo from '../../assets/images/IeumLogo.svg';
import googleLogo from '../../assets/images/GoogleLogo.svg';
import PasswordField from '../../components/auth/PasswordField';
import IDsearch from '../../components/auth/IDsearch';

function LoginPage({ onNavigate = () => {}, onLogin }) {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [showError, setShowError] = useState(false);
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('아이디 또는 비밀번호가 맞지 않습니다.');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [findType, setFindType] = useState(null);

    function handleIdChange(e) {
        setId(e.target.value);
        setShowError(false);
    }

    function handlePwChange(e) {
        setPw(e.target.value);
        setShowError(false);
    }

    function checkCapsLock(e) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onLogin?.({ loginId: id, password: pw });
            setShowError(false);
        } catch (error) {
            setErrorMessage(error?.message ?? '로그인에 실패했습니다.');
            setShowError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />

            {/* 로그인 인풋 */}
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        id="user-id"
                        placeholder=" "
                        value={id}
                        onChange={handleIdChange}
                        required
                    />
                    <label htmlFor="user-id">아이디</label>
                </div>

                <PasswordField
                    id="user-pw"
                    label="비밀번호"
                    value={pw}
                    onChange={handlePwChange}
                    onKeyDown={checkCapsLock}
                    onKeyUp={checkCapsLock}
                    onBlur={() => setIsCapsLockOn(false)}
                />

                {(isCapsLockOn || showError) && (
                    <p className="error-msg" role="alert">
                        {isCapsLockOn ? 'Caps Lock이 켜져 있습니다.' : errorMessage}
                    </p>
                )}

                <Button type="submit" className="login" loading={isSubmitting} loadingText="로그인 중…">
                    로그인
                </Button>

                <button type="button" className="google-login" onClick={() => {
                    setErrorMessage('현재 API 명세에는 Google 로그인 기능이 없어 사용할 수 없습니다.');
                    setShowError(true);
                }}>
                    <img
                        src={googleLogo}
                        alt="구글 로고"
                        className="google-logo"
                    />
                    <span>Google 로그인</span>
                </button>
            </form>

            <div className="links">
                <button
                    type="button"
                    className="find"
                    onClick={() => setFindType('id')}
                >
                    아이디 찾기
                </button>

                <button
                    type="button"
                    className="find"
                    onClick={() => setFindType('password')}
                >
                    비밀번호 재설정
                </button>
            </div>

            <div className="signup-group">
                <button
                    type="button"
                    className="signup"
                    onClick={() => onNavigate('/signup/user')}
                >
                    사용자 계정 만들기
                </button>

                <button
                    type="button"
                    className="signup"
                    onClick={() => onNavigate('/signup/guardian')}
                >
                    보호자 계정 만들기
                </button>
            </div>

            {/* 아이디/비밀번호 찾기 */}
            {findType && (
                <IDsearch
                    type={findType}
                    onClose={() => setFindType(null)}
                />
            )}
        </main>
    );
}

export default LoginPage;
