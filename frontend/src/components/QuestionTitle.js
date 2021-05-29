import React from "react";

const QuestionTitle = ({ indexQuestion, title, mandatoryQuestion }) => {
  return (
    <h2 className="text-center p-3">
      {" "}
      {indexQuestion}
      {". "}
      {title}
      {mandatoryQuestion && <sup className="text-danger"> *</sup>}
    </h2>
  );
};

export default QuestionTitle;
