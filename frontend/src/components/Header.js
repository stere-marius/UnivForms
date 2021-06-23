import React from "react";
import { Button, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { logout } from "../actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const Header = ({ width }) => {
  let history = useHistory();

  const dispatch = useDispatch();
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const logoutHandler = () => {
    dispatch(logout());
    history.push(`/`);
  };

  return (
    <header
      className="d-flex flex-column flex-sm-row justify-content-between align-items-center "
      style={{ width }}
    >
      <a href="/" className="cursor-pointer">
          <Image
            src="/images/logo.png"
            style={{ width: "64px", display: "block" }}
            fluid
          />
      </a>

      <div className="nav-buttons d-flex flex-column flex-sm-row align-items-center p-4 p-md-0">
        {!userInfo ? (
          <>
            <LinkContainer to="/register">
              <Button className="btn-color-white text-dark fw-bold rounded-pill px-3 py-1 mx-5">
                Inregistrare
              </Button>
            </LinkContainer>
            <LinkContainer to="/login">
              <Button className="btn-color-white text-dark fw-bold rounded-pill px-3 py-1">
                Logare
              </Button>
            </LinkContainer>
          </>
        ) : (
          <>
            <LinkContainer to="/my-profile">
              <Button className="btn-color-white text-dark fw-bold rounded-pill px-3 py-1 mx-5">
                Profil
              </Button>
            </LinkContainer>
            <Button
              className="btn-color-white text-dark fw-bold rounded-pill px-3 py-1 my-4 my-md-0"
              onClick={logoutHandler}
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
