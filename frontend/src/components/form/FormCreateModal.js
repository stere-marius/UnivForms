import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { createForm } from "../../actions/formActions";
import Loader from "../Loader";

const FormCreateModal = ({ showModal, onClose, userGroups, history }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [formTitle, setFormTitle] = useState("Formular");

  const [errors, setErrors] = useState(new Set());

  const formCreate = useSelector(state => state.formCreate);
  const {
    loading: loadingForm,
    form: createdForm,
    success: successCreate,
    error: errorForm,
  } = formCreate;

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    setShow(showModal);
    setFormTitle("");
    setErrors(new Set());
  }, [showModal]);

  useEffect(() => {
    if (successCreate && createdForm) {
      history.push(`/form/${createdForm.id}/edit`);
    }
  }, [successCreate, history, createdForm]);

  const handleCreateForm = async () => {
    if (!formTitle) {
      setErrors(new Set(errors).add("Introduceti titlul formularului!"));
      return;
    }

    dispatch(
      createForm({
        titlu: formTitle,
      })
    );
  };

  const handleChangeFormTitle = e => {
    setFormTitle(e.target.value);
    setErrors(new Set());
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Formular nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-between">
            <p>Titlul formularului</p>

            <div className="input-group">
              <input
                type="text"
                className="form-control form-input-green"
                placeholder="Titlul formularului"
                value={formTitle}
                onChange={handleChangeFormTitle}
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

          {errorForm && (
            <div className="my-3">
              <div className="alert alert-danger">{errorForm}</div>
            </div>
          )}

          {loadingForm && (
            <>
              <p>Se creeaza formularul</p>
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
            onClick={handleCreateForm}
          >
            Creeaza formular
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default withRouter(FormCreateModal);
