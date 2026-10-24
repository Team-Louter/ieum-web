import './EmptyState.css';

function EmptyState({
  title = '아직 항목이 없어요',
  description = '새 항목을 추가해 보세요.',
  actionLabel,
  onAction,
}) {
  return (
    <section className="empty-state" aria-live="polite">
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state__action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default EmptyState;
