import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails } from "../actions/formActions";
import Header from "../components/Header";
import Message from "../components/Message";
import Loader from "../components/Loader";
import moment from "moment";

const FormMainScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const [timeSubmit, setTimeSubmit] = useState(0);

  const [hasAcceptedTimer, setAcceptedTimer] = useState(false);

  const formDetails = useSelector(state => state.formDetails);
  const { loading = true, error, form } = formDetails;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id));
  }, [match, dispatch]);

  //   useEffect(() => {
  //     setTimeSubmit(form.timpTransmitere);
  //   }, [form.timpTransmitere]);

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
              <h3 className="fw-bold">{form.nume}</h3>
              {form.dataExpirare &&
              new Date(form.dataExpirare) <= Date.now() ? (
                <>
                  <h3 className="mt-5">
                    Din pacăte acest formular a expirat !
                  </h3>
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
                      <i class="fas fa-question-circle fs-4" />
                      <p className="fw-bold fs-4 me-auto ms-3">
                        Intrebari obligatorii
                      </p>
                      <p className="fw-bold fs-4 mx-5">
                        {
                          form.intrebari.map(intrebare => intrebare.obligatoriu)
                            .length
                        }
                      </p>
                    </div>

                    {form.timpTransmitere && (
                      <div className="d-flex align-items-baseline my-3">
                        <i class="fas fa-question-circle fs-4" />
                        <p className="fw-bold fs-4 me-auto ms-3">
                          Timp transmitere
                        </p>
                        <p className="fw-bold fs-4 mx-5">
                          {moment(form.timpTransmitere).format("HH:mm:ss")}
                        </p>
                      </div>
                    )}
                  </div>

                  {form.timpTransmitere && (
                    <>
                      <div class="alert alert-danger fw-bold text-dark">
                        Acest formular contine un timp limitat de transmiterea a
                        informatiilor!
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
      )}
    </>
  );
};

export default FormMainScreen;
