import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { getGroupForms, getGroupAdmins } from "../../actions/groupActions";
import FormViewContainer from "../../components/form/FormViewContainer";
import GroupUsersTab from "../../components/group/GroupUsersTab";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const GroupMainScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const [tabs, setTabs] = useState(["Formulare", "Membrii"]);

  const [selectedTab, setSelectedTab] = useState("Formulare");

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const groupForms = useSelector(state => state.groupForms);
  const { loading: loadingForms, forms, error: errorForms } = groupForms;

  const groupAdmins = useSelector(state => state.groupAdmins);
  const { loading: loadingAdmins, admins } = groupAdmins;

  useEffect(() => {
    dispatch(getGroupForms(match.params.id));
    dispatch(getGroupAdmins(match.params.id));
  }, [match, history, dispatch]);

  useEffect(() => {
    const includesTabAdmin = tabs.includes("Administreaza grup");
    const isAdmin = admins && admins.some(admin => admin.id === userInfo._id);
    if (!loadingAdmins && !includesTabAdmin && isAdmin) {
      setTabs([...tabs, `Administreaza grup`]);
    }
  }, [loadingAdmins, admins, tabs, userInfo._id]);

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

      {renderFormsNav()}
      {renderMembersTab()}
      {/* {renderFormAttributesTab()} */}
    </>
  );

  const renderFormsNav = () => {
    if (selectedTab !== "Formulare") return <> </>;
    if (loadingForms) return <Loader />;
    if (errorForms) return <Message variant="danger">{errorForms}</Message>;
    if (forms.length === 0)
      return (
        <div>
          <h2>Acest grup nu contine niciun formular</h2>
        </div>
      );

    return (
      <Row>
        {forms.map(form => (
          <>
            <Col key={form._id} sm={6} md={6} lg={6} xl={3}>
              <FormViewContainer form={form} />
            </Col>
          </>
        ))}
      </Row>
    );
  };

  const renderMembersTab = () => {
    if (selectedTab !== "Membrii") return <> </>;
    return <GroupUsersTab groupID={match.params.id} />;
  };

  return (
    <>
      <Header />
      <div
        className="mt-4 container bg-white pb-1 pt-1"
        style={{ borderRadius: "16px" }}
      >
        {renderTabNav()}
        {/* <h2 className="text-center p-3 border-bottom">{formTitle}</h2> */}
      </div>
    </>
  );
};

export default GroupMainScreen;