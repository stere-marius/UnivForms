import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import axios from "axios";

const ModalGroupAddMember = ({
  groupID,
  currentUsers,
  showModal,
  onClose,
  onAdd,
}) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [show, setShow] = useState(false);

  const [loading, setLoading] = useState(false);

  const [usersFound, setUsersFound] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [errors, setErrors] = useState(new Set());

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  useEffect(() => {
    setShow(showModal);
    setSearchQuery("");
    setErrors(new Set());
    setUsersFound([]);
  }, [showModal]);

  const handleChangeQuery = e => {
    setSearchQuery(e.target.value);
    setUsersFound([]);
  };

  const handleSearchUser = async () => {
    setLoading(true);
    setErrors(new Set());

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/users?email=${searchQuery}`,
        config
      );
      const usersFound = data.filter(
        user => !currentUsers.some(groupUser => groupUser.id === user._id)
      );
      setUsersFound(usersFound);
      setSelectedUser(usersFound[0] ? usersFound[0]._id : null);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUser) {
      setErrors(new Set().add("Nu ați selectat un utilizator!"));
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(
        `/api/groups/${groupID}/users`,
        { userID: selectedUser },
        config
      );

      onAdd();
      setShow(false);
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Utilizator nou</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column justify-content-between">
            <p>Cautati folosind adresa email</p>

            <div className="input-group">
              <input
                type="text"
                className="form-control form-input-green"
                placeholder="Adresa email"
                value={searchQuery}
                onChange={handleChangeQuery}
              />
            </div>
          </div>

          {usersFound.length > 0 && (
            <div className="mt-3">
              <select
                className="form-select form-input-green"
                onChange={e => setSelectedUser(e.target.value)}
                value={selectedUser}
              >
                {usersFound.map((user, index) => (
                  <option
                    value={`${user._id}`}
                    key={index}
                    selected={index === 0}
                  >
                    {user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="btn btn-color-green px-2 mt-4"
            onClick={handleSearchUser}
          >
            Cauta utilizatori
          </button>

          {errors.size > 0 && (
            <div className="my-3">
              {[...errors].map(error => (
                <div className="alert alert-danger">{error}</div>
              ))}
            </div>
          )}

          {loading && <Loader />}
        </Modal.Body>

        <Modal.Footer>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleClose}
          >
            Închide
          </button>
          <button
            className="btn btn-default btn-color-green fw-bold"
            onClick={handleAddUser}
          >
            Adauga
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalGroupAddMember;
