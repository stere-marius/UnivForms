import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails, sendFormResponse } from "../actions/formActions";
import Loader from "../components/Loader";
import QuestionMarkBox from "../components/QuestionMarkBox";
import QuestionInputBox from "../components/QuestionInputBox";
import CountdownTimer from "../components/CountdownTimer";
import Message from "../components/Message";
import { Button, Table } from "react-bootstrap";
import {
  RADIO_BUTTON_QUESTION,
  CHECKBOX_QUESTION,
  TEXT_QUESTION,
  FILE_UPLOAD,
} from "../constants/questionTypesConstants";
import QuestionFileUpload from "../components/QuestionFileUpload";

const FormViewScreen = ({ match, history }) => {
  const tabs = [
    "Intrebare curenta",
    "Intrebari anterioare",
    "Trimitere formular",
  ];

  const dispatch = useDispatch();

  const [indexQuestion, setIndexQuestion] = useState(0);

  const [selectedTab, setSelectedTab] = useState("Intrebare curenta");

  const [raspunsuriIntrebariUtilizator] = useState([]);

  const [errorsSubmit, setErrorsSubmit] = useState([]);

  const [progressSendResponse, setProgressSendResponse] = useState(0);

  const timeLeft = useRef(0);

  const formDetails = useSelector(state => state.formDetails);
  const { loading, error, form } = formDetails;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const formResponse = useSelector(state => state.formResponse);
  const {
    loading: loadingSendResponse,
    success: successSendResponse,
    error: errorsSendResponse,
  } = formResponse;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id));
  }, [match, dispatch, userInfo, history]);

  useEffect(() => {
    if (form.dataValiditate && Date.now() < new Date(form.dataValiditate)) {
      history.push(`/form/${form._id}/main`);
      return;
    }

    if (form.dataExpirare && new Date(form.dataExpirare) <= Date.now()) {
      history.push(`/form/${form._id}/main`);
      return;
    }
  }, [form.dataValiditate, form._id, history, form.dataExpirare]);

  useEffect(() => {
    setErrorsSubmit([]);
  }, [raspunsuriIntrebariUtilizator.length]);

  useEffect(() => {
    if (new Date(form.dataExpirare) <= Date.now()) {
      history.push(`/form/${match.params.id}`);
    }
  }, [form.dataExpirare, history, match.params.id]);

  useEffect(() => {
    if (progressSendResponse === 100 && successSendResponse) {
      history.push({
        pathname: `/form/${match.params.id}/summary`,
        state: { formName: `${form.titlu}` },
        isTimeExpired: form.timpTransmitere && timeLeft.current <= 0,
      });
    }
  }, [
    progressSendResponse,
    successSendResponse,
    form.timpTransmitere,
    form.titlu,
    history,
    match.params.id,
  ]);

  useEffect(() => {
    if (indexQuestion >= form.intrebari?.length) {
      setSelectedTab("Trimitere formular");
    }
  }, [indexQuestion, form.intrebari]);

  const handleNextQuestion = () => {
    setIndexQuestion(indexQuestion + 1);
  };

  const onTimeExpire = () => {
    // TODO: Transmitere formular
    sendUserAnswers();
  };

  const onTimeLeftChange = time => {
    timeLeft.current = time;
  };

  const sendUserAnswers = () => {
    const formData = new FormData();

    const files = raspunsuriIntrebariUtilizator
      .filter(intrebare => intrebare.tip === FILE_UPLOAD)
      .map(intrebare => ({
        file: intrebare.fisier,
        id: intrebare.id,
      }));

    files.forEach(file => {
      formData.append(`${file.id}`, file.file);
    });

    formData.append("formID", form._id);
    formData.append("timeLeft", timeLeft.current);
    formData.append("answers", JSON.stringify(raspunsuriIntrebariUtilizator));
    console.log(`formData: ${JSON.stringify(formData, null, 40)}`);

    dispatch(
      sendFormResponse(formData, progressEv => {
        const completed = Math.round(
          (progressEv.loaded * 100) / progressEv.total
        );
        console.log(`progress ${completed}`);
        setProgressSendResponse(completed);
      })
    );
  };

  const handleSubmitForm = async () => {
    if (!raspunsuriIntrebariUtilizator.length) {
      const setErrors = new Set([
        ...errorsSubmit,
        "Nu ați oferit niciun răspuns pentru acest formular",
      ]);
      setErrorsSubmit([...setErrors]);
      console.log(`raspunsuriIntrebariUtilizator.length`);
      return;
    }

    const mandatoryQuestions = form.intrebari
      .map(question => ({
        id: question._id.toString(),
        titlu: question.titlu,
        obligatoriu: question.obligatoriu,
      }))
      .filter(
        question =>
          question.obligatoriu &&
          !raspunsuriIntrebariUtilizator.find(
            answer => answer.id === question.id
          )
      );

    console.log(`${JSON.stringify(mandatoryQuestions, null, 40)}`);

    if (mandatoryQuestions.length > 0) {
      // Iau toate intrebarile care nu se gasesc cu ID-ul în răspunsuriIntrebăriUtilizator

      const setErrors = new Set([...errorsSubmit]);

      mandatoryQuestions.forEach(question => {
        setErrors.add(`Nu ati oferit un raspuns la "${question.titlu}"`);
      });

      setErrorsSubmit([...setErrors]);
      console.log(`mandatoryQuestions`);
      return;
    }

    console.log(`Sending user answers `);
    sendUserAnswers();
  };

  // TODO: Sa-i afisez intrebarile anterioare ca fiind intrebarile carora le-a dat skip sau la care a raspuns

  const renderTabs = () =>
    tabs.map(tab => {
      const isSelectedTab = selectedTab === tab;
      const fontBold = isSelectedTab && "fw-bold";
      const textColor = selectedTab === tab ? "#000" : "rgba(0, 0, 0, 0.7)";

      return (
        <li
          className="nav-item pt-4 px-4 pb-2"
          key={tab}
          style={{ cursor: "pointer" }}
        >
          <p
            className={"nav-item text-decoration-none " + fontBold}
            style={{ color: textColor, cursor: "pointer" }}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </p>
        </li>
      );
    });

  const renderTabNav = () => (
    <div>
      <ul className="nav nav-tabs flex-column align-items-center align-items-sm-start flex-sm-row justify-content-center">
        {renderTabs()}
        {renderTimer()}
      </ul>

      {renderCurrentQuestionTab()}
      {renderPreviousQuestionsTab()}
      {renderFormSendTab()}
    </div>
  );

  const renderTimer = () => {
    return (
      form.timpTransmitere && (
        <li className="nav-item px-4 pt-4 pb-2 ms-md-auto">
          <p className="text-dark fw-bold">
            <CountdownTimer
              initialSeconds={form.timpTransmitere}
              onEnd={onTimeExpire}
              onTimeLeftChange={onTimeLeftChange}
            />
          </p>
        </li>
      )
    );
  };
  const renderCurrentQuestionTab = () => {
    if (selectedTab !== "Intrebare curenta") return <> </>;

    if (!(form.intrebari && form.intrebari[indexQuestion])) return <> </>;

    const tipIntrebare = form.intrebari[indexQuestion].tip;

    if (
      tipIntrebare === CHECKBOX_QUESTION ||
      tipIntrebare === RADIO_BUTTON_QUESTION
    )
      return (
        <QuestionMarkBox
          question={form.intrebari[indexQuestion]}
          indexQuestion={indexQuestion}
          raspunsuriIntrebariUtilizator={raspunsuriIntrebariUtilizator}
          handleNextQuestion={handleNextQuestion}
        />
      );

    if (tipIntrebare === TEXT_QUESTION) {
      return (
        <QuestionInputBox
          question={form.intrebari[indexQuestion]}
          indexQuestion={indexQuestion}
          raspunsuriIntrebariUtilizator={raspunsuriIntrebariUtilizator}
          handleNextQuestion={handleNextQuestion}
        />
      );
    }

    if (tipIntrebare === FILE_UPLOAD) {
      return (
        <QuestionFileUpload
          question={form.intrebari[indexQuestion]}
          indexQuestion={indexQuestion}
          raspunsuriIntrebariUtilizator={raspunsuriIntrebariUtilizator}
          handleNextQuestion={handleNextQuestion}
          formID={form._id}
        />
      );
    }
  };

  const renderPreviousQuestionsTab = () => (
    <>
      {selectedTab === "Intrebari anterioare" && form.intrebari && (
        <Table striped bordered hover response className="table-sm mt-3">
          <thead>
            <tr>
              <th>Titlul intrebarii</th>
              <th>Intrebare obligatorie</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {form.intrebari.map((question, index) => (
              <tr key={question._id}>
                <td>
                  {index + 1}
                  {". "}
                  {question.titlu}
                </td>
                <td>
                  {question.obligatoriu ? (
                    <i className="fas fa-check" style={{ color: "#01df9b" }} />
                  ) : (
                    <i className="fas fa-times" style={{ color: "red" }} />
                  )}
                </td>
                <td>
                  <Button
                    className={
                      "btn-sm btn btn-color-green text-dark text-bold fw-bold " +
                      (index === indexQuestion && " disabled")
                    }
                    onClick={() => {
                      setIndexQuestion(index);
                      setSelectedTab("Intrebare curenta");
                    }}
                  >
                    Selectati intrebarea
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );

  const renderFormSendTab = () => {
    if (selectedTab !== "Trimitere formular") return <> </>;

    return (
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
          <div className="d-flex flex-column mt-5" style={{ width: "45%" }}>
            <div className="d-flex align-items-baseline my-3">
              <i className="fas fa-question fs-4" />
              <p className="fw-bold fs-4 me-auto ms-3">Intrebari</p>
              <p className="fw-bold fs-4 mx-5">{form.intrebari.length}</p>
            </div>

            <div className="d-flex align-items-baseline my-3">
              <i class="fas fa-question-circle fs-4" />
              <p className="fw-bold fs-4 me-auto ms-3">Intrebari obligatorii</p>
              <p className="fw-bold fs-4 mx-5">
                {form.intrebari.map(intrebare => intrebare.obligatoriu).length}
              </p>
            </div>

            <div className="d-flex align-items-baseline my-3">
              <i class="fas fa-align-left fs-4" />
              <p className="fw-bold fs-4 me-auto ms-3">Raspunsurile tale</p>
              <p className="fw-bold fs-4 mx-5">
                {raspunsuriIntrebariUtilizator.length}
              </p>
            </div>
          </div>

          {loadingSendResponse && progressSendResponse && (
            <>
              <p>Se transmit raspunsurile...</p>
              <div class="progress">
                <div
                  class="progress-bar"
                  role="progressbar"
                  style={{ width: `${progressSendResponse}%` }}
                  aria-valuenow={progressSendResponse}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progressSendResponse}%
                </div>
              </div>
            </>
          )}

          {errorsSendResponse &&
            (Array.isArray(errorsSendResponse) ? (
              errorsSendResponse.map(error => (
                <div class="alert alert-danger">
                  {error.title} - {error.error}
                  <span> Treci la intrebare</span>
                </div>
              ))
            ) : (
              <div class="alert alert-info">{errorsSendResponse}</div>
            ))}

          {errorsSubmit.length > 0 &&
            errorsSubmit.map(error => (
              <div class="alert alert-danger">{error}</div>
            ))}

          <Button
            onClick={handleSubmitForm}
            className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold"
          >
            Trimite formular
          </Button>
        </div>
      </div>
    );
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
          className="mt-4 container bg-white pb-1"
          style={{ borderRadius: "16px" }}
        >
          {renderTabNav()}
        </div>
      )}
    </>
  );
};

export default FormViewScreen;
