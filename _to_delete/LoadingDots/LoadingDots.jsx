import './LoadingDots.css';

/** 로딩 중임을 알리는 점 세 개를 차례로 깜빡입니다. 문구(children)를 주면 그 뒤에 붙고, label만 주면 점만 보입니다. */
function LoadingDots({ children, label }) {
  return (
    <span className="loading-dots" aria-label={children ? undefined : label}>
      {children}
      <span className="loading-dots__dot" aria-hidden="true">.</span>
      <span className="loading-dots__dot" aria-hidden="true">.</span>
      <span className="loading-dots__dot" aria-hidden="true">.</span>
    </span>
  );
}

export default LoadingDots;
