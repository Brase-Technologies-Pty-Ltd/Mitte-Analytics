import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { resetPassword, sendOtp, validateOtp } from "../../services/user.auth";
import OTPInput from "./OtpInput";
import "./forgotpass.css";
import MitteButton from "../../components/mitteButton/MitteButton";
import { BsForwardFill } from "react-icons/bs";
import { toast } from "react-toastify";

interface ForgotPasswordProps {
    handleModalClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ handleModalClose }) => {
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer =
            seconds > 0 || minutes > 0
                ? setInterval(() => {
                    if (seconds > 0) {
                        setSeconds(seconds - 1);
                    } else if (minutes > 0) {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                }, 1000)
                : undefined;

        return () => clearInterval(timer);
    }, [minutes, seconds]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return toast.info("Please Enter email");

        try {
            setLoading(true);
            const res = await sendOtp({ email });
            if (res.status === 200) {
                setOtpSent(true);
                setMinutes(1);
                setSeconds(0);
                toast.success("OTP sent successfully.");
            } else {
                toast.error(res.message || "Failed to send OTP.");
            }
        } catch (error) {
            toast.error("Error sending OTP.");
        } finally {
            setLoading(false);
        }
    };


    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return toast.info("Enter OTP");

        try {
            const res = await validateOtp({ email, otp });
            if (res.status === 200) {
                setShowPasswordDialog(true);
                toast.success("OTP validated successfully.");
            } else {
                toast.error(res.message || "Failed to validate OTP.");
            }
        } catch {
            toast.error("Error validating OTP.");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.info("All fields are required.");
            return
        }

        if (password !== confirmPassword) {
            toast.info("Passwords do not match.")
            return
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordPattern.test(password)) {
            toast.info("Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character.");
            return
        }

        try {
            setLoading(true);
            const res = await resetPassword({ email, password, confirmPassword });
            if (res.status === 200) {
                toast.success("Password reset successfully.");
                handleModalClose();
            } else {
                toast.error(res.message || "Failed to reset password.");
            }
        } catch {
            toast.error("Error resetting password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show onHide={handleModalClose} centered>
            <Modal.Header
                closeButton
                style={{ backgroundColor: "#0f8945", color: "white" }}
                closeVariant="white"
            >
                <Modal.Title>Forgot Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>

                {!otpSent && !showPasswordDialog && (
                    <>
                        <h2 style={{ color: "#0F8945", fontSize: "16px", paddingBottom: "30px", textAlign: "center" }}>
                            Enter a Registered Email to generate OTP
                        </h2>
                        <Form>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-center mt-3">
                                <MitteButton
                                    variant="success"
                                    className="mitte-button-success"
                                    disabled={loading}
                                    onClick={handleSendOtp}
                                >
                                    <BsForwardFill className="ms-2" />
                                    {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
                                </MitteButton>
                            </div>
                        </Form>
                    </>

                )}

                {otpSent && !showPasswordDialog && (
                    <Form onSubmit={handleVerifyOtp}>
                        <Form.Group>
                            <Form.Label>Enter OTP</Form.Label>
                            <OTPInput length={4} onChangeOTP={setOtp} />
                        </Form.Group>
                        <div className="text-muted mt-2">
                            Time left: {minutes}:{seconds.toString().padStart(2, "0")}
                        </div>
                        <Button type="submit" variant="success" className="mt-3">
                            Verify OTP
                        </Button>
                    </Form>
                )}

                {showPasswordDialog && (
                    <Form>
                        <Form.Group>
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mt-2">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <MitteButton variant="primary" className="mt-3" disabled={loading} onClick={handleResetPassword}>
                            {loading ? <Spinner animation="border" size="sm" /> : "Reset Password"}
                        </MitteButton>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ForgotPassword;
