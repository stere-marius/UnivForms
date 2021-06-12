import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { getGroupForms, getGroupAdmins } from "../../actions/groupActions";
import FormViewContainer from "../../components/form/FormViewContainer";
import GroupUsersTab from "../../components/group/GroupUsersTab";
import GroupFormsTab from "../../components/group/GroupFormsTab";
import GroupAdminTab from "../../components/group/GroupAdminTab";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const GroupMainScreen = ({ match, history }) => {
  const dispatch = useDispatch();

  const [tabs, setTabs] = useState(["Formulare", "Membrii"]);

  const [isAdmin, setAdmin] = useState(false);

  const [selectedTab, setSelectedTab] = useState("Formulare");

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const groupForms = useSelector(state => state.groupForms);
  const {
    loading: loadingForms,
    forms,
    groupTitle,
    error: errorForms,
  } = groupForms;

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
      setAdmin(isAdmin);
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
      {renderAdminTab()}
    </>
  );

  const renderFormsNav = () => {
    if (selectedTab !== "Formulare") return <> </>;
    if (loadingForms) return <Loader />;
    if (errorForms) return <Message variant="danger">{errorForms}</Message>;

    return (
      <GroupFormsTab
        groupID={match.params.id}
        forms={forms}
        isAdmin={isAdmin}
      />
    );
  };

  const renderMembersTab = () => {
    if (selectedTab !== "Membrii") return <> </>;
    return <GroupUsersTab groupID={match.params.id} />;
  };

  const renderAdminTab = () => {
    if (selectedTab !== "Administreaza grup") return <> </>;
    return (
      <GroupAdminTab
        groupID={match.params.id}
        forms={forms}
        groupTitle={groupTitle}
      />
    );
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
