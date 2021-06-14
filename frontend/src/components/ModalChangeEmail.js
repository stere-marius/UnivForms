import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Message from "./Message";
import Loader from "./Loader";
import { USER_LOGIN_SUCCESS } from "../constants/userConstants";

const ModalChangeEmail = ({ location }) => {
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);

  const [successfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    setErrors(new Set());
    setSuccessfullyUpdated(false);
    setLoading(false);
  }, [show]);

  useEffect(() => {
    if (loading) return;

    if (!location.search) {
      setShow(false);
      return;
    }

    const query = new URLSearchParams(location.search);
    const resetEmailToken = query.get("resetEmailToken");
    const email = query.get("email");

    if (!resetEmailToken) {
      setShow(false);
      return;
    }

    if (!email) {
      setShow(false);
      return;
    }

    setShow(true);

    const handleResetEmail = async (resetToken, email) => {
      if (!resetToken) {
        setErrors(new Set().add("Link invalid resetare email!"));
        return;
      }

      if (!email) {
        setErrors(new Set().add("Email invalid!"));
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

        const { data } = await axios.put(
          `/api/users/profile/email`,
          { resetToken: resetEmailToken, email: email },
          config
        );
        setSuccessfullyUpdated(true);
        setLoading(false);
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: data,
        });
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

    handleResetEmail(resetEmailToken, email);
  }, []);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Schimbare email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mt-3">
            {errors.size > 0 &&
              [...errors].map((error, index) => (
                <Message key={index} variant="danger">
                  {error}
                </Message>
              ))}
            {successfullyUpdated && (
              <Message variant="success">
                Adresa de email a fost actualizată cu success!
              </Message>
            )}
          </div>

          {loading && <Loader />}
        </Modal.Body>

        <Modal.Footer>
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

export default ModalChangeEmail;
