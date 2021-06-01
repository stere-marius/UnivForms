import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails, updateQuestion } from "../actions/formActions";
import Loader from "./Loader";
import QuestionMarkBoxAttributesPanel from "./QuestionAttributesPanel";
import QuestionAttributes from "./QuestionAttributes";
import QuestionEditButtons from "./QuestionEditButtons";
import QuestionTitleEdit from "./QuestionTitleEdit";

const CreateMarkBox = ({ formID, formQuestionDB, handleNewQuestion }) => {
  const dispatch = useDispatch();

  const [formQuestion, setFormQuestion] = useState(formQuestionDB);

  const [answersPanel, setAnswersPanel] = useState([]);

  const [isQuestionPanelVisible, setQuestionPanelVisible] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const updatedQuestion = useSelector(state => state.formUpdatedQuestion);
  const { loading, success: successUpdated, error } = updatedQuestion;

  useEffect(() => {
    setErrors(new Set());
  }, [formQuestion]);

  useEffect(() => {
    if (!formQuestion.atribute) {
      setFormQuestion({ ...formQuestion, atribute: {} });
    }
  }, [formQuestion, formQuestion.atribute]);

  const onAttributeChange = attributes => {
    setFormQuestion({
      ...formQuestion,
      atribute: { ...formQuestion.atribute, ...attributes },
    });
  };

  const onMandatoryAttributeChange = value => {
    setFormQuestion({ ...formQuestion, obligatoriu: value });
  };

  const onScoreChange = value => {
    setFormQuestion({ ...formQuestion, punctaj: value });
  };

  const handleAddResponse = e => {
    const answers = formQuestion.raspunsuri;
    answers.push({
      titlu: `Raspuns ${answers.length + 1}`,
      imagine: "",
      atribute: {},
    });

    setFormQuestion({
      ...formQuestion,
      raspunsuri: [...answers],
    });
  };

  const handleSaveQuestion = async () => {
    if (!formQuestion.titlu) {
      setErrors(
        new Set(errors).add("Titlul intrebarii nu trebuie să fie vid!")
      );
      return;
    }

    if (formQuestion.raspunsuri.length === 0) {
      setErrors(new Set(errors).add("Intrebarea nu conține niciun răspuns!"));
      return;
    }

    await dispatch(
      updateQuestion(formID, formQuestionDB._id, { intrebare: formQuestion })
    );
    dispatch(listFormDetails(formID));
  };

  const handleResponseChange = e => {
    const newAnswers = formQuestion.raspunsuri.map((answer, index) => {
      if (index !== +e.target.id) return answer;
      return { ...answer, titlu: e.target.value };
    });
    setFormQuestion({ ...formQuestion, raspunsuri: [...newAnswers] });
  };

  const deleteAnswer = index => {
    const answers = formQuestion.raspunsuri;
    const newAnswers = answers.filter(
      (_, answerIndex) => answerIndex !== index
    );
    setFormQuestion({ ...formQuestion, raspunsuri: [...newAnswers] });
  };

  const toggleQuestionPanel = index => {
    if (answersPanel.includes(index)) {
      setAnswersPanel(
        answersPanel.filter(indexQuestion => indexQuestion !== index)
      );
      return;
    }
    setAnswersPanel([...answersPanel, index]);
  };

  const handleCheckboxCorrectAnswer = e => {
    const newAnswers = formQuestion.raspunsuri.map((answer, index) => {
      if (index !== +e.target.id) return answer;
      return {
        ...answer,
        atribute: { ...answer.atribute, raspunsCorect: e.target.checked },
      };
    });

    setFormQuestion({ ...formQuestion, raspunsuri: [...newAnswers] });
  };

  return (
    <div className="ml-3">
      <QuestionTitleEdit
        onChange={title => setFormQuestion({ ...formQuestion, titlu: title })}
        isMandatoryQuestion={formQuestion.obligatoriu}
        questionTitle={formQuestion.titlu}
      />

      <div className="d-flex flex-column justify-content-center">
        <div className="form-check mx-5">
          {formQuestion.raspunsuri.map((answer, index) => (
            <div key={index}>
              <div
                className="py-3 mt-4 text-dark"
                style={{ width: "100%" }}
                key={index}
              >
                <input
                  className="form-check-input form-input-green fs-2"
                  type={
                    formQuestionDB.tip === "Caseta de selectare"
                      ? "checkbox"
                      : "radio"
                  }
                  checked={
                    (answer.atribute && answer.atribute.raspunsCorect) || false
                  }
                  disabled
                />
                <input
                  type="text"
                  className="form-control text-dark fs-2 form-input-green "
                  id={index}
                  onChange={handleResponseChange}
                  spellCheck={false}
                  value={formQuestion.raspunsuri[index].titlu}
                />
              </div>
              <div className="d-flex mt-3">
                <button
                  className="btn btn-default btn-color-green fw-bold rounded-pill px-3"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Deschide atributele raspunsului"
                  onClick={() => toggleQuestionPanel(index)}
                >
                  <i className="fas fa-ellipsis-v" />
                </button>
                <button
                  className="btn btn-default btn-color-green fw-bold rounded-pill px-3 ms-5 bg-danger border-0"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Sterge raspunsul"
                  onClick={() => deleteAnswer(index)}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
              {answersPanel.includes(index) && (
                <div className="d-flex mt-3">
                  <div className="form-check form-input-green">
                    <input
                      className="form-check-input form-input-green"
                      type="checkbox"
                      value=""
                      id={index}
                      checked={
                        (answer.atribute && answer.atribute.raspunsCorect) ||
                        false
                      }
                      onChange={e => handleCheckboxCorrectAnswer(e, index)}
                    />
                    <label className="form-check-label" for="flexCheckDefault">
                      Raspuns corect
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex flex-row mx-3 my-3 justify-content-end">
        <button
          className="btn btn-default btn-color-green fw-bold rounded-circle"
          onClick={handleAddResponse}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Adauga un nou raspuns"
        >
          <i className="fas fa-plus" />
        </button>
        <button
          className="btn btn-default btn-color-green fw-bold rounded-pill px-3 ms-5"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Deschide atributele raspunsului"
          onClick={() => setQuestionPanelVisible(!isQuestionPanelVisible)}
        >
          <i className="fas fa-ellipsis-v" />
        </button>
      </div>
      {isQuestionPanelVisible && (
        <div
          className="mx-4 pt-5 pb-5"
          style={{ backgroundColor: "#fff", borderRadius: "13px" }}
        >
          <QuestionAttributes
            questionDB={formQuestion}
            onMandatoryAttributeChange={onMandatoryAttributeChange}
            onScoreChange={onScoreChange}
          />
          <QuestionMarkBoxAttributesPanel
            questionDB={formQuestion}
            onAttributeChange={onAttributeChange}
          />
        </div>
      )}

      {errors.length > 0 &&
        errors.map((error, index) => (
          <div key={index} className="alert alert-danger">
            {error}
          </div>
        ))}

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}
      <div
        className={`alert alert-success mx-4 my-3 ${
          successUpdated ? "d-block" : "d-none"
        }`}
      >
        Intrebarea a fost salvata cu succes !
      </div>
      <QuestionEditButtons
        handleSaveQuestion={handleSaveQuestion}
        handleNewQuestion={handleNewQuestion}
      />
    </div>
  );
};

export default CreateMarkBox;
