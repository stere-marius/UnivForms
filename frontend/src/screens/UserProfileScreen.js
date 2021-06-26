import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Message from "../components/Message";
import Meta from "../components/Meta";
import { USER_LOGIN_SUCCESS } from "../constants/userConstants";

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

  useEffect(() => {
    if (!userInfo) return;

    setFirstName(userInfo.prenume);
    setLastName(userInfo.nume);
    setEmail(userInfo.email);
  }, [userInfo]);

  useEffect(() => {
    setErrors(new Set());
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

      if (data.message) {
        setMessages(new Set(messages).add(data.message));
      }

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: data.user,
      });
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
    <>
      <Meta title="Profilul meu" />
      <div className="container d-flex flex-column">
        <Header />
        <div className="">
          <div
            className="p-5 "
            style={{
              borderRadius: "22px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
              backgroundColor: "#EFEFEF",
            }}
          >
            <div className="d-flex justify-content-center">
              <div style={{ minWidth: "50%" }}>
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

                {errors.size > 0 &&
                  [...errors].map((error, index) => (
                    <Message key={index} variant="danger">
                      {error}
                    </Message>
                  ))}
                {messages.size > 0 &&
                  [...messages].map((message, index) => (
                    <Message key={index} variant="info">
                      {message}
                    </Message>
                  ))}

                <div className="d-flex flex-column flex-md-row justify-content-md-between">
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
        </div>
      </div>
    </>
  );
};

export default UserProfileScreen;
