import React, { useState } from "react";

const QuestionAttributes = ({
  questionDB,
  onMandatoryAttributeChange,
  onScoreChange,
}) => {
  const [score, setScore] = useState(questionDB.punctaj || 0);
  const [isMandatoryQuestion, setMandatoryQuestion] = useState(
    questionDB.obligatoriu || false
  );

  const handleChangeMandatoryQuestion = e => {
    setMandatoryQuestion(e.target.checked);
    onMandatoryAttributeChange(e.target.checked);
  };

  const handleChangeScore = e => {
    if (isNaN(e.target.value)) return;
    setScore(e.target.value);
    onScoreChange(e.target.value);
  };

  return (
    <div className="mx-4 fs-4">
      <div className="d-flex flex-column align-items-start">
        <div className="form-check ">
          <input
            className="form-check-input form-input-green"
            type="checkbox"
            checked={isMandatoryQuestion}
            onChange={handleChangeMandatoryQuestion}
            id="checkboxIntrebareObligatorie"
          />
          <label
            className="form-check-label"
            htmlFor="checkboxIntrebareObligatorie"
          >
            Intrebare obligatorie
          </label>
        </div>
        <div className="my-3 d-flex flex-column">
          <label className="form-check-label" htmlFor="punctaj">
            Punctaj
          </label>
          <input
            className="form-input-green rounded mt-2"
            type="number"
            value={score}
            style={{ width: "35%" }}
            onChange={handleChangeScore}
            id="punctaj"
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionAttributes;
