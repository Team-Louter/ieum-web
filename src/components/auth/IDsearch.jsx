import { useRef, useState } from 'react';
import { authApi } from '../../api/client';
import { isEmailFormatValid, isPasswordValid } from '../../utils/validation';
import Button from '../common/Button/Button';
import AuthDialog from './AuthDialog';

function IDsearch({ type, onClose }) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [resultMessage, setResultMessage] = useState('');
    const [phase, setPhase] = useState('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitting = useRef(false);
    const title = type === 'id' ? '아이디 찾기' : '비밀번호 재설정';

    async function handleSendCode(event) {
        event.preventDefault();
        if (!isEmailFormatValid(email)) {
            setErrorMessage('올바른 이메일 주소를 입력해 주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            await authApi.sendEmailCode(email.trim(), true);
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
            const verification = await authApi.verifyEmailCode(email.trim(), code.trim());
            const token = verification?.verificationToken ?? '';
            setVerificationToken(token);
            setErrorMessage('');
            if (type === 'id') {
                setResultMessage(await authApi.findLoginId(email.trim(), token));
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
            setResultMessage(await authApi.resetPassword(email.trim(), newPassword, verificationToken));
            setErrorMessage('');
            setPhase('done');
        } catch (error) {
            setErrorMessage(error?.message ?? '비밀번호를 변경하지 못했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        try {
            const submit = phase === 'email' ? handleSendCode : phase === 'verify' ? handleVerify : handleReset;
            await submit(event);
        } finally {
            submitting.current = false;
        }
    }

    return (
        <AuthDialog titleId="find-modal-title" onClose={onClose}>
            <h2 id="find-modal-title">{title}</h2>
            {phase === 'done' ? (
                <div className="modal-result">
                    <p className="result-msg" role="status">{resultMessage}</p>
                    <button type="button" className="modal-login-btn" onClick={onClose}>로그인으로 돌아가기</button>
                </div>
            ) : (
                <form className="recovery-form" onSubmit={handleSubmit} noValidate>
                    {phase === 'email' && (
                        <div className="modal-email-row">
                            <input autoFocus type="email" placeholder="이메일" aria-label="이메일" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={isSubmitting} required />
                            <Button type="submit" className="modal-check-btn" loading={isSubmitting} loadingText="전송 중…">인증하기</Button>
                        </div>
                    )}
                    {phase === 'verify' && (
                        <div className="modal-email-row">
                            <input type="text" inputMode="numeric" placeholder="인증 번호" aria-label="인증 번호" value={code} onChange={(event) => setCode(event.target.value)} readOnly={isSubmitting} required />
                            <Button type="submit" className="modal-check-btn" loading={isSubmitting} loadingText="확인 중…">인증 확인</Button>
                        </div>
                    )}
                    {phase === 'reset' && (
                        <div className="modal-email-row">
                            <input type="password" placeholder="새 비밀번호 (8자 이상)" aria-label="새 비밀번호" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} readOnly={isSubmitting} required />
                            <Button type="submit" className="modal-check-btn" loading={isSubmitting} loadingText="변경 중…">변경하기</Button>
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
        </AuthDialog>
    );
}

export default IDsearch;
