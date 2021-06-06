import React, { useState, useEffect } from "react";

const QuestionTitleEdit = ({
  onChange,
  isMandatoryQuestion,
  questionTitle,
}) => {
  const [title, setTitle] = useState(questionTitle);

  const [isMandatory, setMandatory] = useState(isMandatoryQuestion);

  useEffect(() => {
    setTitle(questionTitle);
    setMandatory(isMandatoryQuestion);
    console.log(`changes ${questionTitle} - ${isMandatoryQuestion}`);
  }, [questionTitle, isMandatoryQuestion]);

  const handleUpdateTitle = e => {
    setTitle(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="input-group my-3 p-4">
      <input
        type="text"
        className="form-control form-input-green text-center fs-4"
        placeholder="Titlul intrebarii"
        onChange={handleUpdateTitle}
        value={title}
      />
      {isMandatory && <sup className="text-danger"> *</sup>}
    </div>
  );
};

export default QuestionTitleEdit;
