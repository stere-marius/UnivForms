import React from "react";
import { Col, Row } from "react-bootstrap";
import FormViewContainer from "../form/FormViewContainer";

const GroupFormsTab = ({ forms }) => {
  return (
    <div className="my-3">
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
    </div>
  );
};

export default GroupFormsTab;
