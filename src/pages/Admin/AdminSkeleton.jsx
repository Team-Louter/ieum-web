import Skeleton from '../../components/common/Skeleton/Skeleton';

/** 관리자 목록(문의·질문·소식)을 불러오는 동안 보여 주는 회색 블록입니다. */
export function AdminListSkeleton({ rows = 4, label = '불러오는 중입니다.' }) {
  return (
    <ul className="admin-skeleton-list" role="status" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="admin-skeleton-list__item">
          <Skeleton text width={index % 2 ? '45%' : '62%'} height="18px" />
          <Skeleton text width="90%" height="14px" />
          <Skeleton text width="30%" height="12px" />
        </li>
      ))}
    </ul>
  );
}

export default AdminListSkeleton;
