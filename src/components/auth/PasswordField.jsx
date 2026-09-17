import { useState } from 'react';
import eyeIcon from '../../assets/images/Eye.svg';
import eyeOffIcon from '../../assets/images/EyeOff.svg';

function PasswordField({ id, label, value, onChange }) {
    const [show, setShow] = useState(false);

    let inputType = 'password';
    let icon = eyeOffIcon;

    if (show) {
        inputType = 'text';
        icon = eyeIcon;
    }

    function togglePassword() {
        setShow(!show);
    }

    return (
        <div className="input-group pw-wrap">
            <input
                id={id}
                type={inputType}
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
                    onClick={togglePassword}
                >
                    <img src={icon} alt="" />
                </button>
            )}
        </div>
    );
}

export default PasswordField;
