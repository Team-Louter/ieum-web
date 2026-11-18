import Button from '../common/Button/Button';

function FieldWithButton({
    id,
    label,
    value,
    onChange,
    buttonText,
    onButtonClick,
    type = 'text',
    readOnly = false,
    describedBy,
    buttonLoading = false,
    buttonLoadingText,
    buttonDisabled = false,
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
                    aria-describedby={describedBy}
                    placeholder=" "
                    required
                />
                <label htmlFor={id}>{label}</label>
            </div>
            {buttonText && (
                <Button
                    className="small-button"
                    onClick={onButtonClick}
                    loading={buttonLoading}
                    loadingText={buttonLoadingText}
                    disabled={buttonDisabled}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
}

export default FieldWithButton;
