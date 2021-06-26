import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { login } from "../actions/userActions";
import FormContainer from "../components/form/FormContainer";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Meta from "../components/Meta";
import PasswordInput from "../components/PasswordInput";

const LoginScreen = ({ location, history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const isRedirect = location.search.includes("redirect=");
  const redirectLink = location.search.split("redirect=")[1] || "/";

  useEffect(() => {
    if (!userInfo) return;

    if (location.search.includes("redirect=")) {
      history.push(redirectLink);
      console.log(`History push redirect = ${redirectLink}`);
      return;
    }

    history.push("/");
  }, [history, userInfo, location.search, redirectLink]);

  const submitHandler = e => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <>
      <Header />
      <Meta title="Logare" />
      <div className="my-5">
        <FormContainer>
          <h1 className="text-color-white font-weight-bold mb-3">Logare</h1>
          {error && <Message variant="danger">{error}</Message>}
          {loading && <Loader />}
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email">
              <Form.Label className="text-color-white">Adresa email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduceti adresa de email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <PasswordInput
              password={password}
              setPassword={setPassword}
              id="password"
              labelText="Parola"
              inputPlaceholder="Introduceti parola"
              textColor="text-color-white"
            />

            <button type="submit" className="btn btn-color-green mt-3">
              Login
            </button>
          </Form>
          <Row className="py-3">
            <Col className="text-color-white font-weight-bold">
              <Link to={`/resetPassword`}>Am uitat parola</Link>
            </Col>
          </Row>
          <Row className="py-1">
            <Col className="text-color-white font-weight-bold">
              Utilizator nou?{" "}
              <Link
                to={`/register${isRedirect ? `?redirect=${redirectLink}` : ""}`}
              >
                Inregistrare
              </Link>
            </Col>
          </Row>
        </FormContainer>
      </div>
    </>
  );
};

export default LoginScreen;
