import { useLayoutEffect, useRef } from 'react';
import './IDsearch.css';

export default function AuthDialog({ titleId, onClose, className = '', children }) {
    const dialogRef = useRef(null);

    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        dialog.showModal();
        return () => dialog.close();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className={`modal-box ${className}`}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const { top, right, bottom, left } = event.currentTarget.getBoundingClientRect();
                if (event.clientX < left || event.clientX >= right ||
                    event.clientY < top || event.clientY >= bottom) onClose();
            }}
        >
            {children}
        </dialog>
    );
}
