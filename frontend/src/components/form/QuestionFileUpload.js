import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { formatBytes } from "../../utilities";
import QuestionTitle from "./QuestionTitle";
import Loader from "../Loader";

const QuestionFileUpload = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
  formID,
}) => {
  const questionId = question._id;
  const title = question.titlu;

  const [errors, setErrors] = useState([]);

  const [uploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
      q => q.id === questionId
    );
    setErrors([]);
    setSelectedFile(defaultStateIntrebare && defaultStateIntrebare.fisier);
  }, [question, questionId, raspunsuriIntrebariUtilizator, indexQuestion]);

  const handleSubmit = () => {
    if (!selectedFile) {
      setErrors(["Nu ati încărcat niciun fișier"]);
      return;
    }

    const ext = selectedFile.name.split(".")[1].toUpperCase();
    const sizeInMb = selectedFile.size / 1024 / 1024;

    if (question.atribute) {
      const dimensiuneMaximaFisier = question.atribute.dimensiuneMaximaFisier;
      const tipuriFisierPermise = question.atribute.extensiiFisierPermise;

      console.log(`Extensie curenta ${ext}`);
      console.log(
        `Extensii permise ${JSON.stringify(tipuriFisierPermise, null, 2)}`
      );

      if (tipuriFisierPermise && !tipuriFisierPermise.includes(ext)) {
        setErrors([question.atribute.textRaspunsInvalid]);
        return;
      }

      if (dimensiuneMaximaFisier && sizeInMb > dimensiuneMaximaFisier) {
        setErrors([question.atribute.textRaspunsInvalid]);
        return;
      }
    }

    if (question.obligatoriu && !selectedFile) {
      setErrors(["Aceasta intrebare este obligatorie"]);
      return;
    }

    handleNextQuestion();

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
      tip: question.tip,
    });
  };

  const handleChange = e => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="ml-3">
      <QuestionTitle
        indexQuestion={indexQuestion + 1}
        title={title}
        mandatoryQuestion={question.obligatoriu}
      />

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
            className="form-control"
            type="file"
            id={questionId}
            onChange={e => {
              handleChange(e);
              setErrors([]);
            }}
          />
        </div>

        {errors && (
          <div className="d-flex flex-column txt-danger px-4 py-3">
            {errors.map((error, index) => (
              <div key={index} className="alert alert-danger">
                <p className="danger fs-4">{error}</p>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <>
            <Loader /> <p>Se incarca fisierul catre server</p>
          </>
        )}

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
