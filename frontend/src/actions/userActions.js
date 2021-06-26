import axios from "axios";
import {
  USER_FORMS_FAIL,
  USER_FORMS_REQUEST,
  USER_FORMS_RESET,
  USER_FORMS_SUCCESS,
  USER_GROUPS_FAIL,
  USER_GROUPS_REQUEST,
  USER_GROUPS_RESET,
  USER_GROUPS_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
} from "../constants/userConstants";

export const login = (email, password) => async dispatch => {
  try {
    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      "/api/users/login",
      { email, parola: password },
      config
    );

    console.log(data);

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem("userInfo", JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const logout = () => dispatch => {
  localStorage.removeItem("userInfo");
  dispatch({
    type: USER_LOGOUT,
  });

  dispatch({
    type: USER_FORMS_RESET,
  });

  dispatch({
    type: USER_GROUPS_RESET,
  });
};

export const register =
  (firstName, lastName, email, password) => async dispatch => {
    try {
      dispatch({
        type: USER_REGISTER_REQUEST,
      });

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/users",
        { prenume: lastName, nume: firstName, email, parola: password },
        config
      );

      dispatch({
        type: USER_REGISTER_SUCCESS,
        payload: data,
      });

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: data,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
    } catch (error) {
      console.log(`Error is ${JSON.stringify(error.response.data, null, 2)}`);
      if (error.response.data.errors) {
        dispatch({
          type: USER_REGISTER_FAIL,
          payload:
            error.response && error.response.data.errors
              ? error.response.data.errors
              : error.message,
        });
        return;
      }

      dispatch({
        type: USER_REGISTER_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
export const updateProfile =
  (firstName, lastName, email) => async (dispatch, getState) => {
    try {
      dispatch({
        type: USER_UPDATE_PROFILE_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.put(
        "/api/users/profile",
        { prenume: lastName, nume: firstName, email },
        config
      );

      dispatch({
        type: USER_UPDATE_PROFILE_SUCCESS,
        payload: data,
      });

      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: data.user,
      });
    } catch (error) {
      if (error.response.data.errors) {
        dispatch({
          type: USER_UPDATE_PROFILE_FAIL,
          payload:
            error.response && error.response.data.errors
              ? error.response.data.errors
              : error.message,
        });
        return;
      }

      dispatch({
        type: USER_UPDATE_PROFILE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const getGroups = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_GROUPS_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get("/api/users/groups", config);

    dispatch({
      type: USER_GROUPS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_GROUPS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getForms = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: USER_FORMS_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get("/api/users/forms", config);

    dispatch({
      type: USER_FORMS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_FORMS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
