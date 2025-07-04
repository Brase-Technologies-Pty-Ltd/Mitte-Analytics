import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
            {/* Logo */}
            {/* <img src={logo} alt="Logo" className="mb-4" style={{ width: "150px" }} /> */}

            {/* 404 Message */}
            <h1 className="display-1 fw-bold">404</h1>
            <h2 className="mb-3">Page Not Found</h2>
            <p className="text-muted">
                The page you are looking for might have been removed or is temporarily unavailable.
            </p>

            {/* Go to Homepage Button */}
            <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">
                Go to Homepage
            </button>
        </div>
    );
};

export default NotFound;
