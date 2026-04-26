import { useEffect } from 'react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onCancel]);

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal confirm-dialog animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">确认操作</h2>
                <p className="confirm-dialog-message">{message}</p>
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        罢了
                    </button>
                    <button type="button" className="btn btn-danger" onClick={onConfirm}>
                        确认焚毁
                    </button>
                </div>
            </div>
        </div>
    );
}
