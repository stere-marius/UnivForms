import React, { useEffect, useRef, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { listFormDetails, sendFormResponse } from "../actions/formActions";
import CountdownTimer from "../components/CountdownTimer";
import QuestionFileUpload from "../components/form/QuestionFileUpload";
import QuestionInputBox from "../components/form/QuestionInputBox";
import QuestionMarkBox from "../components/form/QuestionMarkBox";
import QuestionParagraph from "../components/form/QuestionParagraph";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Meta from "../components/Meta";
import {
  CHECKBOX_QUESTION,
  FILE_UPLOAD,
  PARAGRAPH_QUESTION,
  RADIO_BUTTON_QUESTION,
  SHORT_TEXT_QUESTION,
} from "../constants/questionTypesConstants";

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
    canAnswer = true,
    error: errorsSendResponse,
  } = formResponse;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id, true));
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
    if (progressSendResponse !== 100) return;

    console.log(`canAnswer = ${canAnswer}`);

    if (!canAnswer) {
      history.push({
        pathname: `/form/${match.params.id}/summary`,
        state: { formName: `${form.titlu}` },
        errorMessage: errorsSendResponse[0],
      });
      return;
    }

    if (successSendResponse) {
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
    canAnswer,
    errorsSendResponse,
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

    dispatch(
      sendFormResponse(formData, progressEv => {
        const completed = Math.round(
          (progressEv.loaded * 100) / progressEv.total
        );
        setProgressSendResponse(completed);
      })
    );
  };

  const handleSubmitForm = async () => {
    if (!raspunsuriIntrebariUtilizator.length) {
      const setErrors = new Set([
        ...errorsSubmit,
        { title: "Nu a??i oferit niciun r??spuns pentru acest formular" },
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

    if (mandatoryQuestions.length > 0) {
      const setErrors = new Set([...errorsSubmit]);

      mandatoryQuestions.forEach(question => {
        setErrors.add({
          title: `Nu ati furnizat un raspuns la "${question.titlu}"`,
          questionID: question.id,
        });
      });

      setErrorsSubmit([...setErrors]);
      return;
    }

    console.log(`Sending user answers `);
    sendUserAnswers();
  };

  const handleChangeQuestion = questionID => {
    const indexQuestion = form.intrebari.findIndex(
      question => question._id === questionID
    );

    if (indexQuestion === -1) return;

    setIndexQuestion(indexQuestion);
    setSelectedTab("Intrebare curenta");
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

    if (tipIntrebare === SHORT_TEXT_QUESTION) {
      return (
        <QuestionInputBox
          question={form.intrebari[indexQuestion]}
          indexQuestion={indexQuestion}
          raspunsuriIntrebariUtilizator={raspunsuriIntrebariUtilizator}
          handleNextQuestion={handleNextQuestion}
        />
      );
    }

    if (tipIntrebare === PARAGRAPH_QUESTION) {
      return (
        <QuestionParagraph
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
              <i className="fas fa-question-circle fs-4" />
              <p className="fw-bold fs-4 me-auto ms-3">Intrebari obligatorii</p>
              <p className="fw-bold fs-4 mx-5">
                {form.intrebari.map(intrebare => intrebare.obligatoriu).length}
              </p>
            </div>

            <div className="d-flex align-items-baseline my-3">
              <i className="fas fa-align-left fs-4" />
              <p className="fw-bold fs-4 me-auto ms-3">Raspunsurile tale</p>
              <p className="fw-bold fs-4 mx-5">
                {raspunsuriIntrebariUtilizator.length}
              </p>
            </div>
          </div>

          {loadingSendResponse && progressSendResponse && (
            <>
              <p>Se transmit raspunsurile...</p>
              <div className="progress">
                <div
                  className="progress-bar"
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
                <div className="alert alert-danger">
                  {error.title} - {error.error}
                  <u
                    className="cursor-pointer"
                    onClick={() => handleChangeQuestion(error.id)}
                  >
                    Treci la intrebare
                  </u>
                </div>
              ))
            ) : (
              <div className="alert alert-info">{errorsSendResponse}</div>
            ))}

          {errorsSubmit.length > 0 &&
            errorsSubmit.map(error => (
              <div className="alert alert-danger">
                {error.title}
                {error.questionID && (
                  <u
                    className="cursor-pointer px-1"
                    onClick={() => handleChangeQuestion(error.questionID)}
                  >
                    Treci la intrebare
                  </u>
                )}
              </div>
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
              <h3 className="mt-4">{error}</h3>

              <button
                onClick={() => history.push("/")}
                className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Meta title={`${form.titlu}`} />
          <div
            className="mt-4 container bg-white pb-1"
            style={{ borderRadius: "16px" }}
          >
            {renderTabNav()}
          </div>
        </>
      )}
    </>
  );
};

export default FormViewScreen;
