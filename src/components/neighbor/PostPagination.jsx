export default function PostPagination({
  communityPage = 0,
  hasNext = false,
  onCommunityPageChange,
  isLoading = false,
}) {
  if (!onCommunityPageChange || (communityPage === 0 && !hasNext)) return null;
  return (
    <nav
      aria-label="게시물 페이지"
      style={{
        display: 'flex',
        gap: 16,
        justifyContent: 'center',
        margin: '24px 0',
      }}
    >
      <button
        type="button"
        disabled={isLoading || communityPage === 0}
        onClick={() => onCommunityPageChange(communityPage - 1)}
      >
        이전
      </button>
      <span>{communityPage + 1}페이지</span>
      <button
        type="button"
        disabled={isLoading || !hasNext}
        onClick={() => onCommunityPageChange(communityPage + 1)}
      >
        다음
      </button>
    </nav>
  );
}
