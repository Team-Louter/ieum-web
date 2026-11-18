import { useCallback, useRef, useState } from 'react';
import Button from '../../components/common/Button/Button';
import FieldWithButton from '../../components/auth/FieldWithButton';
import PasswordField from '../../components/auth/PasswordField';
import { authApi } from '../../api/client';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import { isEmailFormatValid, isLoginIdValid, isPasswordValid } from '../../utils/validation';
import SignupAddressDialog from './SignupAddressDialog';
import './SignupPage.css';

const ID_FORMAT_MESSAGE = '아이디는 영문과 숫자만 사용할 수 있습니다.';

function FieldMessage({ id, feedback }) {
    if (!feedback) return null;
    return (
        <p id={id} className={feedback.error ? 'input-error-msg' : 'input-success-msg'} role={feedback.error ? 'alert' : 'status'}>
            {feedback.text}
        </p>
    );
}

export default function SignupForm({ role, onNavigate, onSignup }) {
    const isGuardian = role === 'ROLE_GUARDIAN';
    const prefix = isGuardian ? 'guardian' : 'user';
    const emailLabel = isGuardian ? '보호자 이메일' : '이메일';
    const [loginId, setLoginId] = useState('');
    const [checkedLoginId, setCheckedLoginId] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [verificationToken, setVerificationToken] = useState('');
    const [address, setAddress] = useState('');
    const [addressOpen, setAddressOpen] = useState(false);
    const [feedback, setFeedback] = useState({});
    const [showMissingFields, setShowMissingFields] = useState(false);
    const [checkingId, setCheckingId] = useState(false);
    const [emailOperation, setEmailOperation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const idRequest = useRef({ version: 0, pending: false });
    const emailRequest = useRef({ version: 0, pending: false });
    const submitting = useRef(false);
    const requiredFields = [
        [loginId, '아이디'], [nickname, '닉네임'], [password, '비밀번호'],
        [passwordCheck, '비밀번호 확인'], [email, emailLabel], [address, '주소'],
    ];
    const missingFields = requiredFields.filter(([value]) => !value.trim()).map(([, label]) => label);

    function showMessage(field, text, error = true) {
        setFeedback((current) => ({ ...current, [field]: text ? { text, error } : null }));
    }

    function changeLoginId(event) {
        idRequest.current.version += 1;
        setLoginId(event.target.value);
        setCheckedLoginId('');
        showMessage('loginId', '');
    }

    function changeEmail(event) {
        emailRequest.current.version += 1;
        setEmail(event.target.value);
        setEmailSent(false);
        setEmailCode('');
        setVerificationToken('');
        showMessage('email', '');
        showMessage('emailCode', '');
    }

    async function checkLoginId() {
        if (idRequest.current.pending) return;
        const error = !loginId.trim() ? '아이디를 입력해 주세요.' : !isLoginIdValid(loginId) ? ID_FORMAT_MESSAGE : '';
        if (error) {
            showMessage('loginId', error);
            return;
        }
        const request = idRequest.current;
        const { version } = request;
        request.pending = true;
        setCheckingId(true);
        setCheckedLoginId('');
        showMessage('loginId', '');
        try {
            const result = await authApi.checkLoginId(loginId);
            if (request.version !== version) return;
            const available = typeof result === 'boolean'
                ? result
                : result?.available ?? result?.isAvailable ?? (result?.duplicated === false);
            setCheckedLoginId(available ? loginId : '');
            showMessage('loginId', available ? '사용할 수 있는 아이디입니다.' : '이미 사용 중인 아이디입니다.', !available);
        } catch (error) {
            if (request.version === version) showMessage('loginId', error?.message ?? '아이디 중복확인에 실패했습니다.');
        } finally {
            request.pending = false;
            setCheckingId(false);
        }
    }

    async function sendEmailCode() {
        if (emailRequest.current.pending) return;
        if (!isEmailFormatValid(email)) {
            showMessage('email', '올바른 이메일 주소를 입력해 주세요.');
            return;
        }
        const request = emailRequest.current;
        const { version } = request;
        request.pending = true;
        setEmailOperation('send');
        showMessage('email', '');
        try {
            await authApi.sendEmailCode(email.trim());
            if (request.version !== version) return;
            setEmailSent(true);
            setEmailCode('');
            setVerificationToken('');
            showMessage('emailCode', '');
            showMessage('email', '인증 번호를 이메일로 보냈습니다.', false);
        } catch (error) {
            if (request.version === version) showMessage('email', error?.message ?? '인증 메일을 보내지 못했습니다.');
        } finally {
            request.pending = false;
            setEmailOperation(null);
        }
    }

    async function verifyEmailCode() {
        if (emailRequest.current.pending || verificationToken) return;
        if (!emailCode.trim()) {
            showMessage('emailCode', '인증 번호를 입력해 주세요.');
            return;
        }
        const request = emailRequest.current;
        const { version } = request;
        request.pending = true;
        setEmailOperation('verify');
        showMessage('emailCode', '');
        try {
            const result = await authApi.verifyEmailCode(email.trim(), emailCode.trim());
            if (request.version !== version) return;
            if (!result?.verificationToken) throw new Error('인증 결과를 확인하지 못했습니다.');
            setVerificationToken(result.verificationToken);
            showMessage('emailCode', '이메일 인증이 완료되었습니다.', false);
        } catch (error) {
            if (request.version === version) showMessage('emailCode', error?.message ?? '이메일 인증에 실패했습니다.');
        } finally {
            request.pending = false;
            setEmailOperation(null);
        }
    }

    const closeAddress = useCallback(() => setAddressOpen(false), []);
    const selectAddress = useCallback((value) => {
        if (value) setAddress(value);
        setAddressOpen(false);
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting.current || emailRequest.current.pending || idRequest.current.pending) return;
        showMessage('form', '');
        setShowMissingFields(missingFields.length > 0);
        if (missingFields.length) return;
        if (!isLoginIdValid(loginId)) return showMessage('loginId', ID_FORMAT_MESSAGE);
        if (checkedLoginId !== loginId) return showMessage('loginId', '아이디 중복확인을 해 주세요.');
        if (!isPasswordValid(password)) {
            return showMessage('password', '비밀번호는 8자 이상, 영문자·숫자·특수문자를 포함해야 합니다.');
        }
        if (password !== passwordCheck) return showMessage('passwordCheck', '비밀번호가 일치하지 않습니다.');
        if (!verificationToken) {
            return showMessage(emailSent ? 'emailCode' : 'email', '이메일 인증을 완료해 주세요.');
        }
        submitting.current = true;
        setIsSubmitting(true);
        try {
            await onSignup?.({
                loginId, nickname: nickname.trim(), email: email.trim(), password,
                address: address.trim(), role, verificationToken,
            });
        } catch (error) {
            showMessage('form', error?.message ?? '회원가입에 실패했습니다.');
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
        }
    }

    function fieldMessage(field) {
        return <FieldMessage id={`${prefix}-${field}-message`} feedback={feedback[field]} />;
    }

    function descriptionFor(field) {
        return feedback[field] ? `${prefix}-${field}-message` : undefined;
    }

    return (
        <main className="signup-page">
            <img src={ieumLogo} alt="이음 로고" id="ieum-logo" />
            <h1>{isGuardian ? '보호자 계정 만들기' : '사용자 계정 만들기'}</h1>
            <form className="signup-form" onSubmit={handleSubmit} noValidate>
                <div className="signup-field">
                    <FieldWithButton
                        id={`${prefix}-id`} label="아이디" value={loginId} onChange={changeLoginId}
                        describedBy={descriptionFor('loginId')}
                        buttonText={checkedLoginId ? '확인완료' : '중복확인'}
                        buttonLoading={checkingId} buttonLoadingText="확인 중…"
                        onButtonClick={checkLoginId}
                    />
                    {fieldMessage('loginId')}
                </div>
                <div className="signup-field">
                    <FieldWithButton id={`${prefix}-nickname`} label="닉네임" value={nickname} onChange={(event) => setNickname(event.target.value)} />
                </div>
                <div className="signup-field">
                    <PasswordField
                        id={`${prefix}-password`} label="비밀번호"
                        hint="8자 이상, 영문자·숫자·특수문자를 사용해 주세요."
                        value={password} onChange={(event) => {
                            setPassword(event.target.value);
                            showMessage('password', '');
                            showMessage('passwordCheck', '');
                        }}
                    />
                    {fieldMessage('password')}
                </div>
                <div className="signup-field">
                    <PasswordField id={`${prefix}-password-check`} label="비밀번호 확인" value={passwordCheck} onChange={(event) => {
                        setPasswordCheck(event.target.value);
                        showMessage('passwordCheck', '');
                    }} />
                    {fieldMessage('passwordCheck')}
                </div>
                <div className="signup-field">
                    <FieldWithButton
                        id={`${prefix}-email`} label={emailLabel} type="email" value={email} onChange={changeEmail}
                        describedBy={descriptionFor('email')}
                        buttonText={emailSent ? '재전송' : '인증하기'} onButtonClick={sendEmailCode}
                        buttonLoading={emailOperation === 'send'} buttonLoadingText="전송 중…"
                        buttonDisabled={emailOperation === 'verify'}
                    />
                    {fieldMessage('email')}
                </div>
                {emailSent && (
                    <div className="signup-field">
                        <FieldWithButton
                            id={`${prefix}-email-code`} label="이메일 인증 번호" value={emailCode}
                            onChange={(event) => {
                                setEmailCode(event.target.value);
                                showMessage('emailCode', '');
                            }}
                            describedBy={descriptionFor('emailCode')}
                            buttonText={verificationToken ? '인증완료' : '인증확인'}
                            onButtonClick={verifyEmailCode}
                            buttonLoading={emailOperation === 'verify'} buttonLoadingText="확인 중…"
                            buttonDisabled={Boolean(verificationToken) || emailOperation === 'send'}
                            readOnly={Boolean(verificationToken) || Boolean(emailOperation)}
                        />
                        {fieldMessage('emailCode')}
                    </div>
                )}
                <div className="signup-field">
                    <FieldWithButton id={`${prefix}-address`} label="주소" value={address} onChange={(event) => setAddress(event.target.value)} buttonText="주소검색" onButtonClick={() => setAddressOpen(true)} />
                </div>
                {showMissingFields && missingFields.length > 0 && (
                    <p className="input-error-msg" role="alert">다음 항목을 입력해 주세요: {missingFields.join(', ')}</p>
                )}
                {fieldMessage('form')}
                <Button type="submit" className="signup-submit" loading={isSubmitting} loadingText="계정 생성 중…" disabled={checkingId || Boolean(emailOperation)}>계정 만들기</Button>
            </form>
            <button type="button" className="back-to-login" onClick={() => onNavigate('/login')}>로그인으로 돌아가기</button>
            {addressOpen && <SignupAddressDialog onSelect={selectAddress} onClose={closeAddress} />}
        </main>
    );
}
