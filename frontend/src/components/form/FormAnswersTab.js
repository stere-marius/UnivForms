import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";

const FormAnswersTab = ({ onAnswerChange, onAnswerDelete }) => {
  const dispatch = useDispatch();
  const formAnswers = useSelector(state => state.formAnswers);
  const {
    loading: loadingAnswers,
    raspunsuri: answers,
    error: errorAnswers,
  } = formAnswers;

  return (
    <>
      {loadingAnswers ? (
        <Loader />
      ) : errorAnswers ? (
        <Message variant="danger">{errorAnswers}</Message>
      ) : (
        <div className="table-responsive">
          <table className="table-sm mt-3 table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer, index) => (
                <tr key={answer.id}>
                  <td>
                    {index + 1}
                    {". "}
                    {answer.utilizator.email}
                  </td>
                  <td>{answer.utilizator.nume}</td>
                  <td>{answer.utilizator.prenume}</td>
                  <td>
                    <button
                      className={
                        "btn-sm btn btn-color-green text-dark text-bold fw-bold "
                      }
                      onClick={() => onAnswerChange(answer.id)}
                    >
                      Selectati raspunsul
                    </button>
                  </td>
                  <td>
                    <i
                      className="fas fa-trash cursor-pointer"
                      style={{ color: "red" }}
                      onClick={() => onAnswerDelete(answer.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default FormAnswersTab;
