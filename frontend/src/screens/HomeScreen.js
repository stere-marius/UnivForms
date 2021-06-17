import React, { useEffect, useState } from "react";
import { Image, Container, Row, Col } from "react-bootstrap";
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
import GroupViewContainer from "../components/group/GroupViewContainer";
import Meta from "../components/Meta";

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
        <div className="mx-sm-5 pb-5">
          <Header />

          <div
            className="mt-3 d-flex flex-column"
            style={{
              backgroundColor: "#2C2938",
              borderRadius: "24px",
            }}
          >
            <div>
              <h3 className="text-color-white my-4 text-center">
                Grupurile tale
              </h3>
              <div className="mx-4">
                {loadingGroups ? (
                  <Loader />
                ) : errorGroups ? (
                  <Message variant="danger">{errorGroups}</Message>
                ) : (
                  <Row>
                    {groups.map(group => (
                      <>
                        <Col key={group._id} sm={12} md={6} lg={4} xl={3}>
                          <GroupViewContainer group={group} />
                        </Col>
                      </>
                    ))}
                  </Row>
                )}
                <button
                  className="btn btn-default btn-color-green my-4 p-3"
                  onClick={() => setActiveModalCreateGroup(true)}
                >
                  Grup nou
                </button>
                <GroupCreateModal
                  showModal={isActiveModalCreateGroup}
                  onClose={() => setActiveModalCreateGroup(false)}
                />
              </div>
            </div>

            <div>
              <div className="mx-4 bg-color-white">
                <h3 className="text-color-white text-center my-4 ">
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
                        <Col key={form._id} sm={12} md={6} lg={4} xl={3}>
                          <FormViewContainer form={form} />
                        </Col>
                      </>
                    ))}
                  </Row>
                )}
                <button
                  className="btn btn-default btn-color-green  my-4 p-3"
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
          </div>
        </div>
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
      <Meta title="Univ Forms" />
      <ModalChangeEmail location={location} />
      <ModalResetPassword location={location} />
    </>
  );
};

export default HomeScreen;
