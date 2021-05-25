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

  const inputType =
    question.tip === "Caseta de selectare" ? "checkbox" : "radio";

  const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
    q => q.id === questionId
  );

  const [raspunsuriUtilizator, setRaspunsuriUtilizator] = useState(
    (defaultStateIntrebare && defaultStateIntrebare.raspunsuri) || []
  );

  const handleSubmit = () => {
    handleNextQuestion();

    if (raspunsuriUtilizator.length === 0) return;

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
    });
  };

  const handleChange = e => {
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
      <h2 className="text-center p-3">
        {" "}
        {indexQuestion + 1}
        {". "}
        {title}
      </h2>

      <div className="d-flex flex-column justify-content-center">
        <div className="form-check mx-5">
          {answers.map(answer => (
            <div className="py-3" key={answer._id}>
              <input
                className="form-check-input fs-2"
                type={inputType}
                id={answer._id}
                checked={raspunsuriUtilizator.includes(answer._id)}
                onChange={handleChange}
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
