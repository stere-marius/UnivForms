import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormAnswer } from "../../actions/formActions";
import AnswerFileUpload from "./AnswerFileUpload";
import AnswerMarkBox from "./AnswerMarkBox";
import AnswerTextQuestion from "./AnswerTextQuestion";
import Loader from "../Loader";
import Message from "../Message";
import AnswerScore from "./AnswerScore";
import AnswerParagraph from "./AnswerParagraph";
import {
  FILE_UPLOAD,
  PARAGRAPH_QUESTION,
} from "../../constants/questionTypesConstants";

const UserAnswerTab = ({ answerID, formID, isFormOwner }) => {
  const dispatch = useDispatch();

  const formSpecificAnswer = useSelector(state => state.formAnswer);
  const {
    loading: loadingSpecificAnswer,
    raspuns: specificAnswer,
    error: errorSpecificAnswer,
  } = formSpecificAnswer;

  useEffect(() => {
    dispatch(getFormAnswer(formID, answerID));
  }, [formID, answerID, dispatch]);

  const getBoxShadowQuestion = question => {
    const {
      punctajIntrebare: score,
      tip: type,
      punctajUtilizator: userScore,
    } = question;

    if (score === 0) return "0px 0px 6px rgba(0, 0, 0, 0.25)";

    if (type === FILE_UPLOAD || type === PARAGRAPH_QUESTION)
      return userScore
        ? "0px 0px 6px rgba(1, 223, 155, 0.75)"
        : "0px 0px 6px rgba(52, 152, 219, 1)";

    return `0px 0px 6px ${
      question.punctajUtilizator !== question.punctajIntrebare
        ? "#FF0000"
        : "rgba(1, 223, 155, 0.75)"
    }`;
  };

  const getIconQuestion = question => {
    if (question.punctajIntrebare === 0) return <> </>;

    const { tip: type, punctajUtilizator: userScore } = question;

    if ((type === FILE_UPLOAD || type === PARAGRAPH_QUESTION) && !userScore) {
      if (!userScore) {
        return (
          <i
            class="fs-4 fas fa-exclamation  position-absolute inline-block"
            style={{ color: "#2980b9", top: "5px", left: "14px" }}
          />
        );
      }
    }

    if ((type === FILE_UPLOAD || type === PARAGRAPH_QUESTION) && userScore) {
      return (
        <div
          className="position-absolute"
          style={{ color: "#01df9b", top: "5px", left: "14px" }}
        >
          <i className="fs-4 fas fa-exclamation" />
          <p className="d-inline d-sm-block fw-bold">
            +{question.punctajUtilizator}
          </p>
        </div>
      );
    }

    if (question.punctajUtilizator !== question.punctajIntrebare)
      return (
        <i
          className="fs-4 fas fa-times position-absolute inline-block"
          style={{ color: "red", top: "5px", left: "14px" }}
        />
      );

    return (
      <div
        className="position-absolute"
        style={{ color: "#01df9b", top: "5px", left: "14px" }}
      >
        <i className="fs-4 fas fa-check" />
        <p className="d-inline d-sm-block fw-bold">
          +{question.punctajUtilizator}
        </p>
      </div>
    );
  };

  if (loadingSpecificAnswer) return <Loader />;

  if (errorSpecificAnswer)
    return <Message variant="danger">{errorSpecificAnswer}</Message>;

  if (!specificAnswer) return <Loader />;

  return (
    <>
      <div
        className="fs-4 d-flex flex-column p-4 m-4 position-relative"
        style={{
          borderRadius: "22px",
          boxShadow: `0px 0px 6px rgba(0, 0, 0, 0.25)`,
          backgroundColor: "#EFEFEF",
        }}
      >
        <p>Nume: {specificAnswer.utilizator.nume || " NULL"}</p>
        <p>Prenume: {specificAnswer.utilizator.prenume || " NULL"}</p>
        <p>Email: {specificAnswer.utilizator.email || " NULL"}</p>
        {specificAnswer.punctajTotal > 0 && (
          <p>Scor total: {specificAnswer.punctajUtilizator || " NULL"}</p>
        )}
      </div>
      {specificAnswer.intrebari.map(question => (
        <div
          key={question.id}
          className="d-flex flex-column p-4 m-4 position-relative"
          style={{
            borderRadius: "22px",
            boxShadow: `${getBoxShadowQuestion(question)}`,
            backgroundColor: "#EFEFEF",
          }}
        >
          {getIconQuestion(question)}
          <h4 className="text-center">{question.titlu}</h4>
          {question.tip === "Caseta de selectare" ||
          question.tip === "Buton radio" ? (
            <AnswerMarkBox question={question} />
          ) : question.tip === "Raspuns text scurt" ? (
            <AnswerTextQuestion question={question} />
          ) : question.tip === "Raspuns paragraf" ? (
            <>
              <AnswerParagraph
                formID={formID}
                answerID={answerID}
                question={question}
              />
              {isFormOwner && (
                <AnswerScore
                  formID={formID}
                  questionID={question.id}
                  answerDB={question}
                  answerID={answerID}
                />
              )}
            </>
          ) : question.tip === "Incarcare fisier" ? (
            <>
              <AnswerFileUpload
                formID={formID}
                answerID={answerID}
                question={question}
              />
              {isFormOwner && (
                <AnswerScore
                  formID={formID}
                  questionID={question.id}
                  answerDB={question}
                  answerID={answerID}
                />
              )}
            </>
          ) : (
            <> </>
          )}
        </div>
      ))}
    </>
  );
};

export default UserAnswerTab;
