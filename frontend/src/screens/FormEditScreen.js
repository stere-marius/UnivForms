import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import CreateMarkBox from "../components/CreateMarkBox";
import { useSelector, useDispatch } from "react-redux";
import { listFormDetails } from "../actions/formActions";

const FormEditScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const [formTitle, setFormTitle] = useState("Titlul formularului");
  const [formQuestions, setFormQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(null);

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

  useEffect(() => {
    if (error) {
      history.push("/");
    }
  }, [error]);

  useEffect(() => {
    if (form && form.titlu && form.intrebari) {
      setFormTitle(form.titlu);
      setFormQuestions(form.intrebari);
    }
  }, [form]);

  const renderFirstQuestion = () => {
    if (formQuestions.length == 0) {
      return <> </>;
    }

    const firstQuestion = formQuestions[0];

    if (firstQuestion.tip === "Caseta de selectare") {
      return (
        <CreateMarkBox
          formID={match.params.id}
          formQuestionDB={firstQuestion}
        />
      );
    }

    return <> </>;
  };

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
        {formQuestions.length > 0 && renderFirstQuestion()}
      </div>
    </>
  );
};

export default FormEditScreen;
