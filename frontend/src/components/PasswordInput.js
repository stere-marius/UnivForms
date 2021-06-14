import React, { useState } from "react";
import { Form } from "react-bootstrap";

const PasswordInput = ({
  password,
  setPassword,
  id,
  labelText,
  inputPlaceholder,
  textColor,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Form.Group controlId={id} className={`my-3 ${textColor ? textColor : ""}`}>
      {labelText && <Form.Label>{labelText}</Form.Label>}
      <div className="d-flex justify-content-end">
        <Form.Control
          type={showPassword ? "text" : "password"}
          placeholder={inputPlaceholder}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="position-relative form-input-green"
        />
        <i
          className={`fas fa-eye${
            showPassword ? "" : "-slash"
          } align-self-center fs-5 position-absolute cursor-pointer text-dark`}
          style={{ marginRight: ".5rem" }}
          onClick={() => setShowPassword(!showPassword)}
        />
      </div>
    </Form.Group>
  );
};

export default PasswordInput;
