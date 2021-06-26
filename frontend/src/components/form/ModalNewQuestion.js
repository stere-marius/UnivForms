import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { createQuestion } from "../../actions/formActions";
import {
  CHECKBOX_QUESTION,
  FILE_UPLOAD, PARAGRAPH_QUESTION, RADIO_BUTTON_QUESTION,
  SHORT_TEXT_QUESTION
} from "../../constants/questionTypesConstants";
import Loader from "../Loader";

const ModalNewQuestion = ({ formID, showModal, onClose, onCreate }) => {
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const [questionTitle, setQuestionTitle] = useState("Titlul intrebarii");

  const questionTypes = useRef([
    RADIO_BUTTON_QUESTION,
    CHECKBOX_QUESTION,
    FILE_UPLOAD,
    SHORT_TEXT_QUESTION,
    PARAGRAPH_QUESTION,
  ]);

  const [questionType, setQuestionType] = useState(CHECKBOX_QUESTION);

  const [errors, setErrors] = useState(new Set());

  const createdQuestion = useSelector(state => state.formCreatedQuestion);
  let { loading, error } = createdQuestion;

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    setShow(showModal);
    setQuestionTitle("");
    setErrors(new Set());
  }, [showModal]);

  const handleCreateQuestion = () => {
    if (!questionType) {
      setErrors(new Set(errors).add("Introduceti tipul întrebării!"));
      return;
    }

    if (!questionTitle) {
      setErrors(new Set(errors).add("Introduceti titlul întrebării!"));
      return;
    }

    dispatch(
      createQuestion(
        formID,
        {
          titlu: questionTitle,
          tip: questionType,
        },
        onCreate
      )
    );
  };

  const handleSelectType = e => {
    setQuestionType(e.target.value);
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

            <div className="input-group">
              <input
                type="text"
                className="form-control form-input-green"
                placeholder="Titlul întrebării"
                value={questionTitle}
                onChange={handleChangeQuestionTitle}
              />
            </div>
          </div>

          {questionTypes.current.length > 0 && (
            <div className="mt-3">
              <p>Tipul întrebării</p>
              <select
                className="form-select form-input-green"
                onChange={handleSelectType}
                value={questionType}
              >
                {questionTypes.current.map((questionType, index) => (
                  <option
                    value={`${questionType}`}
                    key={index}
                    selected={index === 0}
                  >
                    {questionType}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div className="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {error && (
            <div className="my-3">
              <div className="alert alert-danger">{error}</div>
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
            onClick={handleCreateQuestion}
          >
            Creează intrebare
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalNewQuestion;
