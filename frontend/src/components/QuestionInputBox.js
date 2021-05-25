import React, { useState } from "react";
import { Button } from "react-bootstrap";

const QuestionMarkBox = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
}) => {
  const questionId = question._id;
  const title = question.titlu;
  const answers = question.raspunsuri;

  const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
    q => q.id === questionId
  );

  const [raspunsUtilizator, setRaspunsUtilizator] = useState(
    (defaultStateIntrebare && defaultStateIntrebare.raspuns) || ""
  );

  const handleSubmit = () => {
    handleNextQuestion();

    if (!raspunsUtilizator) return;

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
    });
  };

  const handleChange = e => {
    setRaspunsUtilizator(e.target.value);
  };

  return (
    <div className="ml-3">
      <h2 className="text-center p-3">
        {" "}
        {indexQuestion + 1}
        {". "}
        {title}
      </h2>

      <div className="d-flex flex-column justify-content-center">
        <div className="mx-4 d-flex flex-column">
          <label className="my-4 fs-5" htmlFor={questionId}>
            Raspunsul dumneavoastra
          </label>
          <input
            class="form-control"
            type="text"
            placeholder="Introduceti raspunsul"
            id={questionId}
            onChange={handleChange}
            value={raspunsUtilizator}
          />
        </div>

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

export default QuestionMarkBox;
