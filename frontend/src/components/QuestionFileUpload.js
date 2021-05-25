import React, { useState, useRef } from "react";
import { Button } from "react-bootstrap";
import { formatBytes } from "../utilities";
import QuestionTitle from "./QuestionTitle";
import Loader from "./Loader";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const QuestionFileUpload = ({
  question,
  indexQuestion,
  raspunsuriIntrebariUtilizator,
  handleNextQuestion,
  formID,
}) => {
  const questionId = question._id;
  const title = question.titlu;

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [errors, setErrors] = useState([]);

  const [uploading, setUploading] = useState(false);

  const defaultStateIntrebare = raspunsuriIntrebariUtilizator.find(
    q => q.id === questionId
  );

  const [selectedFile, setSelectedFile] = useState(
    (defaultStateIntrebare && defaultStateIntrebare.fisier) || null
  );

  const uploadFileHandler = async e => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("formID", formID);
    formData.append("questionID", questionId);

    setUploading(true);

    // const { utilizator, formId, intrebareID, formData } = request.body;

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/forms/uploadFormResponse",
        formData,
        config
      );
      setErrors([data]);
      setUploading(false);
    } catch (error) {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setErrors(["Nu ati încărcat niciun fișier"]);
      return;
    }

    const ext = selectedFile.name.split(".")[1];
    const sizeInMb = selectedFile.size / 1024 / 1024;

    if (question.atribute) {
      const dimensiuneMaximaFisier = question.atribute.dimensiuneMaximaFisier;
      const tipuriFisierPermise = question.atribute.tipuriFisierPermise;

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

    uploadFileHandler();
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
            class="form-control"
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
            {errors.map(error => (
              <div className="alert alert-danger">
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
