import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails } from "../actions/formActions";
import Header from "../components/Header";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { formatToHHMMSS } from "../utilities";
import Meta from "../components/Meta";
import { FORM_DETAILS_RESET } from "../constants/formConstants";

const FormMainScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const formDetails = useSelector(state => state.formDetails);
  const { loading = true, error, form } = formDetails;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch({ type: FORM_DETAILS_RESET });
    dispatch(listFormDetails(match.params.id, true));
  }, [match, dispatch, history, userInfo]);

  const handleAccept = () => {
    history.push(`/form/${match.params.id}/view`);
  };

  const handleFormExpireButton = () => {
    history.push(`/`);
  };

  return (
    <>
      <Header />
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Meta title={`${form.titlu}`} />
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
                <h3 className="fw-bold">{form.titlu}</h3>
                {form.messages ? (
                  <>
                    {form.messages.map((message, index) => (
                      <h3 key={index} className="mt-5">
                        {message}
                      </h3>
                    ))}
                    <button
                      className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold"
                      onClick={handleFormExpireButton}
                    >
                      OK
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="d-flex flex-column mt-5"
                      style={{ width: "45%" }}
                    >
                      <div className="d-flex align-items-baseline my-3">
                        <i className="fas fa-question fs-4" />
                        <p className="fw-bold fs-4 me-auto ms-3">Intrebari</p>
                        <p className="fw-bold fs-4 mx-5">
                          {form.intrebari.length}
                        </p>
                      </div>

                      <div className="d-flex align-items-baseline my-3">
                        <i className="fas fa-question-circle fs-4" />
                        <p className="fw-bold fs-4 me-auto ms-3">
                          Intrebari obligatorii
                        </p>
                        <p className="fw-bold fs-4 mx-5">
                          {
                            form.intrebari.map(
                              intrebare => intrebare.obligatoriu
                            ).length
                          }
                        </p>
                      </div>

                      {form.timpTransmitere && (
                        <div className="d-flex align-items-baseline my-3">
                          <i className="fas fa-question-circle fs-4" />
                          <p className="fw-bold fs-4 me-auto ms-3">
                            Timp transmitere
                          </p>
                          <p className="fw-bold fs-4 mx-5">
                            {formatToHHMMSS(form.timpTransmitere)}
                          </p>
                        </div>
                      )}
                    </div>

                    {form.timpTransmitere && (
                      <>
                        <div className="alert alert-danger fw-bold text-dark">
                          Acest formular contine un timp limitat de transmiterea
                          a raspunsurilor!
                        </div>
                      </>
                    )}
                    <button
                      className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold"
                      onClick={handleAccept}
                    >
                      Acceptă
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FormMainScreen;
