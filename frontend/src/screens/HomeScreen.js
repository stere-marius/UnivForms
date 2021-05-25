import React, { useEffect } from "react";
import { Button, Image, Container, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Header from "../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { getForms, getGroups } from "../actions/userActions";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { Link } from "react-router-dom";

const HomeScreen = () => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const userGroups = useSelector(state => state.userGroups);
  const { loading: loadingGroups, error: errorGroups, groups } = userGroups;

  const userForms = useSelector(state => state.userForms);
  const { loading: loadingForms, error: errorForms, forms } = userForms;

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      dispatch(getGroups());
      dispatch(getForms());
    }
  }, [userInfo, dispatch]);

  return (
    <>
      {userInfo ? (
        <>
          {/* {loadingGroups ? (
            <Loader />
          ) : (
            <div>{groups.map(group => console.log(JSON.stringify(group)))}</div>
          )} */}

          <Header width={"95%"} />

          <div
            className="mt-3 d-flex flex-column mx-auto"
            style={{
              width: "94%",
              //   height: "300px",
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
                            <Button variant="primary">Vezi grup</Button>
                          </div>
                        </div>
                      </Col>
                    </>
                  ))}
                </Row>
              )}
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
                    <Link to={`/form/${form._id}/view`}>
                      <Col key={form._id} sm={12} md={6} lg={4} xl={3}>
                        <div
                          className="d-flex flex-column text-dark bg-white mx-4 my-4"
                          style={{ borderRadius: "10px" }}
                        >
                          <h4 className="text-center p-2 border-bottom">
                            {form.nume}
                          </h4>
                          <p className="p-3">
                            <i className="fas fa-calendar-alt mx-1 inline-block" />
                            21-03-2021
                          </p>
                          <p className="p-3">
                            <i className="fas fa-pen mx-1 inline-block" />
                            21-03-2021
                          </p>
                          <p className="p-3">
                            <i className="fas fa-users mx-1 inline-block" />
                            21
                          </p>
                          <div className="d-flex align-items-center justify-content-center m-3">
                            <Button variant="primary">Vezi formular</Button>
                          </div>
                        </div>
                      </Col>
                    </Link>
                  ))}
                </Row>
              )}
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
              <button
                //   className="my-5"
                className="btn-reset btn-green"
              >
                Formular nou
                <i
                  className="fas fa-long-arrow-alt-right mx-2"
                  style={{ verticalAlign: "middle" }}
                ></i>
              </button>
            </div>
          </LinkContainer>
        </Container>
      )}
    </>
  );
};

export default HomeScreen;
