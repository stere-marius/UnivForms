import React from "react";

const AnswerTextQuestion = ({ question }) => {
  return (
    <div className="input-group mt-3">
      <input
        type="text"
        className={`form-control  ${
          question.hasOwnProperty("esteCorect")
            ? question.esteCorect
              ? "form-input-green"
              : "border-color-red"
            : ""
        }`}
        id={question.id}
        value={question.raspuns}
        disabled
      />
    </div>
  );
};

export default AnswerTextQuestion;
