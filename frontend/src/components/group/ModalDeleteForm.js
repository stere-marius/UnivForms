import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getGroupForms } from "../../actions/groupActions";
import { getForms } from "../../actions/userActions";
import Loader from "../Loader";
import Message from "../Message";

const ModalDeleteForm = ({ groupID, currentForms, showModal, onClose }) => {
  const dispatch = useDispatch();

  const userForms = useSelector(state => state.userForms);
  const { loading: loadingForms, error: errorForms, forms } = userForms;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [formsFound, setFormsFound] = useState([]);

  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);

  const [selectedForm, setSelectedForm] = useState(null);

  const [errors, setErrors] = useState(new Set());

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    if (showModal) {
      dispatch(getForms());
    }

    setShow(showModal);
    setErrors(new Set());
  }, [showModal, dispatch]);

  useEffect(() => {
    if (!loadingForms && !errorForms && forms) {
      const formsFound = forms.filter(form =>
        currentForms.some(groupForm => groupForm._id === form._id)
      );

      setFormsFound(formsFound);
      setSelectedForm(formsFound[0] ? formsFound[0]._id : null);
    }
  }, [loadingForms, errorForms, forms, currentForms]);

  const handleDeleteForm = async () => {
    if (!selectedForm) {
      setErrors(new Set().add("Nu ați selectat un formular!"));
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(
        `/api/groups/${groupID}/forms/${selectedForm}`,
        config
      );

      dispatch(getGroupForms(groupID));
      setShow(false);
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
          <Modal.Title>Stergere formular grup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-between">
            <p>Selectati un formular</p>
          </div>

          {formsFound.length > 0 && (
            <div className="mt-3">
              <select
                className="form-select form-input-green"
                onChange={e => setSelectedForm(e.target.value)}
                value={selectedForm}
              >
                {formsFound.map((form, index) => (
                  <option
                    value={`${form._id}`}
                    key={index}
                    selected={index === 0}
                  >
                    {form.titlu}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!loadingForms &&
            !errorForms &&
            ((forms.length === 0 && (
              <p>Nu ați adăugat niciun formular pentru a fi șters din grup</p>
            )) ||
              (formsFound.length === 0 && (
                <p>Nu am gasit un formular care să poată fi șters din grup!</p>
              )))}

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div className="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {errorForms && <Message variant="danger">{errorForms}</Message>}

          {(loading || loadingForms) && <Loader />}
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
            onClick={handleDeleteForm}
          >
            Șterge
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalDeleteForm;
