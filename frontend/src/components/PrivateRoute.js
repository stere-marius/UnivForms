import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Redirect } from "react-router";
import { useHistory } from "react-router-dom";

const PrivateRoute = ({ children, ...rest }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const history = useHistory();

  useEffect(() => {
    if (!userInfo || !userInfo.token) {
      history.push(`/login?redirect=${history.location.pathname}`);
    }
  }, [history, userInfo]);

  return (
    <Route
      {...rest}
      render={props =>
        userInfo && userInfo.token ? (
          React.cloneElement(children, { ...props })
        ) : (
          <> </>
        )
      }
    />
  );
};

export default PrivateRoute;
