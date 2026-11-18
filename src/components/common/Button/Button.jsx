import { useRef, useState } from 'react';
import './Button.css';
import LoadingDots from '../LoadingDots/LoadingDots';

/**
 * 공용 버튼입니다. loading이 true이면 글자 대신 점 세 개가 움직이고 다시 누를 수 없습니다.
 * onClick이 Promise를 돌려주면(서버 요청) 끝날 때까지 자동으로 같은 상태가 됩니다.
 * loadingText는 화면에는 보이지 않고 스크린리더에만 읽힙니다.
 */
export default function Button({
  children,
  loading = false,
  loadingText,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const [isClickBusy, setIsClickBusy] = useState(false);
  const lockRef = useRef(false);
  const isLoading = loading || isClickBusy;

  async function handleClick(event) {
    if (lockRef.current) {
      event.preventDefault();
      return;
    }
    const result = onClick?.(event);
    if (result && typeof result.then === 'function') {
      lockRef.current = true;
      setIsClickBusy(true);
      try {
        await result;
      } catch {
        // 오류 안내는 호출한 쪽에서 합니다.
      } finally {
        lockRef.current = false;
        setIsClickBusy(false);
      }
    }
  }

  return (
    <button
      {...props}
      className={`common-button ${className}${isLoading ? ' is-loading' : ''}`.trim()}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-label={isLoading && loadingText ? loadingText : props['aria-label']}
      onClick={onClick ? handleClick : undefined}
    >
      {isLoading ? (
        <>
          <span className="common-button__content">{children}</span>
          <span className="common-button__dots">
            <LoadingDots />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
