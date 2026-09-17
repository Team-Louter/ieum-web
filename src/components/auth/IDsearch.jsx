import { useState } from 'react';
import './IDsearch.css';

function isEmailFormatValid(emailValue) {
    const atPosition = emailValue.indexOf('@');
    const dotPosition = emailValue.lastIndexOf('.');

    const hasTextBeforeAt = atPosition > 0;
    const hasTextBetweenAtAndDot = dotPosition > atPosition + 1;
    const hasTextAfterDot = dotPosition < emailValue.length - 1;

    return hasTextBeforeAt && hasTextBetweenAtAndDot && hasTextAfterDot;
}

function IDsearch({ type, onClose }) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [done, setDone] = useState(false);
    let title = '비밀번호 찾기';
    let resultMessage = '이메일로 비밀번호 재설정 링크를 발송 했습니다.';

    if (type === 'id') {
        title = '아이디 찾기';
        resultMessage = '입력하신 이메일로 가입된 아이디를 전송했습니다.';
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
        setEmailError('');
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (email === '') {
            setEmailError('필수 입력정보 입니다');
            return;
        }

        if (!isEmailFormatValid(email)) {
            setEmailError('올바르지 않은 형식입니다');
            return;
        }

        setDone(true);
    }

    if (done) {
        return (
            <div className="modal-overlay">
                <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="find-modal-title">
                    <h2 id="find-modal-title">{title}</h2>
                    <div className="modal-result">
                        <p className="result-msg" role="status">{resultMessage}</p>
                        <button type="button" className="modal-login-btn" onClick={onClose}>로그인으로 돌아가기</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="find-modal-title">
                <h2 id="find-modal-title">{title}</h2>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal-email-row">
                        <input
                            type="email"
                            placeholder="이메일"
                            aria-label="이메일"
                            aria-describedby="find-email-message"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                        <button type="submit" className="modal-check-btn">인증하기</button>
                    </div>
                    {emailError ? (
                        <p className="modal-error-msg" id="find-email-message" role="alert">{emailError}</p>
                    ) : (
                        <p className="modal-desc" id="find-email-message">가입할 때 등록한 이메일 주소를 입력해 주세요.</p>
                    )}
                    <button type="button" className="modal-login-btn" onClick={onClose}>로그인으로 돌아가기</button>
                </form>
            </div>
        </div>
    );
}

export default IDsearch;
