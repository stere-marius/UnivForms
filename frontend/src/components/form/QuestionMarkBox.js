import React, { useEffect, useState } from "react";
import QuestionTitle from "./QuestionTitle";

const QuestionMarkBox = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
}) => {
  const questionId = question._id;
  const title = question.titlu;
  const answers = question.raspunsuri;

  const inputType =
    question.tip === "Caseta de selectare" ? "checkbox" : "radio";

  const [raspunsuriUtilizator, setRaspunsuriUtilizator] = useState([]);

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
      q => q.id === questionId
    );
    setErrors([]);
    setRaspunsuriUtilizator(
      (defaultStateIntrebare && defaultStateIntrebare.raspunsuri) || []
    );
  }, [indexQuestion, question, questionId, raspunsuriIntrebariUtilizator]);

  const handleSubmit = () => {
    const atributeIntrebare = question.atribute;

    if (atributeIntrebare && atributeIntrebare.validareRaspuns) {
      const {
        selectareMinima: minSelection,
        selectareExacta: exactSelection,
        textRaspunsInvalid: invalidTextMessage,
      } = atributeIntrebare.validareRaspuns;

      if (exactSelection && raspunsuriUtilizator.length !== exactSelection) {
        setErrors([invalidTextMessage]);
        return;
      }

      if (minSelection && raspunsuriUtilizator.length < minSelection) {
        setErrors([invalidTextMessage]);
        return;
      }
    }

    if (question.obligatoriu && raspunsuriUtilizator.length === 0) {
      setErrors(["Aceasta intrebare este obligatorie"]);
      return;
    }

    handleNextQuestion();

    const questionFound = raspunsuriIntrebariUtilizator.find(
      question => question.id === questionId
    );

    if (questionFound) {
      questionFound.raspunsuri = raspunsuriUtilizator;
      return;
    }

    raspunsuriIntrebariUtilizator.push({
      id: question._id,
      raspunsuri: raspunsuriUtilizator,
      tip: question.tip,
    });
  };

  const handleChange = e => {
    if (inputType === "radio" && e.target.checked) {
      setRaspunsuriUtilizator([e.target.id]);
      return;
    }

    if (e.target.checked) {
      setRaspunsuriUtilizator([...raspunsuriUtilizator, e.target.id]);
    } else {
      setRaspunsuriUtilizator(
        raspunsuriUtilizator.filter(idRaspuns => idRaspuns !== e.target.id)
      );
    }
  };

  return (
    <div className="ml-3">
      <QuestionTitle
        indexQuestion={indexQuestion + 1}
        title={title}
        mandatoryQuestion={question.obligatoriu}
      />

      <div className="d-flex flex-column justify-content-center">
        <div className="form-check mx-5">
          {answers.map(answer => (
            <div key={answer._id} className="py-3">
              <input
                className="form-check-input form-input-green fs-2"
                type={inputType}
                id={answer._id}
                checked={raspunsuriUtilizator.includes(answer._id)}
                onChange={e => {
                  handleChange(e);
                  setErrors([]);
                }}
                name={question._id}
              />
              <label
                className="form-check-label text-dark fs-2"
                htmlFor={answer._id}
              >
                {answer.titlu}
              </label>
            </div>
          ))}
        </div>

        {errors && (
          <div className="d-flex flex-column txt-danger px-4 py-3">
            {errors.map((error, index) => (
              <div key={index} className="alert alert-danger">
                <p className="danger fs-4">{error}</p>
              </div>
            ))}
          </div>
        )}

        <div className="d-flex flex-column flex-sm-row mx-4 my-3 justify-content-between">
          <button
            onClick={handleSubmit}
            className="btn btn-color-green mb-4 mb-sm-0 btn btn-color-green text-dark text-bold fw-bold"
          >
            Memoreaza raspuns
          </button>
          <button
            className="btn btn-color-green text-dark text-bold fw-bold"
            onClick={handleNextQuestion}
          >
            Urmatoarea intrebare
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionMarkBox;
