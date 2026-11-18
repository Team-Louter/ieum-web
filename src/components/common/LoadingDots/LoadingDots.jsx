import './LoadingDots.css';

/** 버튼 안에서 처리 중임을 알리는 점 세 개 애니메이션입니다. 글자 색(currentColor)을 따라갑니다. */
function LoadingDots() {
  return (
    <span className="loading-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default LoadingDots;
