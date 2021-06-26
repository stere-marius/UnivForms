import axios from "axios";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import Message from "../Message";

const AnswerFileUpload = ({ formID, answerID, question }) => {
  // /:id/answers/:answerID/:questionID/downloadFile

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const handleFileDownload = async () => {
    try {
      if (!userInfo) {
        setError("Trebuie să fii logat pentru a descărca acest fișier!");
        return;
      }

      if (!userInfo.email) {
        setError("Trebuie să fii logat pentru a descărca acest fișier!");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        responseType: "blob",
      };
      setLoading(true);

      const res = await axios.get(
        `/api/forms/${formID}/answers/${answerID}/${question.id}/downloadFile`,
        config
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;

      const filename = question.caleFisier.substring(
        question.caleFisier.lastIndexOf("\\") + 1,
        question.caleFisier.length
      );

      if (typeof window.navigator.msSaveBlob === "function") {
        window.navigator.msSaveBlob(res.data, filename);
      } else {
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      }

      setLoading(false);
      setError("");
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 d-flex flex-column align-items-start">
      <div>
        <h4>
          Fisier:{" "}
          <span className="text-underline">
            {question.caleFisier &&
              question.caleFisier.substring(
                question.caleFisier.lastIndexOf("\\") + 1,
                question.caleFisier.length
              )}
          </span>
        </h4>
      </div>
      {loading && <Loader />}
      {error && <Message variant="danger">{error}</Message>}
      <button
        className="btn btn-color-green fw-bold mt-3"
        onClick={handleFileDownload}
      >
        Descarca fisier
      </button>
    </div>
  );
};

export default AnswerFileUpload;
