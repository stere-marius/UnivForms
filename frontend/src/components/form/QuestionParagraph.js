import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import QuestionTitle from "./QuestionTitle";

const QuestionParagraph = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
}) => {
  const questionId = question._id;
  const title = question.titlu;

  const [errors, setErrors] = useState([]);

  const [raspunsUtilizator, setRaspunsUtilizator] = useState("");

  useEffect(() => {
    const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
      q => q.id === questionId
    );
    setErrors([]);
    setRaspunsUtilizator(
      (defaultStateIntrebare && defaultStateIntrebare.raspuns) || ""
    );
  }, [indexQuestion, question, questionId, raspunsuriIntrebariUtilizator]);

  const handleSubmit = () => {
    if (!raspunsUtilizator) {
      setErrors(["Nu ati furnizat niciun răspuns"]);
      return;
    }

    if (question.obligatoriu && !raspunsUtilizator) {
      setErrors(["Aceasta intrebare este obligatorie"]);
      return;
    }

    handleNextQuestion();

    const questionFound = raspunsuriIntrebariUtilizator.find(
      question => question.id === questionId
    );

    if (questionFound) {
      questionFound.raspuns = raspunsUtilizator;
      return;
    }

    raspunsuriIntrebariUtilizator.push({
      id: question._id,
      raspuns: raspunsUtilizator,
      tip: question.tip,
    });
  };

  const handleChange = e => {
    setRaspunsUtilizator(e.target.value);
  };

  return (
    <div className="ml-3">
      <QuestionTitle
        indexQuestion={indexQuestion + 1}
        title={title}
        mandatoryQuestion={question.obligatoriu}
      />

      <div className="d-flex flex-column justify-content-center">
        <div className="mx-4 d-flex flex-column">
          <label className="my-4 fs-5" htmlFor={questionId}>
            Raspunsul dumneavoastra
          </label>
          <textarea
            className="form-control"
            placeholder="Introduceti raspunsul"
            id={questionId}
            onChange={handleChange}
            value={raspunsUtilizator}
          />
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
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="mb-4 mb-sm-0"
          >
            Memoreaza raspuns
          </Button>
          <Button variant="primary" onClick={handleNextQuestion}>
            Urmatoarea intrebare
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionParagraph;
