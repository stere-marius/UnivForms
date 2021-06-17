import React, { useEffect } from "react";
import Header from "../components/Header";
import { useDispatch } from "react-redux";
import { FORM_DETAILS_RESET } from "../constants/formConstants";

const FormSummaryScreen = ({
  location: { state, isTimeExpired, errorMessage },
  history,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: FORM_DETAILS_RESET });
  });

  const handleButtonClick = () => {
    history.push(`/`);
  };

  useEffect(() => {
    if (!state || !state.formName) {
      history.push(`/`);
    }
  }, [state, history]);

  return !state ? (
    <></>
  ) : (
    <>
      <Header />
      <div
        className="mt-4 container bg-white pb-1 pt-1"
        style={{ borderRadius: "16px" }}
      >
        <div
          className="d-flex flex-column p-4 m-4"
          style={{
            borderRadius: "22px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            backgroundColor: "#EFEFEF",
          }}
        >
          <div className="p-4">
            <h2 className="fw-bold">{state.formName}</h2>

            {isTimeExpired && (
              <div className="alert alert-danger mt-4" role="alert">
                Timpul a expirat!
              </div>
            )}
            <h3 className="fw-bold mt-4">
              {errorMessage || "Raspunsurile au fost transmise cu succes!"}
            </h3>

            <button
              onClick={handleButtonClick}
              className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormSummaryScreen;
