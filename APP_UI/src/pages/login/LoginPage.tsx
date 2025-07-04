
import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import "./login.css";
import authService from "../../services/authSerice";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ForgotPassword from "./ForgotPassword";
import { APP_NAME, IMAGES } from "../../variables";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<any>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authService.login(email, password);

      if (result) {
        const userInfo = await authService.fetchUserData({ token: result });

        localStorage.setItem("token", result);
        localStorage.setItem("loggedInTime", userInfo?.iat);
        localStorage.setItem("expireTime", userInfo?.exp);
        localStorage.setItem("user", JSON.stringify(userInfo.userdata));
        localStorage.setItem("roles", JSON.stringify(userInfo.roles));
        toast.success("Login successful");
        window.location.assign("/dashboard");
      }
    } catch (err: any) {
      toast.error(err);
    }
  };



  const handleForgotPassword = () => {
    // Open the forgot password modal
    setOpenForgotPasswordModal(true);
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Side - Logo */}
        <div className="col-md-6 d-flex flex-column align-items-center justify-content-center logo-section">
          <img src={IMAGES.logo.loginPageLogo} alt="Brand Logo" className="brand-logo-login" />
          <h2 className="mb-3 text-white fw-bold">{APP_NAME}</h2>
        </div>


        {/* Right Side - Login Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center login-section">
          <div className="login-card w-75">
            <img src={IMAGES.logo.loginPageLogoText || ""} alt="Logo" style={{ width: "100%" }} />
            <h2 className=" fw-bold wel-text">
              Welcome Back
            </h2>
            <h5 className="text-muted pb-4 fw-semibold" style={{ fontFamily: "Roboto" }}>
              Login to get started
            </h5>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Please Enter Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="*******************************"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroup.Text
                    style={{ cursor: "pointer", background: "white", borderLeft: "0" }}
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="#"
                  onClick={handleForgotPassword}
                  className="forgotlink text-muted"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button variant="primary" type="submit" className="w-100 modern-btn">
                Login
              </Button>
            </Form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {openForgotPasswordModal && (
        <ForgotPassword
          handleModalClose={() => setOpenForgotPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;
