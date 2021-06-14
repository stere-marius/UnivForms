import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";
import axios from "axios";

const FormAnswersTab = ({ formID, onAnswerChange, onAnswerDelete }) => {
  const formAnswers = useSelector(state => state.formAnswers);
  const {
    loading: loadingAnswers,
    raspunsuri: answers,
    error: errorAnswers,
  } = formAnswers;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [loading, setLoading] = useState(false);

  const [sentMessages, setSentMessages] = useState([]);

  const [errors, setErrors] = useState(new Set());

  const sendUserAnswer = async answer => {
    if (sentMessages.includes(answer.id)) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        `/api/forms/${formID}/answers/${answer.id}/sendUserAnswer`,
        {
          email: answer.utilizator.email,
        },
        config
      );
      setSentMessages([...sentMessages, answer.id]);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

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
                    <button
                      className={`btn-sm btn btn-color-green text-dark text-bold fw-bold ${
                        sentMessages.includes(answer.id) ? "disabled" : ""
                      }`}
                      onClick={() => sendUserAnswer(answer)}
                    >
                      {sentMessages.includes(answer.id)
                        ? "Raspuns trimis"
                        : "Trimite raspuns utilizator"}
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
              {loading && <Loader />}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default FormAnswersTab;
