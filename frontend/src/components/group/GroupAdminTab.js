import React, { useState, useEffect } from "react";
import ModalAddForm from "./ModalAddForm";
import ModalDeleteForm from "./ModalDeleteForm";
import { useDispatch, useSelector } from "react-redux";
import { updateGroupTitle } from "../../actions/groupActions";
import Message from "../Message";

const GroupAdminTab = ({ groupID, forms, groupTitle }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState(groupTitle);

  const [isActiveModalAddForm, setActiveModalAddForm] = useState(false);

  const [isActiveModalDeleteForm, setActiveModalDeleteForm] = useState(false);

  const groupTitleState = useSelector(state => state.groupTitle);
  const { loading, title: updatedTitle, success, error } = groupTitleState;

  useEffect(() => {
    if (success && !loading && !error && updatedTitle) {
      console.log(`updatedTitle = ${JSON.stringify(updatedTitle, null, 2)}`);
      setTitle(updatedTitle);
    }
  }, [success, loading, error, updatedTitle]);

  const handleSave = () => {
    dispatch(updateGroupTitle(groupID, title));
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
        <button className="btn btn-danger text-dark my-3">Sterge grup</button>
        {success && !loading && (
          <Message variant="success">
            Titlul formularului a fost actulizat cu success
          </Message>
        )}
        {error && !loading && <Message variant="danger">{error}</Message>}
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
    </>
  );
};

export default GroupAdminTab;
