import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import CreateMarkBox from "../components/form/CreateMarkBox";
import ModalNewQuestion from "../components/form/ModalNewQuestion";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails, deleteQuestion } from "../actions/formActions";
import EditFileUploadQuestion from "../components/form/EditFileUploadQuestion";
import EditShortTextQuestion from "../components/form/EditShortTextQuestion";
import EditParagraphQuestion from "../components/form/EditParagraphQuestion";
import ConfirmationModal from "../components/ConfirmationModal";
import FormAttributes from "../components/form/FormAttributes";
import FormEditRadioQuestion from "../components/form/FormEditRadioQuestion";
import {
  RADIO_BUTTON_QUESTION,
  CHECKBOX_QUESTION,
  SHORT_TEXT_QUESTION,
  FILE_UPLOAD,
  PARAGRAPH_QUESTION,
} from "../constants/questionTypesConstants";

const FormEditScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const tabs = [
    "Intrebare curenta",
    "Intrebari anterioare",
    "Atribute formular",
  ];

  const selectedDeleteQuestion = useRef(null);

  const [selectedTab, setSelectedTab] = useState("Intrebare curenta");

  const [formTitle, setFormTitle] = useState("Titlul formularului");

  const [formQuestions, setFormQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(null);

  const formDetails = useSelector(state => state.formDetails);
  const { error, form } = formDetails;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const deletedQuestion = useSelector(state => state.formDeletedQuestion);
  const { success: successDelete, error: errorDelete } = deletedQuestion;

  const [isActiveModalCreateQuestion, setActiveModalCreateQuestion] =
    useState(false);

  const [isActiveModalDeleteQuestion, setActiveModalDeleteQuestion] =
    useState(false);

  const handleNewQuestion = () => {
    setActiveModalCreateQuestion(true);
  };

  const onCreateQuestion = async question => {
    setActiveModalCreateQuestion(false);
    await dispatch(listFormDetails(match.params.id));
  };

  const handleDeleteQuestion = questionID => {
    setActiveModalDeleteQuestion(true);
    selectedDeleteQuestion.current = questionID;
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!selectedDeleteQuestion.current) {
      setActiveModalDeleteQuestion(false);
      return;
    }

    const questionID = selectedDeleteQuestion.current;

    await dispatch(deleteQuestion(match.params.id, questionID));
    dispatch(listFormDetails(match.params.id));
    setActiveModalDeleteQuestion(false);
    selectedDeleteQuestion.current = null;
  };

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id));
  }, [match, dispatch, history, userInfo]);

  useEffect(() => {
    if (error) {
      history.push("/");
    }
  }, [error, history]);

  useEffect(() => {
    if (!form) return;

    const { intrebari: formQuestionsDB, titlu: title, utilizator: user } = form;

    if (user && user.toString() !== userInfo._id) {
      history.push("/");
      return;
    }

    if (title) {
      setFormTitle(title);
    }

    if (!formQuestionsDB) return;

    if (formQuestionsDB.length !== formQuestions.length) {
      setFormQuestions(formQuestionsDB);
    }

    if (!currentQuestion) {
      setCurrentQuestion(formQuestionsDB[formQuestionsDB.length - 1]);
      return;
    }

    const isCurrentQuestion = formQuestionsDB.some(
      question => question._id === currentQuestion._id
    );

    if (currentQuestion && !isCurrentQuestion) {
      setCurrentQuestion(formQuestionsDB[formQuestionsDB.length - 1]);
    }
  }, [form, currentQuestion, formQuestions.length, history, userInfo._id]);

  const renderCurrentQuestionTab = () => {
    if (selectedTab !== "Intrebare curenta") return <> </>;

    if (formQuestions.length === 0) return <> </>;

    if (currentQuestion.tip === CHECKBOX_QUESTION) {
      return (
        <CreateMarkBox
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === RADIO_BUTTON_QUESTION) {
      return (
        <FormEditRadioQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === FILE_UPLOAD) {
      return (
        <EditFileUploadQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === SHORT_TEXT_QUESTION) {
      return (
        <EditShortTextQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === PARAGRAPH_QUESTION) {
      return (
        <EditParagraphQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    return <> </>;
  };

  const renderPreviousQuestionsTab = () => (
    <>
      {selectedTab === "Intrebari anterioare" && formQuestions.length > 0 && (
        <div className="table-responsive">
          <table className="table-sm mt-3 table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Titlul intrebarii</th>
                <th>Intrebare obligatorie</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {formQuestions.map((question, index) => (
                <tr key={question._id}>
                  <td>
                    {index + 1}
                    {". "}
                    {question.titlu}
                  </td>
                  <td>
                    {question.obligatoriu ? (
                      <i
                        className="fas fa-check"
                        style={{ color: "#01df9b" }}
                      />
                    ) : (
                      <i className="fas fa-times" style={{ color: "red" }} />
                    )}
                  </td>
                  <td>
                    <button
                      className={
                        "btn-sm btn btn-color-green text-dark text-bold fw-bold " +
                        (question._id === currentQuestion._id && " disabled")
                      }
                      onClick={() => {
                        setCurrentQuestion(question);
                        setSelectedTab("Intrebare curenta");
                      }}
                    >
                      Selectati intrebarea
                    </button>
                  </td>
                  <td>
                    <i
                      className="fas fa-trash cursor-pointer"
                      style={{ color: "red" }}
                      onClick={() => handleDeleteQuestion(question._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {successDelete && (
        <div className="alert alert-success mx-3">
          Intrebarea a fost stearsa cu success!
        </div>
      )}
      {errorDelete && (
        <div className="alert alert-danger mx-3">{errorDelete}</div>
      )}
      <ConfirmationModal
        showModal={isActiveModalDeleteQuestion}
        body={
          <>
            <p>Confirmati stergerea</p>
          </>
        }
        title={"Stergere intrebare"}
        textConfirm={"Da"}
        textClose={"Nu"}
        onConfirm={handleConfirmDeleteQuestion}
        onClose={() => setActiveModalDeleteQuestion(false)}
      />
    </>
  );

  const renderFormAttributesTab = () => {
    if (selectedTab !== "Atribute formular") return <> </>;
    return <FormAttributes form={form} />;
  };

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
    <>
      <ul className="nav nav-tabs flex-column align-items-center align-items-sm-start flex-sm-row justify-content-center">
        {renderTabs()}
      </ul>

      {renderCurrentQuestionTab()}
      {renderPreviousQuestionsTab()}
      {renderFormAttributesTab()}
    </>
  );

  return (
    <>
      <Header />
      <div
        className="mt-4 container bg-white pb-1 pt-1"
        style={{ borderRadius: "16px" }}
      >
        <h2 className="text-center p-3 border-bottom">{formTitle}</h2>

        <div
          className="d-flex flex-column p-4 m-4"
          style={{
            borderRadius: "22px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            backgroundColor: "#EFEFEF",
          }}
        >
          {renderTabNav()}

          {/* {renderFirstQuestion()} */}
        </div>
        {
          <ModalNewQuestion
            formID={match.params.id}
            showModal={isActiveModalCreateQuestion}
            onClose={() => setActiveModalCreateQuestion(false)}
            onCreate={onCreateQuestion}
          />
        }
      </div>
    </>
  );
};

export default FormEditScreen;
