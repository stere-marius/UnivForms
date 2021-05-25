import React, { useState, useRef } from "react";
import { Button } from "react-bootstrap";
import { formatBytes } from "../utilities";

const QuestionFileUpload = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
}) => {
  const questionId = question._id;
  const title = question.titlu;

  const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
    q => q.id === questionId
  );

  const [selectedFile, setSelectedFile] = useState(
    (defaultStateIntrebare && defaultStateIntrebare.fisier) || null
  );

  const handleSubmit = () => {
    handleNextQuestion();

    if (!selectedFile) return;

    const questionFound = raspunsuriIntrebariUtilizator.find(
      question => question.id === questionId
    );

    if (questionFound) {
      questionFound.fisier = selectedFile;
      return;
    }

    raspunsuriIntrebariUtilizator.push({
      id: question._id,
      fisier: selectedFile,
    });
  };

  const handleChange = e => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="ml-3">
      <h2 className="text-center p-3">
        {" "}
        {indexQuestion + 1}
        {". "}
        {title}
      </h2>

      {selectedFile && (
        <div className="d-flex flex-column justify-content-center mx-4">
          <p className="fs-4">Fisier atașat</p>
          <p>Nume: {selectedFile.name}</p>
          <p>Dimensiune: {formatBytes(selectedFile.size)}</p>
        </div>
      )}

      <div className="d-flex flex-column justify-content-center">
        <div className="mx-4 d-flex flex-column">
          <input
            class="form-control"
            type="file"
            id={questionId}
            onChange={handleChange}
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

export default QuestionFileUpload;
