import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

const FormTimerAlertScreen = ({ match }) => {
  const [hasAcceptedTimer, setAcceptedTimer] = useState(false);

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }

    dispatch(listFormDetails(match.params.id));
  }, [match, dispatch]);

  return <></>;
};

export default FormTimerAlertScreen;
