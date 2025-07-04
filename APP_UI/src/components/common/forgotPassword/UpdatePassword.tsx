import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { updatePassword } from "../../../services/updatepassword.svc";
import { toast } from "react-toastify";

interface UpdatePasswordProps {
    userId: string | number;
    handleModalClose: () => void;

}

const UpdatePassword: React.FC<UpdatePasswordProps> = ({ userId, handleModalClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [errors, setErrors] = useState<any>({});
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    const validatePassword = (password: string): string => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        return passwordPattern.test(password)
            ? ""
            : "Password must be 8+ characters with uppercase, lowercase, number, and special character.";
    };

    const validateField = (name: string, value: string) => {
        let error = "";
        switch (name) {
            case "currentPassword":
                error = value.trim() ? "" : "Current password is required";
                break;
            case "newPassword":
                error = value.trim() ? validatePassword(value) : "New password is required";
                break;
            case "verifyPassword":
                error = value.trim()
                    ? value === newPassword
                        ? ""
                        : "Passwords do not match"
                    : "Confirm password is required";
                break;
        }
        return error;
    };

    const handleChange = (field: string, value: string) => {
        setErrors((prev: any) => ({ ...prev, [field]: validateField(field, value) }));
        if (field === "currentPassword") setCurrentPassword(value);
        if (field === "newPassword") setNewPassword(value);
        if (field === "verifyPassword") setVerifyPassword(value);
    };

    const handleSubmit = async () => {
        const newErrors = {
            currentPassword: validateField("currentPassword", currentPassword),
            newPassword: validateField("newPassword", newPassword),
            verifyPassword: validateField("verifyPassword", verifyPassword),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some(error => error)) return;

        try {
            const res = await updatePassword({ userId, currentPassword, newPassword });
            if (res.message === 200) {
                toast.success("Password updated successfully");
                handleModalClose();
            } else {
                setUpdateMessage(res.message);
            }
        } catch (err) {
            toast.error("Error updating password");
        }
    };

    return (
        <Form>
            {updateMessage && <Alert variant="danger">{updateMessage}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    isInvalid={!!errors.currentPassword}
                />
                <Form.Control.Feedback type="invalid">{errors.currentPassword}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    isInvalid={!!errors.newPassword}
                />
                <Form.Control.Feedback type="invalid">{errors.newPassword}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    value={verifyPassword}
                    onChange={(e) => handleChange("verifyPassword", e.target.value)}
                    isInvalid={!!errors.verifyPassword}
                />
                <Form.Control.Feedback type="invalid">{errors.verifyPassword}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleModalClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </div>

        </Form>
    );
};

export default UpdatePassword;
