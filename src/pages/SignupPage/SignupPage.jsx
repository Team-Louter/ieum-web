import { useState } from 'react';
import './SignupPage.css';
import ieumLogo from '../../assets/images/IeumLogo.svg';
import eyeIcon from '../../assets/images/Eye.svg';
import eyeOffIcon from '../../assets/images/EyeOff.svg';
import FieldWithButton from '../../components/FieldWithButton';
import PasswordField from '../../components/PasswordField';

function SignupPage({ accountType = 'user', onNavigate = () => {} }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    // 오류+상태 관리
    const [errors, setErrors] = useState({ id: '', password: '', passwordCheck: '', email: '', address: '' });
    const [emailStatus, setEmailStatus] = useState('');
    const [idStatus, setIdStatus] = useState('');

    // 비밀번호 보기/숨기기
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    // 입력
    function handleIdChange(e) { 
    setId(e.target.value); 
    setErrors(p => ({...p, id: ''})); 
    setIdStatus('');
}

function handleCheckId() {
    if (!id) {
        setIdStatus('');
        return setErrors(p => ({...p, id: '필수 입력정보 입니다'}));
    }
    
    if (id === 'ieum') {
        // 임시 아이디:ieum(아이디 중복 확인용)
        setIdStatus('');
        return setErrors(p => ({...p, id: '중복된 아이디 입니다'}));
    }
    setErrors(p => ({...p, id: ''}));
    setIdStatus('success');
}
    function handlePasswordChange(e) { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }

    function handlePasswordCheckChange(e) { setPasswordCheck(e.target.value); setErrors(p => ({...p, passwordCheck: ''})); }

    function handleEmailChange(e) { setEmail(e.target.value); setEmailStatus(''); setErrors(p => ({...p, email: ''})); }

    function handleVerifyEmail() {
        if (!email) return setErrors(p => ({...p, email: '필수 입력정보 입니다'}));
        if (!email.includes('@')) return setEmailStatus('fail');
        setEmailStatus('success');
    }

    function handleAddressSearch() {
        new window.kakao.Postcode({
            oncomplete: function (data) {
                const selectedAddress = data.roadAddress || data.jibunAddress;
                setAddress(selectedAddress);
                setErrors(p => ({...p, address: ''}));
            },
        }).open();
    }

    function handleSubmit(e) {
        e.preventDefault();
        let newErrs = { id: '', password: '', passwordCheck: '', email: '', address: '' };
        let hasErr = false;

        if (!id) { newErrs.id = '필수 입력정보 입니다'; hasErr = true; }
        if (!password) { newErrs.password = '필수 입력정보 입니다'; hasErr = true; }
        else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) { newErrs.password = '비밀번호는 8자 이상, 영문자/숫자/특수문자를 사용해주세요'; hasErr = true; }
        if (!passwordCheck) { newErrs.passwordCheck = '필수 입력정보 입니다'; hasErr = true; }
        else if (password !== passwordCheck) { newErrs.passwordCheck = '비밀번호와 일치하지 않습니다'; hasErr = true; }
        if (!email) { newErrs.email = '필수 입력정보 입니다'; hasErr = true; }
        if (!address) { newErrs.address = '필수 입력정보 입니다'; hasErr = true; }

        setErrors(newErrs);
        if (hasErr) return;
        alert('회원가입이 완료되었습니다!'); 
        // 회원가입 성공 시 커뮤니티로 이동(링크는 임시..커뮤니티 뷰도 임시..)
        onNavigate('community');
    }

    return (
        <main className="signup-page">
            <img src={ieumLogo} alt="이음 로고" className="ieum-logo" id="ieum-logo" />
            <h1>{accountType === 'guardian' ? '보호자 계정 만들기' : '사용자 계정 만들기'}</h1>

            <form className="signup-form" onSubmit={handleSubmit} noValidate>
                <FieldWithButton id="signup-id" label="아이디" value={id} onChange={handleIdChange} buttonText="중복확인" onButtonClick={handleCheckId} />
                {errors.id && <p className="input-error-msg">{errors.id}</p>}
                {idStatus === 'success' && <p className="input-success-msg">사용 가능한 아이디입니다.</p>}

                <PasswordField id="signup-password" label="비밀번호 (8자 이상, 영문자/숫자/특수문자 사용)" value={password} onChange={handlePasswordChange} show={showPassword} onToggle={() => setShowPassword(v => !v)} eyeIcon={eyeIcon} eyeOffIcon={eyeOffIcon} />
                {errors.password && <p className="input-error-msg">{errors.password}</p>}

                <PasswordField id="signup-password-check" label="비밀번호 확인" value={passwordCheck} onChange={handlePasswordCheckChange} show={showPasswordCheck} onToggle={() => setShowPasswordCheck(v => !v)} eyeIcon={eyeIcon} eyeOffIcon={eyeOffIcon} />
                {errors.passwordCheck && <p className="input-error-msg">{errors.passwordCheck}</p>}

                <FieldWithButton id="signup-email" label="이메일" type="email" value={email} onChange={handleEmailChange} buttonText={emailStatus === 'success' ? '인증완료' : '인증하기'} onButtonClick={handleVerifyEmail} />
                {emailStatus === 'fail' && <p className="input-error-msg">이메일 형식에 맞지 않는 메일 주소입니다</p>}
                {emailStatus === 'success' && <p className="input-success-msg">이메일 인증에 성공 했습니다</p>}
                {errors.email && emailStatus === '' && <p className="input-error-msg">{errors.email}</p>}

                <FieldWithButton id="signup-address" label="주소" value={address} onChange={(e) => { setAddress(e.target.value); setErrors(p => ({...p, address: ''})); }} buttonText="주소검색" onButtonClick={handleAddressSearch} />
                {errors.address && <p className="input-error-msg">{errors.address}</p>}

                <button type="submit" className="signup-submit">계정 만들기</button>
            </form>

            <button type="button" className="back-to-login" onClick={() => onNavigate('login')}>
                로그인
            </button>
        </main>
    );
}

export default SignupPage;