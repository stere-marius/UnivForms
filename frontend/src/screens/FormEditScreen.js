import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import CreateMarkBox from "../components/form/CreateMarkBox";
import ModalNewQuestion from "../components/form/ModalNewQuestion";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails, deleteQuestion } from "../actions/formActions";
import EditFileUploadQuestion from "../components/form/EditFileUploadQuestion";
import EditTextQuestion from "../components/form/EditTextQuestion";
import ConfirmationModal from "../components/ConfirmationModal";
import FormAttributes from "../components/form/FormAttributes";
import FormEditRadioQuestion from "../components/form/FormEditRadioQuestion";

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

  const handleConfirmDeleteQuestion = () => {
    if (!selectedDeleteQuestion.current) {
      setActiveModalDeleteQuestion(false);
      return;
    }

    const questionID = selectedDeleteQuestion.current;
    const newQuestions = formQuestions.filter(
      formQuestion => formQuestion._id !== questionID
    );
    setFormQuestions(newQuestions);

    dispatch(deleteQuestion(match.params.id, questionID));
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
    if (
      form &&
      form.utilizator &&
      form.utilizator.toString() !== userInfo._id
    ) {
      history.push("/");
      return;
    }

    if (form && form.titlu && form.intrebari) {
      setFormTitle(form.titlu);
    }

    if (form && form.intrebari) {
      const formQuestionsDB = form.intrebari;
      setFormQuestions(formQuestionsDB);

      if (!currentQuestion) {
        setCurrentQuestion(
          currentQuestion || formQuestionsDB[formQuestionsDB.length - 1]
        );
        return;
      }

      if (form.intrebari.length !== formQuestions.length) {
        setCurrentQuestion(
          currentQuestion || formQuestionsDB[formQuestionsDB.length - 1]
        );
      }

      const currentQuestionFromDB = formQuestionsDB.find(
        question => question._id === currentQuestion._id
      );

      if (currentQuestionFromDB) {
        setCurrentQuestion(currentQuestionFromDB);
      }
    }
  }, [form, currentQuestion, formQuestions.length]);

  const renderCurrentQuestionTab = () => {
    if (selectedTab !== "Intrebare curenta") return <> </>;

    if (formQuestions.length === 0) {
      return <> </>;
    }

    if (currentQuestion.tip === "Caseta de selectare") {
      return (
        <CreateMarkBox
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === "Buton radio") {
      return (
        <FormEditRadioQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === "Incarcare fisier") {
      return (
        <EditFileUploadQuestion
          formID={match.params.id}
          formQuestionDB={currentQuestion}
          handleNewQuestion={handleNewQuestion}
        />
      );
    }

    if (currentQuestion.tip === "Raspuns text") {
      return (
        <EditTextQuestion
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
    <div>
      <ul className="nav nav-tabs flex-column align-items-center align-items-sm-start flex-sm-row justify-content-center">
        {renderTabs()}
      </ul>

      {renderCurrentQuestionTab()}
      {renderPreviousQuestionsTab()}
      {renderFormAttributesTab()}
    </div>
  );

  return (
    <>
      <Header />
      <div
        className="mt-4 container bg-white pb-1 pt-1"
        style={{ borderRadius: "16px" }}
      >
        <h2
          className="text-center p-3 border-bottom"
          spellCheck={false}
          onChange={e => setFormTitle(e.value)}
          onClick={e => e.target.setAttribute("contentEditable", true)}
          onBlur={e => e.target.setAttribute("contentEditable", false)}
        >
          {formTitle}
        </h2>

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
