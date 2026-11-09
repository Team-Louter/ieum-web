import './Button.css';

export default function Button({
  children,
  loading = false,
  loadingText,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      {...props}
      className={`common-button ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
