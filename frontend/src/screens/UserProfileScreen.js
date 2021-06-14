import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/Header";
import Message from "../components/Message";
import { updateProfile } from "../actions/userActions";
import Loader from "../components/Loader";
import { USER_LOGIN_SUCCESS } from "../constants/userConstants";
import axios from "axios";

const UserProfileScreen = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState(new Set());

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState(new Set());

  const [successMessages, setSuccessMessages] = useState(new Set());

  const [successfullyUpdated, setSuccessfullyUpdated] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    setFirstName(userInfo.prenume);
    setLastName(userInfo.nume);
    setEmail(userInfo.email);
  }, [userInfo]);

  useEffect(() => {
    setErrors(new Set());
    setSuccessfullyUpdated(false);
  }, [firstName, lastName, email]);

  const handleResetPassword = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      setLoading(true);

      const { data } = await axios.put(
        "/api/users/profile/generatePasswordLink",
        { email: userInfo.email },
        config
      );

      setMessages(new Set(messages).add(data.message));
      setSuccessfullyUpdated(true);
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

  const handleSave = async () => {
    if (!lastName) {
      setErrors(new Set(errors).add("Numele nu trebuie sa fie vid!"));
      return;
    }
    if (!firstName) {
      setErrors(new Set(errors).add("Prenumele nu trebuie sa fie vid!"));
      return;
    }

    if (!email) {
      setErrors(new Set(errors).add("Adresa de email nu trebuie sa fie vidă!"));
      return;
    }

    const isUpdatedEmail = email.trim() !== userInfo.email.trim();

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      setLoading(true);

      const { data } = await axios.put(
        "/api/users/profile",
        {
          prenume: firstName,
          nume: lastName,
          email: isUpdatedEmail ? email.trim() : undefined,
        },
        config
      );

      console.log(`Data = ${JSON.stringify(data, null, 2)}`);

      if (data.message) {
        setMessages(new Set(messages).add(data.message));
      }

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: data.user,
      });
      setSuccessfullyUpdated(true);
    } catch (error) {
      if (error.response.data.errors) {
        setErrors(
          new Set(errors).add([
            ...(error.response && error.response.data.errors
              ? error.response.data.errors
              : error.message),
          ])
        );
        return;
      }

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
    <div className="container d-flex flex-column">
      <Header />
      <div className="d-flex justify-content-center">
        <div
          className="d-flex flex-column align-items-start p-5 "
          style={{
            borderRadius: "22px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            backgroundColor: "#EFEFEF",
          }}
        >
          <div class="mt-3">
            <label for="formControlNume" class="form-label">
              Nume
            </label>
            <input
              type="text"
              class="form-control form-input-green"
              id="formControlNume"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>
          <div class="mt-3">
            <label for="formControlPrenume" class="form-label">
              Prenume
            </label>
            <input
              type="text"
              class="form-control form-input-green"
              id="formControlPrenume"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>
          <div class="mt-3">
            <label for="formControlEmail" class="form-label">
              Email
            </label>
            <input
              type="email"
              class="form-control form-input-green"
              id="formControlEmail"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          {loading && <Loader />}

          {successfullyUpdated && (
            <Message variant="success" className="mt-3">
              Profilul a fost actualizat cu success!
            </Message>
          )}
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
          {messages.size > 0 &&
            [...messages].map((message, index) => (
              <Message key={index} variant="info" className="mt-3">
                {message}
              </Message>
            ))}
          <div className="d-flex flex-column">
            <button
              className="btn btn-color-green px-2 mt-3"
              onClick={handleSave}
            >
              Salveaza
            </button>
            <button
              className="btn btn-color-green px-2 mt-3"
              onClick={handleResetPassword}
            >
              Reseteaza parola
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileScreen;
