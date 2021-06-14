import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import Message from "./Message";
import Loader from "./Loader";

const ModalResetPassword = ({ location }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [resetToken, setResetToken] = useState("");

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

    if (!resetPasswordToken) {
      setShow(false);
      return;
    }

    setShow(true);
    setResetToken(resetPasswordToken);
  }, []);

  const handleSave = async () => {
    if (!resetToken) {
      setErrors(new Set().add("Link invalid resetare parola!"));
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };
      setLoading(true);

      await axios.put(
        `/api/users/profile/password`,
        { resetToken: resetToken, newPassword: password },
        config
      );
      setSuccessfullyUpdated(true);
      setLoading(false);
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
          <div className="d-flex flex-column justify-content-between">
            <p>Introduceti noua parola</p>

            <div className="input-group">
              <input
                type="password"
                className="form-control form-input-green"
                placeholder="Noua parola"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
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
