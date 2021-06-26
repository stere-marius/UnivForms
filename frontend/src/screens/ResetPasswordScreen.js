import axios from "axios";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import FormContainer from "../components/form/FormContainer";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Message from "../components/Message";

const ResetPasswordScreen = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [successMessages, setSuccessMessages] = useState(new Set());

  const [errors, setErrors] = useState(new Set());

  useEffect(() => {
    setErrors(new Set());
    setSuccessMessages(new Set());
  }, [email]);

  const submitHandler = async e => {
    e.preventDefault();

    if (!email) {
      setErrors(new Set(errors).add("Adresa de email nu trebuie să fie vidă!"));
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        "/api/users/profile/generatePasswordLink",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessages(new Set(successMessages).add(data.message));
    } catch (error) {
      setErrors(
        new Set(errors).add(
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <FormContainer>
        <h1 className="text-white">Resetare parola</h1>
        {loading && <Loader />}
        <Form onSubmit={submitHandler} className="text-white">
          {loading && <Loader />}

          {errors.size > 0 &&
            [...errors].map((error, index) => (
              <Message key={index} variant="danger" className="mt-3">
                {error}
              </Message>
            ))}
          {successMessages.size > 0 &&
            [...successMessages].map((message, index) => (
              <Message key={index} variant="success" className="mt-3">
                {message}
              </Message>
            ))}

          <Form.Group controlId="lastName">
            <Form.Label>Adresa email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Adresa email"
              value={email}
              className="form-input-green"
              onChange={e => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <button type="submit" className="btn btn-color-green mt-3 text-dark">
            Resetare parola
          </button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ResetPasswordScreen;
