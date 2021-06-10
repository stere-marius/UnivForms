import React, { useState, useEffect } from "react";

const AnswerParagraph = ({ question }) => {
  return (
    <div className="input-group mt-3">
      <textarea
        type="text"
        className={`form-control`}
        id={question.id}
        value={question.raspuns}
        disabled
      />
    </div>
  );
};

export default AnswerParagraph;
