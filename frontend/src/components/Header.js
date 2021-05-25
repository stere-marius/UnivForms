import React from "react";
import { Form, Button, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../actions/userActions";
import { useDispatch, useSelector } from "react-redux";

const Header = ({ width }) => {
  document.body.style = "background: #191722";

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header
      className="d-flex justify-content-center align-items-center my-1 mx-auto"
      style={{ width }}
    >
      <LinkContainer to="/">
        <div style={{ marginRight: "auto" }}>
          <Image
            src="/images/logo.png"
            style={{ width: "64px", display: "block" }}
            fluid
          />
        </div>
      </LinkContainer>

      <Form.Group
        className="nav-search-form d-none d-sm-block"
        style={{ width: "40%", margin: "auto" }}
      >
        <Form.Control
          type="text"
          placeholder="Cauta un formular"
          style={{
            padding: "0.3rem 0.3rem 0.3rem 0.8rem",
            borderRadius: "15px",
            border: "none",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
          }}
        ></Form.Control>
      </Form.Group>

      <div className="nav-buttons" style={{ display: "flex" }}>
        {!userInfo ? (
          <>
            <LinkContainer to="/register">
              <Button className="btn-white mx-3">Register</Button>
            </LinkContainer>
            <LinkContainer to="/login">
              <Button className="btn-white mx-3">Sign In</Button>
            </LinkContainer>
          </>
        ) : (
          <>
            <LinkContainer to="/my-profile">
              <Button className="btn-white mx-3">My profile</Button>
            </LinkContainer>
            <Button className="btn-white mx-3" onClick={logoutHandler}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
