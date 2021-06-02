import React from "react";

const AnswerMarkBox = ({ question }) => {
  const inputType =
    question.tip === "Caseta de selectare" ? "checkbox" : "radio";

  return (
    <>
      {question.raspunsuri.map((answer, index) => (
        <div
          key={answer.id}
          className={`form-check fs-4 ${index > 0 ? "mt-4" : "mt-3"}`}
        >
          <input
            className={`form-check-input  ${
              answer.hasOwnProperty("esteCorect")
                ? answer.esteCorect
                  ? "form-input-green"
                  : "checkbox-red"
                : ""
            }`}
            type={inputType}
            value=""
            id={answer.id}
            checked={answer.hasOwnProperty("esteCorect")}
            disabled
          />
          <input
            type="text"
            className={`form-control fs-5 ${
              answer.hasOwnProperty("esteCorect")
                ? answer.esteCorect
                  ? "border-color-green"
                  : "border-color-red"
                : ""
            }`}
            value={answer.titlu}
            disabled
          />
        </div>
      ))}
    </>
  );
};

export default AnswerMarkBox;
