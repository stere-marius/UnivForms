import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { withRouter } from "react-router";
import { updateGroupTitle } from "../../actions/groupActions";
import ConfirmationModal from "../ConfirmationModal";
import Message from "../Message";
import ModalAddForm from "./ModalAddForm";
import ModalDeleteForm from "./ModalDeleteForm";

const GroupAdminTab = ({ groupID, forms, groupTitle, history }) => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState(new Set());

  const [title, setTitle] = useState(groupTitle);

  const [isActiveModalAddForm, setActiveModalAddForm] = useState(false);

  const [isActiveModalDeleteForm, setActiveModalDeleteForm] = useState(false);

  const [isActiveModalDeleteGroup, setActiveModalDeleteGroup] = useState(false);

  const groupTitleState = useSelector(state => state.groupTitle);
  const {
    loading: loadingTitle,
    title: updatedTitle,
    success,
    error: errorTitle,
  } = groupTitleState;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (success && !loadingTitle && !errorTitle && updatedTitle) {
      setTitle(updatedTitle);
    }
  }, [success, loadingTitle, errorTitle, updatedTitle]);

  const handleSave = () => {
    dispatch(updateGroupTitle(groupID, title));
  };

  const handleConfirmDeleteGroup = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.delete(`/api/groups/${groupID}`, config);
      history.push(`/`);
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

  return (
    <>
      <div className="mx-2 my-3 d-flex flex-column align-items-start">
        <div className="input-group d-flex flex-column">
          <label className="form-label fs-4" htmlFor="groupTitle">
            Titlul formularului
          </label>
          <input
            type="text"
            className="form-control form-input-green"
            style={{ width: "45%" }}
            value={title}
            onChange={e => setTitle(e.target.value)}
            id="groupTitle"
            placeholder="Titlul formularului"
          />
        </div>
        <button className="btn btn-color-green my-3" onClick={handleSave}>
          Salvează
        </button>
        <button
          className="btn btn-color-green my-3"
          onClick={() => setActiveModalAddForm(true)}
        >
          Adauga formular
        </button>
        <button
          className="btn btn-color-green my-3"
          onClick={() => setActiveModalDeleteForm(true)}
        >
          Sterge formular
        </button>
        <button
          className="btn btn-danger text-dark my-3"
          onClick={() => setActiveModalDeleteGroup(true)}
        >
          Sterge grup
        </button>
        {success && !loadingTitle && (
          <Message variant="success">
            Titlul formularului a fost actulizat cu success
          </Message>
        )}
        {errorTitle && !loadingTitle && (
          <Message variant="danger">{errorTitle}</Message>
        )}
        {errors &&
          [...errors].map(error => <Message variant="danger">{error}</Message>)}
      </div>
      <ModalAddForm
        groupID={groupID}
        currentForms={forms}
        showModal={isActiveModalAddForm}
        onClose={() => setActiveModalAddForm(false)}
      />
      <ModalDeleteForm
        groupID={groupID}
        currentForms={forms}
        showModal={isActiveModalDeleteForm}
        onClose={() => setActiveModalDeleteForm(false)}
      />

      <ConfirmationModal
        showModal={isActiveModalDeleteGroup}
        body={
          <>
            <p>Confirmati stergerea</p>
          </>
        }
        title={"Stergeti grupul?"}
        textConfirm={"Da"}
        textClose={"Nu"}
        onConfirm={handleConfirmDeleteGroup}
        onClose={() => setActiveModalDeleteGroup(false)}
      />
    </>
  );
};

export default withRouter(GroupAdminTab);
