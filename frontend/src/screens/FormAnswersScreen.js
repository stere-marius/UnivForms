import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFormAnswer, getFormAnswers } from "../actions/formActions";
import AnswerStatisticsTab from "../components/form/AnswerStatisticsTab";
import FormAnswersTab from "../components/form/FormAnswersTab";
import UserAnswerTab from "../components/form/UserAnswerTab";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";

const FormAnswersScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const tabs = ["Raspunsuri", "Raspuns utilizator", "Statistici"];

  const [selectedTab, setSelectedTab] = useState("Raspunsuri");

  const [currentAnswer, setCurrentAnswer] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);

  const [perPageAnswers] = useState(1);

  const [searchAnswerQuery, setSearchAnswerQuery] = useState("");

  // const [searchText, setSearchText] = useState("");

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const formAnswers = useSelector(state => state.formAnswers);
  const {
    loading: loadingAnswers,
    raspunsuri: answers,
    raspunsuriTotale: totalAnswers = 0,
    creatorFormular: formOwner = "",
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

  const formAnswerDelete = useSelector(state => state.formAnswerDelete);
  const { success: successDeleteAnswer } = formAnswerDelete;

  const onAnswerDelete = async answerID => {
    await dispatch(deleteFormAnswer(match.params.id, answerID));
    dispatch(getFormAnswers(match.params.id));
  };

  useEffect(() => {
    if (!userInfo) {
      history.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    if (!userInfo.token) {
      history.push(`/login?redirect=${window.location.pathname}`);
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
          onAnswerDelete={onAnswerDelete}
        />
        {successDeleteAnswer && (
          <div className="alert alert-success">
            Răspunsul a fost șters cu success!
          </div>
        )}
        {answers.length < totalAnswers && (
          <ul className="pagination">
            {currentPage > 0 && (
              <li className="page-item" onClick={handlePreviousPage}>
                <span className="page-link">Inapoi</span>
              </li>
            )}

            <li className="page-item active">
              <span className="page-link">{currentPage + 1}</span>
            </li>

            {currentPage + 1 < Math.floor(totalAnswers / perPageAnswers) && (
              <li className="page-item" onClick={handleNextPage}>
                <button className="page-link" href="#">
                  Inainte
                </button>
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

    return (
      <UserAnswerTab
        formID={match.params.id}
        answerID={currentAnswer}
        isFormOwner={formOwner === userInfo._id}
      />
    );
  };

  const renderStatisticsTab = () => {
    if (selectedTab !== "Statistici") return <> </>;

    return <AnswerStatisticsTab formID={match.params.id} />;
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
          {renderStatisticsTab()}
        </>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <Meta title={`Raspunsuri formular`} />
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
