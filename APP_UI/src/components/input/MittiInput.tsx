import React from "react";
import { Form } from "react-bootstrap";
import classNames from "classnames";

const MitteInput: React.FC<any> = ({
  label,
  name,
  error,
  helperText,
  fullWidth,
  size = "medium",
  required,
  className,
  ...rest
}) => {
  const inputClass = classNames("form-control", className, {
    "is-invalid": !!error,
    "form-control-sm": size === "small",
    "w-100": fullWidth,
  });

  return (
    <Form.Group controlId={name} className="mb-3">
      {label && (
        <Form.Label className="mb-1">
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
      )}
      <Form.Control
        className={inputClass}
        name={name}
        isInvalid={!!error}
        {...rest}
      />
      {error ? (
        <div className="invalid-feedback d-block">{error}</div>
      ) : (
        helperText && <Form.Text className="text-muted">{helperText}</Form.Text>
      )}
    </Form.Group>
  );
};

export default MitteInput;
