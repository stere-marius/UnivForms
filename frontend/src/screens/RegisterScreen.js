import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import FormContainer from "../components/form/FormContainer";
import { register } from "../actions/userActions";
import { USER_REGISTER_RESET } from "../constants/userConstants";

const RegisterScreen = ({ location, history }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const dispatch = useDispatch();
  const userRegister = useSelector(state => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirect = location.search ? location.search.split("=")[1] : "/";

  useEffect(() => {
    if (userInfo) {
      history.push(redirect);
      dispatch({ type: USER_REGISTER_RESET });
    }
  }, [history, userInfo, redirect, dispatch]);

  const submitHandler = e => {
    e.preventDefault();
    dispatch(register(firstName, lastName, email, password));
  };

  return (
    <FormContainer>
      <h1 className="text-white">Inregistrare</h1>
      {Array.isArray(error) &&
        error.length > 0 &&
        error.map((err, index) => (
          <Message key={index} variant="danger">
            {err.msg}
          </Message>
        ))}
      {error && !Array.isArray(error) && (
        <Message variant="danger">{error}</Message>
      )}
      {loading && <Loader />}
      <Form onSubmit={submitHandler} className="text-white">
        <Form.Group controlId="lastName">
          <Form.Label>Nume</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nume"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="firstName">
          <Form.Label>Prenume</Form.Label>
          <Form.Control
            type="text"
            placeholder="Prenume"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Adresa email</Form.Label>
          <Form.Control
            type="email"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Parola</Form.Label>
          <Form.Control
            type="password"
            placeholder="parola"
            value={password}
            onChange={e => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3 text-white">
          Register
        </Button>
      </Form>
      <Row className="py-3 text-white">
        <Col>
          Ai deja un cont?{" "}
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
