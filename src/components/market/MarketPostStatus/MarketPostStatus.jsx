import './MarketPostStatus.css';

function MarketPostStatus({ complete = false }) {
  const isComplete = Boolean(complete);
  const statusClass = isComplete
    ? 'market-post-status--complete'
    : 'market-post-status--in-progress';

  return (
    <span className={`market-post-status ${statusClass}`}>
      {isComplete ? '거래완료' : '거래중'}
    </span>
  );
}

export default MarketPostStatus;
