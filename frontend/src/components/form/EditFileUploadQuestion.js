import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listFormDetails, updateQuestion } from "../../actions/formActions";
import Loader from "../Loader";
import QuestionAttributes from "./QuestionAttributes";
import QuestionEditButtons from "./QuestionEditButtons";
import QuestionTitleEdit from "./QuestionTitleEdit";

const EditFileUploadQuestion = ({
  formID,
  formQuestionDB,
  handleNewQuestion,
}) => {
  const dispatch = useDispatch();

  const [formQuestion, setFormQuestion] = useState(formQuestionDB);

  const [hasSuccessfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const [extension, setExtension] = useState("");

  const [fileSize, setFileSize] = useState(1);

  const [isExtensionPanel, setExtensionPanel] = useState(
    Boolean(
      formQuestionDB.atribute && formQuestionDB.atribute.extensiiFisierPermise
    ) || false
  );

  const [isFileSizePanel, setFileSizePanel] = useState(
    Boolean(
      formQuestionDB.atribute && formQuestionDB.atribute.dimensiuneMaximaFisier
    ) || false
  );

  const updatedQuestion = useSelector(state => state.formUpdatedQuestion);
  const { loading, success: successUpdated, question, error } = updatedQuestion;

  useEffect(() => {
    setErrors(new Set());
  }, [formQuestion]);

  useEffect(() => {
    if (question && successUpdated) {
      setFormQuestion(question);
      setErrors(new Set());
    }
  }, [question, successUpdated]);

  useEffect(() => {
    if (!formQuestion.atribute) {
      setFormQuestion({ ...formQuestion, atribute: {} });
    }
  }, [formQuestion, formQuestion.atribute]);

  useEffect(() => {
    if (!successUpdated) return;

    setSuccessfullyUpdated(true);

    const timerID = setTimeout(() => {
      setSuccessfullyUpdated(false);
    }, 3000);

    return () => {
      clearTimeout(timerID);
    };
  }, [successUpdated]);

  const onMandatoryAttributeChange = value => {
    setFormQuestion({ ...formQuestion, obligatoriu: value });
  };

  const onScoreChange = value => {
    setFormQuestion({ ...formQuestion, punctaj: value });
  };

  const handleSaveQuestion = async () => {
    if (!formQuestion.titlu) {
      setErrors(
        new Set(errors).add("Titlul intrebarii nu trebuie să fie vid!")
      );
      return;
    }

    if (isFileSizePanel && isNaN(fileSize)) {
      setErrors(
        new Set(errors).add("Dimensiunea fișierului trebuie să fie numerică!")
      );
      return;
    }

    if (
      (isFileSizePanel || isExtensionPanel) &&
      !formQuestion.atribute.textRaspunsInvalid
    ) {
      setErrors(
        new Set(errors).add("Introduceti o descriere pentru raspunsul invalid!")
      );
      return;
    }

    if (!isFileSizePanel) {
      formQuestion.atribute = {
        ...formQuestion.atribute,
        dimensiuneMaximaFisier: undefined,
      };
    }

    if (
      !isExtensionPanel ||
      (formQuestion.atribute &&
        formQuestion.atribute.extensiiFisierPermise.length === 0)
    ) {
      formQuestion.atribute = {
        ...formQuestion.atribute,
        extensiiFisierPermise: undefined,
      };
    }

    if (!isFileSizePanel && !isExtensionPanel) {
      formQuestion.atribute = {
        ...formQuestion.atribute,
        textRaspunsInvalid: undefined,
      };
    }

    if (isFileSizePanel) {
      formQuestion.atribute = {
        ...formQuestion.atribute,
        dimensiuneMaximaFisier: +fileSize,
      };
    }

    console.log(`Am trimis ${JSON.stringify(formQuestion, null, 2)}`);

    await dispatch(
      updateQuestion(formID, formQuestion._id, { intrebare: formQuestion })
    );
    dispatch(listFormDetails(formID));
  };

  const handleAddExtension = () => {
    if (!extension) {
      setErrors(new Set(errors).add("Tipul extensiei nu trebuie să fie vid!"));
      return;
    }

    if (!formQuestion.atribute.extensiiFisierPermise) {
      formQuestion.atribute = {
        ...formQuestion.atribute,
        extensiiFisierPermise: [],
      };
    }

    if (!extension.trim()) return;

    const extensions = formQuestion.atribute.extensiiFisierPermise;
    extensions.push(extension.trim().toUpperCase());

    setFormQuestion({
      ...formQuestion,
      atribute: {
        ...formQuestion.atribute,
        extensiiFisierPermise: extensions,
      },
    });
  };

  const handleDeleteExtension = index => {
    if (!formQuestion.atribute.extensiiFisierPermise) {
      return;
    }

    const extensions = formQuestion.atribute.extensiiFisierPermise;

    if (index >= extensions.length) return;

    extensions.splice(index, 1);
    setFormQuestion({
      ...formQuestion,
      atribute: {
        ...formQuestion.atribute,
        extensiiFisierPermise: extensions,
      },
    });
  };

  const handleChangeFileDimension = e => {
    const value = e.target.value;

    if (value <= 0) return;

    setFileSize(value);
    setFormQuestion({
      ...formQuestion,
      atribute: {
        ...formQuestion.atribute,
        dimensiuneMaximaFisier: value,
      },
    });
  };

  const handleVisibilitySizePanel = e => {
    const value = e.target.checked;
    setFileSizePanel(value);
  };

  const handleChangeInvalidAnswer = e => {
    const value = e.target.value;

    console.log(`Handle change`);

    setFormQuestion({
      ...formQuestion,
      atribute: { ...formQuestion.atribute, textRaspunsInvalid: value },
    });
  };

  return (
    <div className="ml-3">
      <QuestionTitleEdit
        onChange={title => setFormQuestion({ ...formQuestion, titlu: title })}
        isMandatoryQuestion={formQuestion.obligatoriu}
        questionTitle={formQuestion.titlu}
      />
      <div
        className="mx-4 pt-5 pb-5"
        style={{ backgroundColor: "#fff", borderRadius: "13px" }}
      >
        <QuestionAttributes
          questionDB={formQuestion}
          onMandatoryAttributeChange={onMandatoryAttributeChange}
          onScoreChange={onScoreChange}
        />

        <div className="form-check mx-4 fs-4">
          <input
            className="form-check-input form-input-green"
            type="checkbox"
            checked={isFileSizePanel}
            onChange={handleVisibilitySizePanel}
            id="checkboxDimensiuneMaximaFisier"
          />
          <label
            className="form-check-label"
            for="checkboxDimensiuneMaximaFisier"
          >
            Dimensiune maxima fisier in MB
          </label>
        </div>

        {isFileSizePanel && (
          <div className="my-3 mx-4 d-flex flex-column align-items-start">
            <input
              className="form-input-green rounded mt-2"
              type="number"
              value={fileSize}
              style={{ width: "35%" }}
              onChange={handleChangeFileDimension}
              id="dimensiuneMaximaFisier"
            />
          </div>
        )}

        <div className="form-check mx-4 fs-4">
          <input
            className="form-check-input form-input-green"
            type="checkbox"
            checked={isExtensionPanel}
            onChange={e => setExtensionPanel(e.target.checked)}
            id="extensiiFisierPermise"
          />
          <label className="form-check-label" for="extensiiFisierPermise">
            Extensii fisier permise
          </label>
        </div>

        {isExtensionPanel && (
          <div className="mx-4 fs-4 ">
            <div className="row">
              {formQuestion.atribute &&
                formQuestion.atribute.extensiiFisierPermise &&
                formQuestion.atribute.extensiiFisierPermise.map(
                  (ext, index) => (
                    <div key={index} className="col-sm-12 col-md-3">
                      <button
                        key={index}
                        className="d-flex p-0 bg-white border-0 fs-6 mt-3 bg-color-green"
                        style={{
                          borderRadius: "5px",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          className="d-flex align-items-center px-3 py-2 text-dark fw-bold cursor-default"
                          style={{ width: "70%" }}
                        >
                          {ext}
                        </span>
                        <span
                          className="d-flex align-items-center justify-content-center px-3 py-2 text-dark fw-bold bg-danger"
                          style={{ width: "30%" }}
                          onClick={() => handleDeleteExtension(index)}
                        >
                          <i className="fas fa-trash bg-danger fs-5" />
                        </span>
                      </button>
                    </div>
                  )
                )}
            </div>
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-6 col-xl-3 col-xxl-2 mt-3">
                <input
                  type="text"
                  className="form-control form-input-green"
                  placeholder="Extensie noua"
                  value={extension}
                  onChange={e => setExtension(e.target.value)}
                />
                <span
                  className="input-group-text bg-color-green cursor-pointer"
                  id="basic-addon2"
                  onClick={handleAddExtension}
                >
                  Adauga extensie
                </span>
              </div>
            </div>
          </div>
        )}

        {(isFileSizePanel || isExtensionPanel) && (
          <div className="input-group d-flex flex-column mx-4 fs-4">
            <label className="form-check-label mt-3" for="textRaspunsInvalid">
              Text raspuns invalid
            </label>
            <input
              type="text"
              className="form-control form-input-green mt-1"
              placeholder="Text raspuns invalid"
              id="textRaspunsInvalid"
              value={
                (formQuestion.atribute &&
                  formQuestion.atribute.textRaspunsInvalid) ||
                ""
              }
              onChange={handleChangeInvalidAnswer}
              style={{ minWidth: "0", width: "50%" }}
            />
          </div>
        )}

        {errors.size > 0 &&
          [...errors].map((error, index) => (
            <div key={index} className="alert alert-danger mt-3 mx-2">
              {error}
            </div>
          ))}
      </div>

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}
      <div
        className={`alert alert-success mx-4 my-3 ${
          hasSuccessfullyUpdated ? "d-block" : "d-none"
        }`}
      >
        Intrebarea a fost salvata cu succes !
      </div>
      <QuestionEditButtons
        handleSaveQuestion={handleSaveQuestion}
        handleNewQuestion={handleNewQuestion}
      />
    </div>
  );
};

export default EditFileUploadQuestion;
