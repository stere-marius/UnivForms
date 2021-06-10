import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormAnswer } from "../../actions/formActions";
import axios from "axios";
import Message from "../Message";
import ToggleContainer from "../ToggleContainer";

const AnswerScore = ({ formID, questionID, answerDB, answerID }) => {
  const dispatch = useDispatch();

  const [error, setError] = useState(null);

  const [isPanelVisible, setPanelVisible] = useState(
    Boolean(answerDB.punctajUtilizator)
  );

  const [hasSuccessfullyUpdated, setSuccessfullyUpdated] = useState(false);

  const [answerScore, setAnswerScore] = useState(
    answerDB.punctajUtilizator || 0
  );

  const questionScore = useRef(answerDB.punctajIntrebare || 0);

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    setError(null);
  }, [answerScore, isPanelVisible]);

  const handleSaveScore = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.put(
        `/api/forms/${formID}/answers/${answerID}/${questionID}/score`,
        { punctaj: isPanelVisible ? answerScore : undefined },
        config
      );

      setSuccessfullyUpdated(true);
      await dispatch(getFormAnswer(formID, answerID));
      setTimeout(() => {
        setSuccessfullyUpdated(false);
      }, 3000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  };

  const toggleActive = visibility => {};

  return (
    <div className="mt-3">
      {isPanelVisible && (
        <p>Ați oferit {answerScore} puncte acestui răspuns!</p>
      )}

      <ToggleContainer
        title={"Valideaza acest raspuns"}
        toggleActive={toggleActive}
        containerID={`toggleContainer-${questionID}${formID}`}
      >
        <div className="form-check">
          <input
            className="form-check-input form-input-green"
            type="checkbox"
            value={isPanelVisible}
            checked={isPanelVisible}
            onChange={e => setPanelVisible(e.target.checked)}
            id={`scoreCheck${questionID}${formID}`}
          />
          <label
            className="form-check-label"
            for={`scoreCheck${questionID}${formID}`}
          >
            Valideaza acest raspuns
          </label>
        </div>

        {isPanelVisible && (
          <div className="my-3 d-flex flex-column">
            <label className="form-check-label" htmlFor="punctaj">
              Punctaj
            </label>
            <select
              className="form-select form-input-green"
              onChange={e => setAnswerScore(e.target.value)}
            >
              {[...Array(questionScore.current + 1).keys()].map(score => (
                <option selected={answerScore === score} value={score}>
                  {score}
                </option>
              ))}
            </select>
          </div>
        )}

        {hasSuccessfullyUpdated && (
          <Message variant="success">
            Punctajul a fost modificat cu succes
          </Message>
        )}

        {error && <Message variant="danger">{error}</Message>}

        <button
          className="btn btn-color-green px-3 mt-4"
          onClick={handleSaveScore}
        >
          Salveaza
        </button>
      </ToggleContainer>
    </div>
  );
};

export default AnswerScore;
