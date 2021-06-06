import React from "react";

const QuestionEditButtons = ({ handleSaveQuestion, handleNewQuestion }) => {
  return (
    <div className="d-flex flex-column flex-sm-row mx-4 my-3 justify-content-between">
      <button
        className="btn btn-default mb-4 mb-sm-0 btn btn-color-green text-dark fw-bold"
        onClick={() => handleSaveQuestion()}
      >
        Salveaza
      </button>
      <button
        className="btn btn-default btn-color-green text-dark fw-bold"
        onClick={() => handleNewQuestion()}
      >
        Intrebare noua
      </button>
    </div>
  );
};

export default QuestionEditButtons;
