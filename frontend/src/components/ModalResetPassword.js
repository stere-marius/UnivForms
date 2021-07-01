import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Loader from "./Loader";
import Message from "./Message";
import PasswordInput from "./PasswordInput";

const ModalResetPassword = ({ location }) => {
  const [resetToken, setResetToken] = useState("");

  const [email, setEmail] = useState("");

  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);

  const [successfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const [password, setPassword] = useState("");

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    setErrors(new Set());
    setSuccessfullyUpdated(false);
    setLoading(false);
  }, [show, password]);

  useEffect(() => {
    if (loading) return;

    if (!location.search) {
      setShow(false);
      return;
    }

    const query = new URLSearchParams(location.search);
    const resetPasswordToken = query.get("resetPasswordToken");
    const email = query.get("email");

    if (!resetPasswordToken) {
      setShow(false);
      return;
    }

    if (!email) {
      setShow(false);
      return;
    }

    setShow(true);
    setResetToken(resetPasswordToken);
    setEmail(email);
  }, [loading, location.search]);

  const handleSave = async () => {
    if (!resetToken) {
      setErrors(new Set().add("Link invalid resetare parola!"));
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      setLoading(true);

      await axios.put(
        `/api/users/profile/password`,
        { resetToken, newPassword: password, email },
        config
      );
      setSuccessfullyUpdated(true);
      setLoading(false);
      setTimeout(() => setShow(false), 1000);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Schimbare parola</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            <PasswordInput
              password={password}
              setPassword={setPassword}
              id="password"
              labelText="Introduceti noua parola"
              inputPlaceholder="Noua parola"
              textColor="text-dark"
            />
          </div>

          <div className="mt-3">
            {errors.size > 0 &&
              [...errors].map((error, index) => (
                <Message key={index} variant="danger">
                  {error}
                </Message>
              ))}
            {successfullyUpdated && (
              <Message variant="success">
                Parola a fost actualizată cu success!
              </Message>
            )}
          </div>

          {loading && <Loader />}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleSave}
          >
            Salveaza
          </button>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleClose}
          >
            Închide
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalResetPassword;
