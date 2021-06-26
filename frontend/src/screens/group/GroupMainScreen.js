import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupAdmins, getGroupForms } from "../../actions/groupActions";
import GroupAdminTab from "../../components/group/GroupAdminTab";
import GroupFormsTab from "../../components/group/GroupFormsTab";
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

      {forms && renderAdminTab()}
      {forms && renderFormsNav()}

      {renderMembersTab()}
    </>
  );

  const renderFormsNav = () => {
    if (selectedTab !== "Formulare") return <> </>;
    if (loadingForms) return <Loader />;
    if (errorForms) return <Message variant="danger">{errorForms}</Message>;

    return <GroupFormsTab forms={forms} />;
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
        className="mt-2 mt-sm-4 container bg-white py-4 py-sm-1"
        style={{ borderRadius: "16px" }}
      >
        {renderTabNav()}
      </div>
    </>
  );
};

export default GroupMainScreen;
