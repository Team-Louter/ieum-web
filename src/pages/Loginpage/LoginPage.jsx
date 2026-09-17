import { useState } from 'react';
import './LoginPage.css';

import ieumLogo from '../../assets/images/IeumLogo.svg';
import googleLogo from '../../assets/images/GoogleLogo.svg';
import PasswordField from '../../components/auth/PasswordField';
import IDsearch from '../../components/auth/IDsearch';

function LoginPage({ onNavigate = () => {} }) {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [showError, setShowError] = useState(false);
    const [findType, setFindType] = useState(null);

    function handleIdChange(e) {
        setId(e.target.value);
        setShowError(false);
    }

    function handlePwChange(e) {
        setPw(e.target.value);
        setShowError(false);
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (id === 'ieum' && pw === 'ieum') {
            setShowError(false);
// 로그인 성공 시 커뮤니티로 이동(회원가입에서와 마찬가지로 임시링크/뷰)
            onNavigate('community');
        } else {
            setShowError(true);
        }
    }

    return (
        <main className="login-page">
            <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />

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
                />

                {showError && (
                    <p className="error-msg">
                        아이디 또는 비밀번호가 맞지 않습니다.
                    </p>
                )}

                <button type="submit" className="login">
                    로그인
                </button>

                <button type="button" className="google-login">
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
                    비밀번호 찾기
                </button>
            </div>

            <div className="signup-group">
                <button
                    type="button"
                    className="signup"
                    onClick={() => onNavigate('signup-user')}
                >
                    사용자 계정 만들기
                </button>

                <button
                    type="button"
                    className="signup"
                    onClick={() => onNavigate('signup-guardian')}
                >
                    보호자 계정 만들기
                </button>
            </div>

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
