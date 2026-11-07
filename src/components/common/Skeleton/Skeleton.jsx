import './Skeleton.css';

/** 불러오는 중인 영역을 회색 블록으로 대신 보여주는 기본 조각입니다. */
function Skeleton({ width, height, circle = false, text = false, className = '', style }) {
  const classNames = ['skeleton', circle && 'skeleton--circle', text && 'skeleton--text', className]
    .filter(Boolean)
    .join(' ');

  return <span className={classNames} style={{ width, height, ...style }} aria-hidden="true" />;
}

export default Skeleton;
