import './SettingItem.css';

function SettingItem({ title, description, actionLabel, onAction, trailing, children, className = '' }) {
  return (
    <section className={`setting-item ${className}`}>
      <header className="setting-item__header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {actionLabel ? (
          <button type="button" onClick={onAction}>
            {actionLabel} <span aria-hidden="true">↗</span>
          </button>
        ) : (
          trailing
        )}
      </header>
      {children && <div className="setting-item__content">{children}</div>}
    </section>
  );
}

export default SettingItem;
