import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails } from "../actions/formActions";
import Loader from "../components/Loader";
import QuestionMarkBox from "../components/QuestionMarkBox";
import QuestionInputBox from "../components/QuestionInputBox";
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
  const [indexQuestion, setIndexQuestion] = useState(0);

  const tabs = [
    "Intrebare curenta",
    "Intrebari anterioare",
    "Trimitere formular",
  ];
  const [selectedTab, setSelectedTab] = useState("Intrebare curenta");

  const [raspunsuriIntrebariUtilizator] = useState([]);

  const dispatch = useDispatch();

  const formDetails = useSelector(state => state.formDetails);
  const { loading, error, form } = formDetails;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id));
  }, [match, dispatch]);

  const handleNextQuestion = () => {
    setIndexQuestion(indexQuestion + 1);
  };

  // TODO: Verific daca a raspuns la toate intrebarile obligatorii

  // TODO: Sa-i afisez intrebarile anterioare ca fiind intrebarile carora le-a dat skip sau la care a raspuns

  // TODO: Sa-i pastrez raspunsurile pentru intrebari,
  // iar daca utilizatorul se razgandeste sa se duca la tab-ul "Intrebari anterioare"
  // si sa poata modifica raspunsurile

  // TODO: Buton care memoreaza raspunsurile

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
        <li className="nav-item px-4 pt-4 pb-2 ms-md-auto">
          <p className="text-dark fw-bold">10:00</p>
        </li>
      </ul>

      {renderCurrentQuestionTab()}
      {renderPreviousQuestionsTab()}
      {renderFormSendTab()}
    </div>
  );

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
          <h3 className="fw-bold">{form.nume}</h3>
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

          {JSON.stringify(raspunsuriIntrebariUtilizator)}

          <Button className="btn btn-default btn-color-green px-4 text-dark text-bold fs-5 mt-4 fw-bold">
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
          {/* <FormNav /> */}

          {/* {JSON.stringify(formDetails.form.intrebari)} */}
        </div>
      )}
    </>
  );
};

export default FormViewScreen;
