import React from "react";
import { Modal } from "react-bootstrap";

const ConfirmationModal = ({
  showModal,
  title,
  body,
  textConfirm,
  textClose,
  onConfirm,
  onClose,
}) => {
  return (
    <>
      <Modal show={showModal} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{body}</Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={onConfirm}
          >
            {textConfirm}
          </button>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={onClose}
          >
            {textClose}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ConfirmationModal;
