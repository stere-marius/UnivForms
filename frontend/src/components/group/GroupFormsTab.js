import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import FormViewContainer from "../form/FormViewContainer";
import ModalAddForm from "./ModalAddForm";
import ModalDeleteForm from "./ModalDeleteForm";
import { useSelector, useDispatch } from "react-redux";

const GroupFormsTab = ({ groupID, forms, isAdmin }) => {
  const [isActiveModalAddForm, setActiveModalAddForm] = useState(false);

  const [isActiveModalDeleteForm, setActiveModalDeleteForm] = useState(false);

  return (
    <>
      <Row>
        {forms.map(form => (
          <>
            <Col key={form._id} sm={6} md={6} lg={6} xl={3}>
              <FormViewContainer form={form} />
            </Col>
          </>
        ))}
      </Row>
      {forms.length === 0 && (
        <div className="mx-2">
          <h2>Acest grup nu contine niciun formular</h2>
        </div>
      )}
      {isAdmin && (
        <div className="mx-2 my-3">
          <button
            className="btn btn-color-green"
            onClick={() => setActiveModalAddForm(true)}
          >
            Adauga formular
          </button>
          <button
            className="btn btn-color-green mx-3"
            onClick={() => setActiveModalDeleteForm(true)}
          >
            Sterge formular
          </button>
        </div>
      )}
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

export default GroupFormsTab;
