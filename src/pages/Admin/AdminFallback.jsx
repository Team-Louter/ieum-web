import Skeleton from '../../components/common/Skeleton/Skeleton';

/** 관리자 화면 코드를 내려받는 동안 보여 주는 뼈대입니다. 관리자 화면의 CSS가 아직 없으므로 스타일을 직접 지정합니다. */
function AdminFallback() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="관리자 화면을 불러오는 중입니다."
      style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}
    >
      <Skeleton width="160px" height="32px" />
      <div style={{ display: 'flex', gap: 12 }}>
        <Skeleton width="72px" height="28px" />
        <Skeleton width="120px" height="28px" />
        <Skeleton width="110px" height="28px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Skeleton height="26px" width="30%" />
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} height="64px" />
        ))}
      </div>
    </div>
  );
}

export default AdminFallback;
