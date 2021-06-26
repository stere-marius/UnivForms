import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listFormDetails, updateQuestion } from "../../actions/formActions";
import Loader from "../Loader";
import QuestionAttributes from "./QuestionAttributes";
import QuestionEditButtons from "./QuestionEditButtons";
import QuestionTitleEdit from "./QuestionTitleEdit";

const EditParagraphQuestion = ({
  formID,
  formQuestionDB,
  handleNewQuestion,
}) => {
  const dispatch = useDispatch();

  const [formQuestion, setFormQuestion] = useState(formQuestionDB);

  const [hasSuccessfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const updatedQuestion = useSelector(state => state.formUpdatedQuestion);
  const { loading, success: successUpdated, question, error } = updatedQuestion;

  useEffect(() => {
    setErrors(new Set());
  }, []);

  useEffect(() => {
    if (successUpdated && question) {
      setFormQuestion(question);
    }
  }, [question, successUpdated]);

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

  const handleSaveQuestion = async () => {
    const newQuestion = JSON.parse(JSON.stringify(formQuestion));
    await dispatch(
      updateQuestion(formID, formQuestionDB._id, { intrebare: newQuestion })
    );
    dispatch(listFormDetails(formID));
  };

  const onScoreChange = value => {
    setFormQuestion({ ...formQuestion, punctaj: value });
  };

  return (
    <>
      <QuestionTitleEdit
        onChange={title => setFormQuestion({ ...formQuestion, titlu: title })}
        isMandatoryQuestion={formQuestionDB.obligatoriu}
        questionTitle={formQuestionDB.titlu}
      />
      <div className="mx-4">
        <div className="form-group">
          <textarea
            className="form-control form-input-green"
            id="textAreaQuestion"
            rows="3"
            placeholder="Raspunsul utilizatorului"
            disabled
          />
        </div>
      </div>

      <>
        <div className="mt-5">
          <QuestionAttributes
            questionDB={formQuestionDB}
            onMandatoryAttributeChange={onMandatoryAttributeChange}
            onScoreChange={onScoreChange}
          />
        </div>
      </>
      <div>
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
    </>
  );
};

export default EditParagraphQuestion;
