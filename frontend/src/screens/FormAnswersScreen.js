import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormAnswersTab from "../components/FormAnswersTab";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getFormAnswers, getFormAnswer } from "../actions/formActions";
import UserAnswerTab from "../components/UserAnswerTab";

const FormAnswersScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const tabs = ["Raspunsuri", "Raspuns utilizator", "Statistici"];

  const [selectedTab, setSelectedTab] = useState("Raspunsuri");

  const [currentAnswer, setCurrentAnswer] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [searchText, setSearchText] = useState("");

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const formAnswers = useSelector(state => state.formAnswers);
  const {
    loading: loadingAnswers,
    raspunsuri: answers,
    error: errorAnswers,
  } = formAnswers;

  // TODO: Fac o componenta în care trimit ca argument specificAnswer dacă aceasta a fost randată din FormAnswersScreen
  // dacă argumentul specificAnswer e null fac un useEffect și fac dispatch la specific answer

  useEffect(() => {
    if (!userInfo) {
      history.push(`/login`);
      return;
    }

    dispatch(getFormAnswers(match.params.id));
  }, [userInfo, dispatch, match.params.id]);

  const handleAnswerChange = answerID => {
    setCurrentAnswer(answerID);
    setSelectedTab("Raspuns utilizator");
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

  const renderAnswersTab = () => {
    if (selectedTab !== "Raspunsuri") return <> </>;
    return <FormAnswersTab onAnswerChange={handleAnswerChange} />;
  };

  const renderUserAnswerTab = () => {
    if (selectedTab !== "Raspuns utilizator") return <> </>;

    if (!currentAnswer) {
      setSelectedTab("Raspunsuri");
      return;
    }

    return <UserAnswerTab formID={match.params.id} answerID={currentAnswer} />;
  };

  const renderTabNav = () => (
    <div>
      <ul className="nav nav-tabs flex-column align-items-center align-items-sm-start flex-sm-row justify-content-center">
        {renderTabs()}
      </ul>

      {renderAnswersTab()}
      {renderUserAnswerTab()}
      {/* {renderFormSendTab()} */}
    </div>
  );

  return (
    <>
      <Header />
      {loadingAnswers ? (
        <Loader />
      ) : errorAnswers ? (
        <Message variant="danger">{errorAnswers}</Message>
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

export default FormAnswersScreen;
