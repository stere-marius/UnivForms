import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { createForm } from "../actions/formActions";
import { Dropdown, DropdownButton } from "react-bootstrap";
import Loader from "./Loader";
import { withRouter } from "react-router-dom";

const FormCreateModal = ({ showModal, onClose, userGroups, history }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [formTitle, setFormTitle] = useState("Formular");

  const [selectedGroup, setSelectedGroup] = useState({});

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
    setSelectedGroup({});
    setErrors(new Set());
  }, [showModal]);

  useEffect(() => {
    if (successCreate && createdForm) {
      history.push(`/form/${createdForm.id}/edit`);
    }
  }, [successCreate, createdForm]);

  const handleCreateForm = () => {
    if (!formTitle) {
      setErrors(new Set(errors).add("Introduceti titlul formularului!"));
      return;
    }

    dispatch(
      createForm({
        titlu: formTitle,
        grup: selectedGroup.id,
      })
    );
  };

  const handleSelectGroup = e => {
    setSelectedGroup({
      id: e.split("_")[1],
      title: e.split("_")[0],
    });
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

            <div class="input-group">
              <input
                type="text"
                class="form-control form-input-green"
                placeholder="Titlul formularului"
                value={formTitle}
                onChange={handleChangeFormTitle}
              />
            </div>

            {userGroups && userGroups.length > 0 && (
              <div className="my-3">
                <p>Grupul formularului</p>
                {selectedGroup && selectedGroup.title && (
                  <p>{selectedGroup.title}</p>
                )}
                <DropdownButton
                  id="dropdown-groups"
                  title="Selectati un grup"
                  className="fw-bold txt-dark"
                  onSelect={handleSelectGroup}
                >
                  {userGroups.map(group => (
                    <Dropdown.Item eventKey={`${group.nume}_${group._id}`}>
                      {group.nume}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
              </div>
            )}
          </div>

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div class="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {errorForm && (
            <div className="my-3">
              <div class="alert alert-danger">{errorForm}</div>
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
