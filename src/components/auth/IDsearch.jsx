import { useState } from 'react';
import './IDsearch.css';

function IDsearch({ type, onClose }) {
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    let title = '비밀번호 찾기';
    let buttonText = '비밀번호 찾기';
    let resultText = '임시 비밀번호 발급 링크';

    if (type === 'id') {
        title = '아이디 찾기';
        buttonText = '아이디 찾기';
        resultText = '가입된 아이디';
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setDone(true);
    }

    if (done) {
        return (
            <div className="modal-overlay">
                <div className="modal-box">
                    <p className="result-msg">입력하신 이메일로 {resultText}를 전송했습니다.</p>
                    <button type="button" className="modal-submit-btn" onClick={onClose}>확인</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <button type="button" className="close-btn" onClick={onClose}>&times;</button>
                <h2>{title}</h2>
                <form onSubmit={handleSubmit}>
                    <p className="modal-desc">가입할 때 등록한 이메일 주소를 입력해 주세요.</p>
                    <div className="modal-input-group">
                        <input
                            type="email"
                            placeholder="이메일 주소 입력"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>
                    <button type="submit" className="modal-submit-btn">{buttonText}</button>
                </form>
            </div>
        </div>
    );
}

export default IDsearch;
