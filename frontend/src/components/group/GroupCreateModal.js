import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { createGroup } from "../../actions/groupActions";
import Loader from "../Loader";

const GroupCreateModal = ({ showModal, onClose, history }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [groupName, setGroupName] = useState("Grup");

  const [errors, setErrors] = useState(new Set());

  const groupCreate = useSelector(state => state.groupCreate);
  const {
    loading: loadingGroup,
    group: createdGroup,
    success: successCreate,
    error: errorGroup,
  } = groupCreate;

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    setShow(showModal);
    setGroupName("");
    setErrors(new Set());
  }, [showModal]);

  const handleCreateGroup = async () => {
    if (!groupName) {
      setErrors(new Set(errors).add("Introduceti numele grupului!"));
      return;
    }

    await dispatch(createGroup(groupName));

    if (!(successCreate && createdGroup)) return;

    history.push(`/group/${createdGroup._id}/edit`);
  };

  const handleChangeGroupName = e => {
    setGroupName(e.target.value);
    setErrors(new Set());
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Grup nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-between">
            <p>Numele grupului</p>

            <div className="input-group">
              <input
                type="text"
                className="form-control form-input-green"
                placeholder="Numele grupului"
                value={groupName}
                onChange={handleChangeGroupName}
              />
            </div>
          </div>

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div className="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {errorGroup && (
            <div className="my-3">
              <div className="alert alert-danger">{errorGroup}</div>
            </div>
          )}

          {loadingGroup && (
            <>
              <p>Se creeaza grupul</p>
              <Loader />
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleClose}
          >
            Închide
          </button>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleCreateGroup}
          >
            Creeaza grupul
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default withRouter(GroupCreateModal);
