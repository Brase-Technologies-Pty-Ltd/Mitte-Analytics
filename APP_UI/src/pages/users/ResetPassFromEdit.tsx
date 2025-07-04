import React, { useState } from "react";
import { Form, Alert, Container } from "react-bootstrap";
import authService from "../../services/authSerice";
import MitteButton from "../../components/mitteButton/MitteButton";
import { FaPlusCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";

interface UpdatePasswordProps {
    userId: string;
    handleModalClose?: () => void;
    onClose?: () => void;
}

const ResetPasswordFromEdit: React.FC<UpdatePasswordProps> = ({
    userId,
    handleModalClose,
}) => {
    const [newPassword, setNewPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [errors, setErrors] = useState({
        newPassword: "",
        verifyPassword: "",
    });
    const [updateMessage, setUpdateMessage] = useState<string | null>(null);

    const validatePassword = (password: string): string => {
        const pattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return pattern.test(password)
            ? ""
            : "Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.";
    };

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case "newPassword":
                return value.trim()
                    ? validatePassword(value)
                    : "New Password is required";
            case "verifyPassword":
                return value.trim()
                    ? value === newPassword
                        ? ""
                        : "Passwords do not match"
                    : "Confirm Password is required";
            default:
                return "";
        }
    };

    const handleChange = (name: string, value: string) => {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (name === "newPassword") setNewPassword(value);
        if (name === "verifyPassword") setVerifyPassword(value);
    };

    const handleUpdatePassword = async () => {
        const newPasswordError = validateField("newPassword", newPassword);
        const verifyPasswordError = validateField("verifyPassword", verifyPassword);

        setErrors({
            newPassword: newPasswordError,
            verifyPassword: verifyPasswordError,
        });

        if (newPasswordError || verifyPasswordError) return;

        try {
            const data = { userId, newPassword };
            const response = await authService.updateForAdminPassword(data);
            if (response.message) {
                toast.success(response.message);
                handleModalClose && handleModalClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container>

            <Form>
                <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                        isInvalid={!!errors.newPassword}
                        placeholder="Enter new password"
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.newPassword}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="verifyPassword">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={verifyPassword}
                        onChange={(e) => handleChange("verifyPassword", e.target.value)}
                        isInvalid={!!errors.verifyPassword}
                        placeholder="Re-enter password"
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.verifyPassword}
                    </Form.Control.Feedback>
                </Form.Group>

                {updateMessage && (
                    <Alert variant="danger" className="text-center">
                        {updateMessage}
                    </Alert>
                )}
            </Form>

            <div className="d-flex justify-content-center gap-3">
                <MitteButton variant="success" onClick={handleUpdatePassword} className="w-18" icon={<FaPlusCircle />}>
                    SAVE
                </MitteButton>
                <MitteButton className="text-white w-18" onClick={handleModalClose} variant="warning" icon={<MdCancel />}>CANCEL</MitteButton>
            </div>

        </Container>
    );
};

export default ResetPasswordFromEdit;
