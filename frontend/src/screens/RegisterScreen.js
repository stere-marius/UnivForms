import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import FormContainer from "../components/form/FormContainer";
import { register } from "../actions/userActions";
import { USER_REGISTER_RESET } from "../constants/userConstants";
import PasswordInput from "../components/PasswordInput";
import Header from "../components/Header";
import Meta from "../components/Meta";

const RegisterScreen = ({ location, history }) => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [errors, setErrors] = useState(new Set());

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

  useEffect(() => {
    setErrors(new Set());
  }, [password, confirmPassword]);

  const submitHandler = e => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrors(new Set(errors).add("Cele două parola nu coincid!"));
      return;
    }

    dispatch(register(firstName, lastName, email, password));
  };

  return (
    <>
      <Meta title="Inregistrare" />
      <Header />
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
        {errors.size > 0 &&
          [...errors].map((err, index) => (
            <Message key={index} variant="danger">
              {err}
            </Message>
          ))}
        {loading && <Loader />}
        <Form onSubmit={submitHandler} className="text-white">
          <Form.Group controlId="lastName">
            <Form.Label>Nume</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nume"
              value={lastName}
              className="form-input-green"
              onChange={e => setLastName(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="firstName">
            <Form.Label>Prenume</Form.Label>
            <Form.Control
              type="text"
              placeholder="Prenume"
              value={firstName}
              className="form-input-green"
              onChange={e => setFirstName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Adresa email</Form.Label>
            <Form.Control
              type="email"
              placeholder="email"
              value={email}
              className="form-input-green"
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

          <PasswordInput
            password={confirmPassword}
            setPassword={setConfirmPassword}
            id="confirmPassword"
            labelText="Confirmati parola"
            inputPlaceholder="Confirmare parola"
            textColor="text-color-white"
          />

          <button type="submit" className="btn btn-color-green mt-3 text-dark">
            Inregistrare
          </button>
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
    </>
  );
};

export default RegisterScreen;
