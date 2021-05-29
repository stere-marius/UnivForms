import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateQuestion } from "../actions/formActions";
import Loader from "./Loader";
import QuestionMarkBoxAttributesPanel from "./QuestionAttributesPanel";
import QuestionAttributes from "./QuestionAttributes";

const CreateMarkBox = ({ formID, formQuestionDB }) => {
  const dispatch = useDispatch();

  const [formQuestion, setFormQuestion] = useState(formQuestionDB);

  const [hasSuccessfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [answersPanel, setAnswersPanel] = useState([]);

  const [isQuestionPanelVisible, setQuestionPanelVisible] = useState(false);

  const [inputType, setInputType] = useState("checkbox");

  const [errors, setErrors] = useState(new Set());

  const updatedQuestion = useSelector(state => state.formUpdatedQuestion);
  const { loading, success: successUpdated, question, error } = updatedQuestion;

  useEffect(() => {
    setErrors(new Set());
    // TODO: Load image from database if there is one
  }, [formQuestion]);

  useEffect(() => {
    if (question && successUpdated) {
      setFormQuestion(question);
    }
  }, [question, successUpdated]);

  useEffect(() => {
    if (!formQuestion.atribute) {
      setFormQuestion({ ...formQuestion, atribute: {} });
    }
  }, [formQuestion.atribute]);

  useEffect(() => {
    if (!successUpdated) return;

    setSuccessfullyUpdated(true);

    const timerID = setTimeout(() => {
      setSuccessfullyUpdated(false);
    }, 3000);

    return () => {
      clearTimeout(timerID);
    };
  }, [successUpdated]);

  const onAttributeChange = attributes => {
    setFormQuestion({
      ...formQuestion,
      atribute: { ...formQuestion.atribute, ...attributes },
    });
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

  const handleSaveQuestion = () => {
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

    dispatch(
      updateQuestion(formID, formQuestionDB._id, { intrebare: formQuestion })
    );
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
    <div
      className="d-flex flex-column p-4 m-4"
      style={{
        borderRadius: "22px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        backgroundColor: "#EFEFEF",
      }}
    >
      <div className="ml-3">
        <div class="input-group my-3 p-4">
          <input
            type="text"
            class="form-control form-input-green text-center fs-4"
            placeholder="Titlul intrebarii"
            onChange={e =>
              setFormQuestion({ ...formQuestion, titlu: e.target.value })
            }
            value={formQuestion.titlu}
          />
          {formQuestion.obligatoriu && <sup className="text-danger"> *</sup>}
        </div>

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
                    type={inputType}
                    name={formQuestion.titlu}
                    checked={
                      (formQuestion.raspunsuri[index].atribute &&
                        formQuestion.raspunsuri[index].atribute
                          .raspunsCorect) ||
                      false
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
                    <i class="fas fa-ellipsis-v" />
                  </button>
                  <button
                    className="btn btn-default btn-color-green fw-bold rounded-pill px-3 ms-5 bg-danger border-0"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Sterge raspunsul"
                    onClick={() => deleteAnswer(index)}
                  >
                    <i class="fas fa-trash" />
                  </button>
                </div>
                {answersPanel.includes(index) && (
                  <div className="d-flex mt-3">
                    <div class="form-check form-input-green">
                      <input
                        class="form-check-input form-input-green"
                        type="checkbox"
                        value=""
                        id={index}
                        checked={
                          (formQuestion.raspunsuri[index].atribute &&
                            formQuestion.raspunsuri[index].atribute
                              .raspunsCorect) ||
                          false
                        }
                        onChange={e => handleCheckboxCorrectAnswer(e, index)}
                      />
                      <label class="form-check-label" for="flexCheckDefault">
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
            <i class="fas fa-plus" />
          </button>
          <button
            className="btn btn-default btn-color-green fw-bold rounded-pill px-3 ms-5"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Deschide atributele raspunsului"
            onClick={() => setQuestionPanelVisible(!isQuestionPanelVisible)}
          >
            <i class="fas fa-ellipsis-v" />
          </button>
        </div>
        {isQuestionPanelVisible && (
          <div
            className="mx-4 pt-5 pb-5"
            style={{ backgroundColor: "#fff", borderRadius: "13px" }}
          >
            <QuestionAttributes
              questionDB={formQuestion}
              onAttributeChange={onAttributeChange}
            />
            <QuestionMarkBoxAttributesPanel
              questionDB={formQuestion}
              onAttributeChange={onAttributeChange}
            />
          </div>
        )}

        {loading && <Loader />}
        {error && <div className="alert alert-danger">{error}</div>}
        <div
          className={`alert alert-success mx-4 my-3 ${
            hasSuccessfullyUpdated ? "d-block" : "d-none"
          }`}
        >
          Intrebarea a fost salvata cu succes !
        </div>

        <div className="d-flex flex-column flex-sm-row mx-4 my-3 justify-content-between">
          <button
            className="btn btn-default mb-4 mb-sm-0 btn btn-color-green text-dark fw-bold"
            onClick={() => handleSaveQuestion()}
          >
            Salveaza
          </button>
          <button className="btn btn-default btn-color-green text-dark fw-bold">
            Intrebare noua
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMarkBox;
