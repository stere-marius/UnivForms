import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { getGroupUsers } from "../../actions/groupActions";
import ConfirmationModal from "../ConfirmationModal";
import Loader from "../Loader";
import Message from "../Message";
import ModalGroupAddMember from "./ModalGroupAddMember";

const GroupUsersTab = ({ groupID, history }) => {
  const dispatch = useDispatch();

  const [isGroupAdmin, setGroupAdmin] = useState(false);

  const [isGroupCreator, setGroupCreator] = useState(false);

  const [errors, setErrors] = useState(new Set());

  const [users, setUsers] = useState([]);

  const [isActiveModalUser, setActiveModalUser] = useState(false);

  const [isActiveModalLeave, setActiveModalLeave] = useState(false);

  const groupUsers = useSelector(state => state.groupUsers);
  const { loading: loadingGroups, users: groupUsersDB, error } = groupUsers;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    dispatch(getGroupUsers(groupID));
  }, [dispatch, groupID]);

  useEffect(() => {
    if (!loadingGroups && groupUsersDB && !error) {
      const currentUserGroup = groupUsersDB.find(
        groupUser => groupUser.id === userInfo._id
      );
      setUsers(groupUsersDB);
      setGroupAdmin(currentUserGroup && currentUserGroup.administrator);
      setGroupCreator(currentUserGroup && currentUserGroup.creator);
    }
  }, [loadingGroups, groupUsersDB, error, userInfo._id]);

  const changeAdminRole = async user => {
    const body = { userID: user.id, admin: !user.administrator };
    const newUsers = users.map(u =>
      u.id === user.id ? { ...u, administrator: !user.administrator } : u
    );
    setUsers(newUsers);
    setErrors(new Set());

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put(`/api/groups/${groupID}/admins`, body, config);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    }
  };

  const handleDeleteUser = async userID => {
    const newUsers = users.filter(u => u.id !== userID);
    setUsers(newUsers);
    setErrors(new Set());

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.delete(`/api/groups/${groupID}/users/${userID}`, config);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    }
  };

  const confirmLeaveGroup = async () => {
    setErrors(new Set());
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.delete(`/api/groups/${groupID}/users`, config);
      history.push("/");
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    }
  };

  const handleAddUser = () => {
    dispatch(getGroupUsers(groupID));
    setActiveModalUser(false);
  };

  return (
    <>
      {loadingGroups ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="table-responsive">
          <table className="table-sm mt-3 table table-striped table-bordered table-hover">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nume</th>
                <th>Prenume</th>
                <th>Administrator</th>
                {isGroupAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>
                    {index + 1}
                    {". "}
                    {user.email}
                  </td>
                  <td>{user.nume}</td>
                  <td>{user.prenume}</td>
                  <td>
                    {user.administrator ? (
                      <i
                        className="fas fa-check"
                        style={{ color: "#01df9b" }}
                      />
                    ) : (
                      <i className="fas fa-times" style={{ color: "red" }} />
                    )}
                  </td>
                  {isGroupAdmin && (
                    <>
                      <td>
                        <button
                          className={`btn-sm btn btn-color-green text-dark text-bold fw-bold ${
                            user.creator ? "disabled" : ""
                          }`}
                          onClick={() => changeAdminRole(user)}
                        >
                          {user.administrator
                            ? "Sterge administrator"
                            : "Promoveaza administrator"}
                        </button>
                      </td>
                      <td>
                        {!user.creator && (
                          <i
                            className={`fas fa-trash cursor-pointer`}
                            style={{ color: "red" }}
                            onClick={() => handleDeleteUser(user.id)}
                          />
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isGroupAdmin && (
        <button
          className="btn btn-color-green px-3 my-2"
          onClick={() => setActiveModalUser(!isActiveModalUser)}
        >
          Adaug?? membru
        </button>
      )}
      {!isGroupCreator && (
        <button
          className="btn btn-color-green px-3 my-2 mx-3"
          onClick={() => setActiveModalLeave(!isActiveModalLeave)}
        >
          P??r??si??i grupul
        </button>
      )}
      {errors.size > 0 &&
        [...errors].map((error, index) => (
          <Message key={index} variant="danger">
            {error}
          </Message>
        ))}
      <ModalGroupAddMember
        groupID={groupID}
        currentUsers={users}
        showModal={isActiveModalUser}
        onClose={() => setActiveModalUser(false)}
        onAdd={handleAddUser}
      />
      <ConfirmationModal
        showModal={isActiveModalLeave}
        title="Confirmare p??r??sire grup"
        body="Sunte??i sigur c?? vre??i s?? p??r??si??i grupul?"
        onClose={() => setActiveModalLeave(false)}
        onConfirm={confirmLeaveGroup}
        textConfirm="Da"
        textClose="Nu"
      />
    </>
  );
};

export default withRouter(GroupUsersTab);
