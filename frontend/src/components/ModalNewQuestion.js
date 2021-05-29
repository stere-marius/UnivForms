import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { createQuestion } from "../actions/formActions";
import Loader from "./Loader";
import {
  CHECKBOX_QUESTION,
  FILE_UPLOAD,
  RADIO_BUTTON_QUESTION,
  TEXT_QUESTION,
} from "../constants/questionTypesConstants";

const ModalNewQuestion = ({ showModal, onClose }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [questionTitle, setQuestionTitle] = useState("Titlul intrebarii");

  const questionTypes = useRef([
    RADIO_BUTTON_QUESTION,
    CHECKBOX_QUESTION,
    FILE_UPLOAD,
    TEXT_QUESTION,
  ]);

  const [questionType, setQuestionType] = useState(CHECKBOX_QUESTION);

  const [errors, setErrors] = useState(new Set());

  const createdQuestion = useSelector(state => state.formCreatedQuestion);
  const { loading, success, question, error } = createdQuestion;

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    setShow(showModal);
    setQuestionTitle("");
    setErrors(new Set());
  }, [showModal]);

  useEffect(() => {
    if (successCreate && createdForm) {
      history.push(`/form/${createdForm.id}/edit`);
    }
  }, [successCreate, createdForm]);

  const handleCreateQuestion = () => {
    if (!questionType) {
      setErrors(new Set(errors).add("Introduceti titlul întrebării!"));
      return;
    }

    dispatch(
      createQuestion({
        titlu: questionTitle,
        tip: questionType,
      })
    );
  };

  const handleSelectType = e => {
    setQuestionType(e.value);
  };

  const handleChangeQuestionTitle = e => {
    setQuestionTitle(e.target.value);
    setErrors(new Set());
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Întrebare nouă</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-between">
            <p>Titlul întrebării</p>

            <div class="input-group">
              <input
                type="text"
                class="form-control form-input-green"
                placeholder="Titlul întrebării"
                value={formTitle}
                onChange={handleChangeQuestionTitle}
              />
            </div>
          </div>

          {questionTypes.length > 0 && (
            <select
              class="form-select"
              onChange={handleSelectType}
              value={questionType}
            >
              {questionTypes.map((questionType, index) => {
                <option value={questionType} key={index} selected={index === 0}>
                  {questionType}
                </option>;
              })}
            </select>
          )}

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div class="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {error && (
            <div className="my-3">
              <div class="alert alert-danger">{error}</div>
            </div>
          )}

          {loading && (
            <>
              <p>Se creeaza intrebarea</p>
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
            Creează intrebare
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
