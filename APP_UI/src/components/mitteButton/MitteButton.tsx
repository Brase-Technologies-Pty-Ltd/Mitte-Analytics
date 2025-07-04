import React from "react";
import { Button } from "react-bootstrap";

interface SmartButtonProps {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
    size?: "sm" | "lg";
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    children: React.ReactNode;
    onClick?: any;
    disabled?: boolean;
    className?: string;
}

const MitteButton: React.FC<SmartButtonProps> = ({
    variant = "primary",
    size,
    icon,
    iconPosition = "left",
    children,
    onClick,
    disabled = false,
    className,
}) => {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={onClick}
            disabled={disabled}
            className={`d-flex align-items-center gap-2 ${className}`}
        >
            {icon && iconPosition === "left" && <span>{icon}</span>}
            {children}
            {icon && iconPosition === "right" && <span>{icon}</span>}
        </Button>
    );
};

export default MitteButton;
