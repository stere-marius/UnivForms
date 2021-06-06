import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormAnswersTab from "../components/form/FormAnswersTab";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { getFormAnswers } from "../actions/formActions";
import UserAnswerTab from "../components/form/UserAnswerTab";

const FormAnswersScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const tabs = ["Raspunsuri", "Raspuns utilizator", "Statistici"];

  const [selectedTab, setSelectedTab] = useState("Raspunsuri");

  const [currentAnswer, setCurrentAnswer] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [perPageAnswers, setPerPageAnswers] = useState(1);

  const [searchAnswerQuery, setSearchAnswerQuery] = useState("");

  // const [searchText, setSearchText] = useState("");

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const formAnswers = useSelector(state => state.formAnswers);
  const {
    loading: loadingAnswers,
    raspunsuri: answers,
    raspunsuriTotale: totalAnswers = 0,
    error: errorAnswers,
  } = formAnswers;

  const handlePreviousPage = async () => {
    if (currentPage - 1 < 0) return;

    await dispatch(getFormAnswers(match.params.id, currentPage - 1));
    setCurrentPage(currentPage - 1);
  };

  const handleNextPage = async () => {
    if (currentPage + 1 > Math.floor(totalAnswers / perPageAnswers)) return;

    await dispatch(
      getFormAnswers(match.params.id, currentPage + 1, searchAnswerQuery)
    );
    setCurrentPage(currentPage + 1);
  };

  const handleEnterInputSearch = async e => {
    if (e.keyCode !== 13) return;

    await dispatch(getFormAnswers(match.params.id, 0, searchAnswerQuery));
  };

  const handlePageChange = () => {};

  // TODO: Fac o componenta în care trimit ca argument specificAnswer dacă aceasta a fost randată din FormAnswersScreen
  // dacă argumentul specificAnswer e null fac un useEffect și fac dispatch la specific answer

  useEffect(() => {
    if (!userInfo) {
      history.push(`/login`);
      return;
    }

    dispatch(getFormAnswers(match.params.id));
  }, [userInfo, dispatch, history, match.params.id]);

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
    return (
      <div className="d-flex flex-column">
        <div class="d-flex mt-3">
          <input
            type="text"
            class="form-control form-input-green"
            placeholder="Cauta un raspuns"
            value={searchAnswerQuery}
            onChange={e => setSearchAnswerQuery(e.target.value)}
            onKeyUp={handleEnterInputSearch}
          />
        </div>

        <FormAnswersTab
          formID={match.params.id}
          onAnswerChange={handleAnswerChange}
        />
        {answers.length < totalAnswers && (
          <ul class="pagination">
            {currentPage > 0 && (
              <li class="page-item" onClick={handlePreviousPage}>
                <span class="page-link">Inapoi</span>
              </li>
            )}

            <li class="page-item active">
              <span class="page-link">{currentPage + 1}</span>
            </li>

            {currentPage + 1 < Math.floor(totalAnswers / perPageAnswers) && (
              <li class="page-item" onClick={handleNextPage}>
                <a class="page-link" href="#">
                  Inainte
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    );
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

      {loadingAnswers ? (
        <Loader />
      ) : errorAnswers ? (
        <Message variant="danger">{errorAnswers}</Message>
      ) : (
        <>
          {renderAnswersTab()}
          {renderUserAnswerTab()}
        </>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <div
        className="mt-4 container bg-white pb-1"
        style={{ borderRadius: "16px" }}
      >
        {renderTabNav()}
      </div>
    </>
  );
};

export default FormAnswersScreen;
