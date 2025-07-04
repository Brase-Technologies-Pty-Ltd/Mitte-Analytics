import React from 'react';
import './SmartConfirmAlert.css';
import { RiDeleteBin6Line } from "react-icons/ri";


interface Props {
    show: boolean;
    title?: string;
    message?: string;
    isShowDeleteIcon?: boolean;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const SmartConfirmAlert: React.FC<Props> = ({ show, title = "Are you sure?", message = "Do you really want to delete these records? This process cannot be undone.", onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isShowDeleteIcon = true }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 1151 }}>
            <div className="modal-container">
                <button className="close-btn" onClick={onCancel}>×</button>

                <div className="modal-icon">{isShowDeleteIcon ?? <RiDeleteBin6Line />}</div>

                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>

                <div className="modal-actions gap-3">
                    {onCancel &&
                        <button type="button" onClick={onCancel} className="btn btn-secondary">{cancelText || "Cancel"}</button>
                    }
                    <button type="button" onClick={onConfirm} className="btn btn-danger">{confirmText || "Confirm"}</button>
                </div>
            </div>
        </div>
    );
};

export default SmartConfirmAlert;
