import React, { useEffect, useState } from "react";
import { Button, Image, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { getForms, getGroups } from "../actions/userActions";
import Loader from "../components/Loader";
import Message from "../components/Message";
import FormCreateModal from "../components/form/FormCreateModal";
import GroupCreateModal from "../components/group/GroupCreateModal";
import FormViewContainer from "../components/form/FormViewContainer";
import ModalChangeEmail from "../components/ModalChangeEmail";
import ModalResetPassword from "../components/ModalResetPassword";

const HomeScreen = ({ history, location }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const userGroups = useSelector(state => state.userGroups);
  const { loading: loadingGroups, error: errorGroups, groups } = userGroups;

  const userForms = useSelector(state => state.userForms);
  const { loading: loadingForms, error: errorForms, forms } = userForms;

  const [isActiveModalCreateForm, setActiveModalCreateForm] = useState(false);

  const [isActiveModalCreateGroup, setActiveModalCreateGroup] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      dispatch(getGroups());
      dispatch(getForms());
    }
    dispatch({ type: "FORM_UPDATE_QUESTION_RESET" });
    dispatch({ type: "FORM_DETAILS_RESET" });
  }, [userInfo, dispatch]);

  return (
    <>
      {userInfo ? (
        <>
          <Header width={"95%"} />

          <div
            className="mt-3 d-flex flex-column mx-auto"
            style={{
              width: "94%",
              backgroundColor: "#2C2938",
              borderRadius: "35px",
            }}
          >
            <div>
              <h3 className="text-color-white px-5 pt-2 text-center">
                Grupurile tale
              </h3>
              {loadingGroups ? (
                <Loader />
              ) : errorGroups ? (
                <Message variant="danger">{errorGroups}</Message>
              ) : (
                <Row>
                  {groups.map(group => (
                    <>
                      <Col key={group._id} sm={12} md={6} lg={4} xl={3}>
                        <div
                          className="d-flex flex-column text-dark bg-white mx-4 my-4"
                          style={{ borderRadius: "10px" }}
                        >
                          <h4 className="text-center p-2 border-bottom">
                            {group.nume}
                          </h4>
                          <p className="p-3">
                            <i className="fas fa-calendar-alt mx-1 inline-block" />
                            {group.createdAt}
                          </p>
                          <p className="p-3">
                            <i className="fas fa-pen mx-1 inline-block" />
                            {group.updatedAt}
                          </p>
                          <p className="p-3">
                            <i className="fas fa-users mx-1 inline-block" />
                            {group.utilizatori.length}
                          </p>
                          <div className="d-flex align-items-center justify-content-center m-3">
                            <Button
                              variant="primary"
                              onClick={() =>
                                history.push(`/group/${group._id}`)
                              }
                            >
                              Vezi grup
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </>
                  ))}
                </Row>
              )}
              <button
                className="btn btn-default btn-color-green mx-4 my-4 p-3"
                onClick={() => setActiveModalCreateGroup(true)}
              >
                Grup nou
              </button>
              <GroupCreateModal
                showModal={isActiveModalCreateGroup}
                onClose={() => setActiveModalCreateGroup(false)}
              />
            </div>

            <div>
              <h3 className="text-color-white px-5 pt-2 text-center">
                Formularele tale
              </h3>
              {loadingForms ? (
                <Loader />
              ) : errorForms ? (
                <Message variant="danger">{errorForms}</Message>
              ) : (
                <Row>
                  {forms.map(form => (
                    <>
                      <Col key={form._id} sm={6} md={6} lg={6} xl={3}>
                        <FormViewContainer form={form} />
                      </Col>
                    </>
                  ))}
                </Row>
              )}
              <button
                className="btn btn-default btn-color-green mx-4 my-4 p-3"
                onClick={() => setActiveModalCreateForm(true)}
              >
                Formular nou
              </button>
              <FormCreateModal
                showModal={isActiveModalCreateForm}
                onClose={() => setActiveModalCreateForm(false)}
                userGroups={groups}
              />
            </div>
          </div>
        </>
      ) : (
        <Container>
          <Header />

          <Image
            src="/images/logo.png"
            fluid
            className="my-5 mx-auto d-block"
          />
          <h1
            className="text-center mb-5 mt-5"
            style={{
              color: "white",
              fontStyle: "normal",
              fontWeight: "bold",
              fontSize: "40px",
              lineHeight: "59px",
              paddingTop: "2rem",
              paddingBottom: "3rem",
            }}
          >
            Noua modalitate de colectare a{" "}
            <span
              style={{
                color: "#9E9696",
                fontStyle: "normal",
                fontWeight: "bold",
                fontSize: "40px",
                lineHeight: "59px",
              }}
            >
              datelor
            </span>
          </h1>
          <LinkContainer to="/create-form">
            <div className="text-center my-8">
              <button className="btn-reset btn-green">
                Formular nou
                <i
                  className="fas fa-long-arrow-alt-right mx-2"
                  style={{ verticalAlign: "middle" }}
                />
              </button>
            </div>
          </LinkContainer>
        </Container>
      )}
      <ModalChangeEmail location={location} />
      <ModalResetPassword location={location} />
    </>
  );
};

export default HomeScreen;
