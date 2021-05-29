import React, { useState } from "react";

const QuestionAttributes = ({ questionDB, onAttributeChange }) => {
  const [score, setScore] = useState(questionDB.atribute.punctaj || 0);
  const [isMandatoryQuestion, setMandatoryQuestion] = useState(
    questionDB.obligatoriu || false
  );

  const handleChangeMandatoryQuestion = e => {
    setMandatoryQuestion(e.target.checked);
    onAttributeChange({ obligatoriu: e.target.checked });
  };

  const handleChangeScore = e => {
    if (isNaN(e.target.value)) return;
    setScore(e.target.value);
    onAttributeChange({ punctaj: e.target.value });
  };

  return (
    <div className="mx-4 fs-4">
      <div className="d-flex flex-column align-items-start">
        <label class="form-check-label" htmlFor="punctaj">
          Punctaj
        </label>
        <input
          class="form-input-green rounded"
          type="number"
          value={score}
          onChange={handleChangeScore}
          onKeyDown={handleChangeScore}
          onKeyUp={handleChangeScore}
          onInput={handleChangeScore}
          id="punctaj"
        />
      </div>
      <div class="form-check">
        <input
          class="form-check-input form-input-green"
          type="checkbox"
          checked={isMandatoryQuestion}
          onChange={handleChangeMandatoryQuestion}
          id="checkboxIntrebareObligatorie"
        />
        <label class="form-check-label" htmlFor="checkboxIntrebareObligatorie">
          Intrebare obligatorie
        </label>
      </div>
    </div>
  );
};

export default QuestionAttributes;
