function FieldWithButton({
    id,
    label,
    value,
    onChange,
    buttonText,
    onButtonClick,
    type = 'text',
    readOnly = false,
}) {
    return (
        <div className="input-button-row">
            <div className="input-group">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder=" "
                    required
                />
                <label htmlFor={id}>{label}</label>
            </div>
            <button type="button" className="small-button" onClick={onButtonClick}>
                {buttonText}
            </button>
        </div>
    );
}

export default FieldWithButton;
