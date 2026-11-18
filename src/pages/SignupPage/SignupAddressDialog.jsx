import { useEffect, useRef, useState } from 'react';
import AuthDialog from '../../components/auth/AuthDialog';
import Button from '../../components/common/Button/Button';

export default function SignupAddressDialog({ onSelect, onClose }) {
    const containerRef = useRef(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        let active = true;
        // 다이얼로그가 표시된 뒤의 컨테이너 크기로 주소 검색을 초기화합니다.
        const frame = requestAnimationFrame(() => {
            try {
                const Postcode = window.kakao?.Postcode ?? window.daum?.Postcode;
                new Postcode({
                    width: '100%',
                    height: '100%',
                    oncomplete: (data) => {
                        if (active) onSelect(data.address || data.roadAddress || data.jibunAddress);
                    },
                }).embed(container, { autoClose: false });
            } catch {
                setFailed(true);
            }
        });
        return () => {
            active = false;
            cancelAnimationFrame(frame);
            container.replaceChildren();
        };
    }, [onSelect]);

    return (
        <AuthDialog titleId="signup-address-title" className="signup-address-dialog" onClose={onClose}>
            <h2 id="signup-address-title">주소 검색</h2>
            <div className="signup-address-embed" ref={containerRef} hidden={failed} />
            {failed && <p className="modal-error-msg" role="alert">주소 검색을 열지 못했습니다. 주소를 직접 입력해 주세요.</p>}
            <Button className="modal-login-btn" autoFocus onClick={onClose}>닫기</Button>
        </AuthDialog>
    );
}
