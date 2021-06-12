import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import FormViewContainer from "../form/FormViewContainer";
import ModalAddForm from "./ModalAddForm";
import { useSelector, useDispatch } from "react-redux";

const GroupFormsTab = ({ groupID, forms, isAdmin }) => {
  const dispatch = useDispatch();

  const [selectedFormDelete, setSelectedFormDelete] = useState(null);

  const [isActiveModalForm, setActiveModalForm] = useState(false);

  const handleAddForm = () => {
    dispatch();
  };

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

      {isAdmin && (
        <div className="mx-2 my-3">
          <button
            className="btn btn-color-green"
            onClick={() => setActiveModalForm(true)}
          >
            Adauga formular
          </button>
        </div>
      )}

      <ModalAddForm
        groupID={groupID}
        currentForms={forms}
        showModal={isActiveModalForm}
        onClose={() => setActiveModalForm(false)}
        onAdd={handleAddForm}
      />
    </>
  );
};

export default GroupFormsTab;
