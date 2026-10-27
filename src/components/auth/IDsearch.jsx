import { useState } from 'react';
import { authApi } from '../../api/client';
import { isPasswordValid } from '../../utils/validation';
import './IDsearch.css';

function isEmailFormatValid(emailValue) {
    const atPosition = emailValue.indexOf('@');
    const dotPosition = emailValue.lastIndexOf('.');
    return atPosition > 0 && dotPosition > atPosition + 1 && dotPosition < emailValue.length - 1;
}

function IDsearch({ type, onClose }) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const [phase, setPhase] = useState('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const title = type === 'id' ? '아이디 찾기' : '비밀번호 찾기';

    async function handleSendCode(event) {
        event.preventDefault();
        if (!isEmailFormatValid(email)) {
            setErrorMessage('올바른 이메일 주소를 입력해 주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            await authApi.sendEmailCode(email, true);
            setErrorMessage('');
            setPhase('verify');
        } catch (error) {
            setErrorMessage(error?.message ?? '인증 메일을 보내지 못했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleVerify(event) {
        event.preventDefault();
        if (!code.trim()) {
            setErrorMessage('인증 번호를 입력해 주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            await authApi.verifyEmailCode(email, code.trim());
            setErrorMessage('');
            if (type === 'id') {
                setResultMessage(await authApi.findLoginId(email));
                setPhase('done');
            } else {
                setPhase('reset');
            }
        } catch (error) {
            setErrorMessage(error?.message ?? '인증에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleReset(event) {
        event.preventDefault();
        if (!isPasswordValid(newPassword)) {
            setErrorMessage('비밀번호는 8자 이상, 영문자·숫자·특수문자를 포함해야 합니다.');
            return;
        }
        setIsSubmitting(true);
        try {
            setResultMessage(await authApi.resetPassword(email, newPassword));
            setErrorMessage('');
            setPhase('done');
        } catch (error) {
            setErrorMessage(error?.message ?? '비밀번호를 변경하지 못했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="find-modal-title">
                <h2 id="find-modal-title">{title}</h2>
                {phase === 'done' ? (
                    <div className="modal-result">
                        <p className="result-msg" role="status">{resultMessage}</p>
                        <button type="button" className="modal-login-btn" onClick={onClose}>로그인으로 돌아가기</button>
                    </div>
                ) : (
                    <form onSubmit={phase === 'email' ? handleSendCode : phase === 'verify' ? handleVerify : handleReset} noValidate>
                        {phase === 'email' && (
                            <div className="modal-email-row">
                                <input type="email" placeholder="이메일" aria-label="이메일" value={email} onChange={(event) => setEmail(event.target.value)} required />
                                <button type="submit" className="modal-check-btn" disabled={isSubmitting}>{isSubmitting ? '전송 중…' : '인증하기'}</button>
                            </div>
                        )}
                        {phase === 'verify' && (
                            <div className="modal-email-row">
                                <input type="text" inputMode="numeric" placeholder="인증 번호" aria-label="인증 번호" value={code} onChange={(event) => setCode(event.target.value)} required />
                                <button type="submit" className="modal-check-btn" disabled={isSubmitting}>{isSubmitting ? '확인 중…' : '인증 확인'}</button>
                            </div>
                        )}
                        {phase === 'reset' && (
                            <div className="modal-email-row">
                                <input type="password" placeholder="새 비밀번호 (8자 이상)" aria-label="새 비밀번호" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                                <button type="submit" className="modal-check-btn" disabled={isSubmitting}>{isSubmitting ? '변경 중…' : '변경하기'}</button>
                            </div>
                        )}
                        {errorMessage ? (
                            <p className="modal-error-msg" role="alert">{errorMessage}</p>
                        ) : (
                            <p className="modal-desc">
                                {phase === 'email' ? '가입할 때 등록한 이메일 주소로 인증 번호를 보냅니다.' : phase === 'verify' ? '이메일로 받은 인증 번호를 입력해 주세요.' : '새 비밀번호를 입력해 주세요.'}
                            </p>
                        )}
                        <button type="button" className="modal-login-btn" onClick={onClose}>로그인으로 돌아가기</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default IDsearch;
