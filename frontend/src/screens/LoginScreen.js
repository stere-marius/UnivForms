import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import FormContainer from "../components/form/FormContainer";
import { login } from "../actions/userActions";
import Header from "../components/Header";

const LoginScreen = ({ location, history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const isRedirect = location.search.includes("redirect=");
  const redirectLink = location.search.split("redirect=")[1] || "/";

  useEffect(() => {
    if (userInfo && location.search.includes("redirect=")) {
      history.push(redirectLink);
    }
  }, [history, userInfo, location.search, redirectLink]);

  const submitHandler = e => {
    e.preventDefault();
    dispatch(login(email, password));
  };

  return (
    <>
      <Header />
      <div className="my-5">
        <FormContainer>
          <h1 className="text-color-white font-weight-bold mb-3">Sign In</h1>
          {error && <Message variant="danger">{error}</Message>}
          {loading && <Loader />}
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email">
              <Form.Label className="text-color-white">
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>
            <Form.Group controlId="password" className="my-3">
              <Form.Label className="text-color-white">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-3">
              Sign In
            </Button>
          </Form>
          <Row className="py-3">
            <Col className="text-color-white font-weight-bold">
              New User?{" "}
              <Link
                to={`/register${isRedirect ? `?redirect=${redirectLink}` : ""}`}
              >
                Register
              </Link>
            </Col>
          </Row>
        </FormContainer>
      </div>
    </>
  );
};

export default LoginScreen;
