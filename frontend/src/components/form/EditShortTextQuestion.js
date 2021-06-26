import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listFormDetails, updateQuestion } from "../../actions/formActions";
import Loader from "../Loader";
import QuestionAttributes from "./QuestionAttributes";
import QuestionEditButtons from "./QuestionEditButtons";
import QuestionTitleEdit from "./QuestionTitleEdit";

const EditShortTextQuestion = ({
  formID,
  formQuestionDB,
  handleNewQuestion,
}) => {
  const dispatch = useDispatch();

  const [formQuestion, setFormQuestion] = useState(formQuestionDB);

  const [answers, setAnswers] = useState(formQuestionDB.raspunsuri || []);

  const [hasSuccessfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const [isPanelAttributes, setPanelAttributesVisible] = useState(true);

  const [isPanelValidate, setPanelValidateVisible] = useState(
    Boolean(formQuestionDB.atribute?.descriereValidare)
  );

  const [selectValue, setSelectValue] = useState(
    formQuestionDB.atribute?.descriereValidare || "NUMAR"
  );

  const [inputValueFormat, setInputValueFormat] = useState({});

  const [invalidAnswer, setInvalidAnswer] = useState(
    formQuestionDB.atribute?.textRaspunsInvalid || ""
  );

  const updatedQuestion = useSelector(state => state.formUpdatedQuestion);
  const { loading, success: successUpdated, question, error } = updatedQuestion;

  useEffect(() => {
    setErrors(new Set());
  }, [
    isPanelAttributes,
    isPanelValidate,
    invalidAnswer,
    selectValue,
    inputValueFormat,
  ]);

  useEffect(() => {
    if (successUpdated && question) {
      setFormQuestion(question);
    }
  }, [question, successUpdated]);

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

  const handleAddResponse = () => {
    setAnswers([
      ...answers,
      {
        raspuns: "",
        tipRaspuns: "RASPUNS_EXACT",
      },
    ]);
  };

  const handleChangeResponse = (e, index) => {
    const newAnswers = answers.map((answer, ansIndex) => {
      if (ansIndex !== index) return answer;
      return {
        ...answer,
        raspuns: e.target.value,
      };
    });
    setAnswers(newAnswers);
    console.log(`handleChangeResponse ${JSON.stringify(newAnswers, null, 2)}`);
  };

  const handleChangeResponseType = (e, index) => {
    const newAnswers = answers.map((answer, ansIndex) => {
      if (ansIndex !== index) return answer;
      return {
        ...answer,
        tipRaspuns: e.target.value,
      };
    });
    setAnswers(newAnswers);
    console.log(
      `handleChangeResponseType ${JSON.stringify(newAnswers, null, 2)}`
    );
  };

  const handleDeleteResponse = index => {
    const newAnswers = answers.filter((_, idx) => idx !== index);
    setAnswers(newAnswers);
  };

  const onMandatoryAttributeChange = value => {
    setFormQuestion({ ...formQuestion, obligatoriu: value });
  };

  const onScoreChange = value => {
    setFormQuestion({ ...formQuestion, punctaj: value });
  };

  const handleChangeSelect = e => {
    setSelectValue(e.target.value);
  };

  const handleChangeValidateInput = e => {
    setInputValueFormat({
      ...inputValueFormat,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveQuestion = async () => {
    const newQuestion = JSON.parse(JSON.stringify(formQuestion));

    newQuestion.raspunsuri = answers;

    console.log(`Answers = ${JSON.stringify(answers, null, 2)}`);

    if (!isPanelValidate) {
      newQuestion.atribute = {};
    }

    if (isPanelValidate) {
      const isNumberFirstInput = !isNaN(inputValueFormat.firstInput);
      const isNumberSecondInput = !isNaN(inputValueFormat.secondInput);
      const isRange = selectValue === "NUMAR IN INTERVAL";

      if (!invalidAnswer) {
        setErrors(
          new Set(errors).add(
            "Textul raspunsului invalid nu trebuie să fie vid!"
          )
        );
        return;
      }

      if (
        !["EXPRESIE REGULATA", "NUMAR", "SIR DE CARACTERE"].includes(
          selectValue
        ) &&
        !isNumberFirstInput
      ) {
        setErrors(
          new Set(errors).add(
            "Primul inverval trebuie să conțină o valoare numerică !"
          )
        );
      }

      if (isRange && (!isNumberFirstInput || !isNumberSecondInput)) {
        setErrors(
          new Set(errors).add(
            "Intervalele numarului trebuie sa conțină valori numerice!"
          )
        );
        return;
      }

      const firstInput =
        selectValue !== "EXPRESIE_REGULATA"
          ? selectValue === "NUMAR IN INTERVAL"
            ? `${+inputValueFormat.firstInput}-${+inputValueFormat.secondInput}`
            : +inputValueFormat.firstInput
          : inputValueFormat.firstInput;

      const attributes = {
        validareRaspuns: firstInput,
        descriereValidare: selectValue,
        textRaspunsInvalid: invalidAnswer,
      };

      newQuestion.atribute = attributes;
    }

    await dispatch(
      updateQuestion(formID, formQuestionDB._id, { intrebare: newQuestion })
    );
    dispatch(listFormDetails(formID));
  };

  return (
    <>
      <QuestionTitleEdit
        onChange={title => setFormQuestion({ ...formQuestion, titlu: title })}
        isMandatoryQuestion={formQuestionDB.obligatoriu}
        questionTitle={formQuestionDB.titlu}
      />
      <div className="mx-4">
        <p>Raspunsul este corect dacă</p>
        {answers.map((answer, index) => (
          <div key={answer._id} className="d-flex flex-column">
            <div className="row row-cols-lg-auto g-3 align-items-center">
              <div className="col-12">
                <select
                  className="form-select col-xs-12 col-sm-6"
                  onChange={e => handleChangeResponseType(e, index)}
                >
                  <option
                    value="RASPUNS_EXACT"
                    selected={answer.tipRaspuns === "RASPUNS_EXACT"}
                  >
                    Este exact
                  </option>
                  <option
                    value="CONTINE_TEXT"
                    selected={answer.tipRaspuns === "CONTINE_TEXT"}
                  >
                    Contine text
                  </option>
                  <option
                    value="POTRIVESTE_REGEX"
                    selected={answer.tipRaspuns === "POTRIVESTE_REGEX"}
                  >
                    Potriveste regex
                  </option>
                </select>
              </div>

              <div className="col-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Raspuns"
                  value={answer.raspuns}
                  onChange={e => handleChangeResponse(e, index)}
                />
              </div>

              {index > 0 && (
                <div className="col-12">
                  <button
                    className="btn btn-danger fw-bold rounded-pill bg-danger "
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Sterge raspunsul"
                    onClick={() => handleDeleteResponse(index)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              )}
            </div>
            {index + 1 !== answers.length && (
              <div className="justify-self-center py-5">
                <p>SAU</p>
              </div>
            )}
          </div>
        ))}

        <div className="d-flex mt-5">
          <button
            className="btn btn-color-green btn-circle btn-xl"
            onClick={handleAddResponse}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Adauga un nou raspuns"
          >
            <i className="fas fa-plus" />
          </button>

          <button
            className="btn btn-color-green mx-5 px-3"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Deschide atributele raspunsului"
            onClick={() => setPanelAttributesVisible(!isPanelAttributes)}
          >
            <i className="fas fa-ellipsis-v" />
          </button>
        </div>
      </div>

      {isPanelAttributes && (
        <>
          <div className="mt-5">
            <QuestionAttributes
              questionDB={formQuestionDB}
              onMandatoryAttributeChange={onMandatoryAttributeChange}
              onScoreChange={onScoreChange}
            />
          </div>

          <div className="form-check mx-4 fs-4">
            <input
              className="form-check-input form-input-green"
              type="checkbox"
              id="checkboxValidareRaspuns"
              checked={isPanelValidate}
              onChange={e => setPanelValidateVisible(e.target.checked)}
            />
            <label
              className="form-check-label "
              htmlFor="checkboxValidareRaspuns"
            >
              Validare raspuns
            </label>
          </div>
          {isPanelValidate && (
            <>
              <div className="row g-3 align-items-center mx-3">
                <div className="col-auto">
                  <label className="col-form-label">Format raspuns</label>
                </div>
                <div className="col-auto">
                  <select
                    className="form-select form-input-green"
                    onChange={handleChangeSelect}
                    value={selectValue}
                  >
                    <option selected={selectValue === "NUMAR"}>NUMAR</option>
                    <option selected={selectValue === "SIR_DE_CARACTERE"}>
                      SIR DE CARACTERE
                    </option>
                    <option selected={selectValue === "NUMAR_MAI_MARE"}>
                      NUMAR MAI MARE DECAT
                    </option>
                    <option selected={selectValue === "NUMAR_MAI_MIC"}>
                      NUMAR MAI MIC DECAT
                    </option>
                    <option selected={selectValue === "NUMAR_EGAL_CU"}>
                      NUMAR EGAL CU
                    </option>
                    <option selected={selectValue === "NUMAR_IN_INTERVAL"}>
                      NUMAR IN INTERVAL
                    </option>
                    <option selected={selectValue === "EXPRESIE_REGULATA"}>
                      EXPRESIE REGULATA
                    </option>
                  </select>
                </div>
                {selectValue === "NUMAR IN INTERVAL" ? (
                  <div className="col-auto">
                    <input
                      type="text"
                      name="firstInput"
                      id="firstInput"
                      placeholder="Primul interval"
                      value={inputValueFormat.firstInput || ""}
                      onChange={handleChangeValidateInput}
                    />
                    <span>-</span>
                    <input
                      type="text"
                      name="secondInput"
                      id="secondInput"
                      placeholder="Al doilea interval"
                      value={inputValueFormat.secondInput || ""}
                      onChange={handleChangeValidateInput}
                    />
                  </div>
                ) : !["NUMAR", "SIR DE CARACTERE"].includes(selectValue) ? (
                  <div className="col-auto">
                    <input
                      type="text"
                      name="firstInput"
                      id="firstInput"
                      placeholder="Primul interval"
                      value={inputValueFormat.firstInput || ""}
                      onChange={handleChangeValidateInput}
                    />
                  </div>
                ) : (
                  <> </>
                )}
              </div>

              <div className="row g-3 align-items-center mx-3 mt-2">
                <div className="col-auto">
                  <label forHtml="raspunsInvalid">Raspuns invalid</label>
                  <input
                    className="mx-3"
                    type="text"
                    name="raspunsInvalid"
                    placeholder="Text raspuns invalid"
                    id="raspunsInvalid"
                    value={invalidAnswer}
                    onChange={e => setInvalidAnswer(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div>
        {errors.size > 0 &&
          [...errors].map((error, index) => (
            <div key={index} className="alert alert-danger mt-3 mx-2">
              {error}
            </div>
          ))}
      </div>

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}
      <div
        className={`alert alert-success mx-4 my-3 ${
          hasSuccessfullyUpdated ? "d-block" : "d-none"
        }`}
      >
        Intrebarea a fost salvata cu succes !
      </div>
      <QuestionEditButtons
        handleSaveQuestion={handleSaveQuestion}
        handleNewQuestion={handleNewQuestion}
      />
    </>
  );
};

export default EditShortTextQuestion;
