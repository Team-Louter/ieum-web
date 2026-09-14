function PasswordField({ id, label, value, onChange, show, onToggle, eyeIcon, eyeOffIcon }) {
    return (
        <div className="input-group pw-wrap">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder=" "
                required
            />
            <label htmlFor={id}>{label}</label>
            {value.length > 0 && (
                <button
                    type="button"
                    className="pw-toggle"
                    aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
                    onClick={onToggle}
                >
                    <img src={show ? eyeIcon : eyeOffIcon} alt="" />
                </button>
            )}
        </div>
    );
}

export default PasswordField;
