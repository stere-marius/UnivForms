import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormAnswer } from "../actions/formActions";
import AnswerMarkBox from "./AnswerMarkBox";
import Loader from "./Loader";
import Message from "./Message";

const UserAnswerTab = ({ answerID, formID }) => {
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

  if (loadingSpecificAnswer) return <Loader />;

  if (errorSpecificAnswer)
    return <Message variant="danger">{errorSpecificAnswer}</Message>;

  if (!specificAnswer) return <Loader />;

  return (
    <>
      {specificAnswer.intrebari.map(question => (
        <div
          key={question.id}
          className="d-flex flex-column p-4 m-4 position-relative"
          style={{
            borderRadius: "22px",
            boxShadow: `0px 0px 6px ${
              question.punctajIntrebare === 0
                ? "rgba(0, 0, 0, 0.25)"
                : question.punctajUtilizator !== question.punctajIntrebare
                ? "#FF0000"
                : "rgba(1, 223, 155, 0.75)"
            }`,
            backgroundColor: "#EFEFEF",
          }}
        >
          {question.punctajIntrebare === 0 ? (
            <> </>
          ) : question.punctajUtilizator !== question.punctajIntrebare ? (
            <i
              className="fs-4 fas fa-times position-absolute inline-block"
              style={{ color: "red", top: "5px", left: "14px" }}
            />
          ) : (
            <div
              className="position-absolute"
              style={{ color: "#01df9b", top: "5px", left: "14px" }}
            >
              <i className="fs-4 fas fa-check" />
              <p className="d-inline d-sm-block fw-bold">
                +{question.punctajUtilizator}
              </p>
            </div>
          )}

          <h4 className="text-center">{question.titlu}</h4>
          {question.tip === "Caseta de selectare" ||
          question.tip === "Buton radio" ? (
            <AnswerMarkBox question={question} />
          ) : (
            <> </>
          )}
        </div>
      ))}
    </>
  );
};

export default UserAnswerTab;
