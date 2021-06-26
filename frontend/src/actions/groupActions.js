import axios from "axios";
import {
  GROUP_ADMINS_FAIL,
  GROUP_ADMINS_REQUEST,
  GROUP_ADMINS_SUCCESS,
  GROUP_CREATE_FAIL,
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_SUCCESS,
  GROUP_FORMS_FAIL,
  GROUP_FORMS_REQUEST,
  GROUP_FORMS_SUCCESS,
  GROUP_TITLE_FAIL,
  GROUP_TITLE_REQUEST,
  GROUP_TITLE_RESET,
  GROUP_TITLE_SUCCESS,
  GROUP_USERS_FAIL,
  GROUP_USERS_REQUEST,
  GROUP_USERS_SUCCESS,
} from "../constants/groupConstants";

export const createGroup = groupName => async (dispatch, getState) => {
  try {
    dispatch({ type: GROUP_CREATE_REQUEST });

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
      `/api/groups`,
      { name: groupName },
      config
    );
    dispatch({ type: GROUP_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GROUP_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getGroupForms = groupID => async (dispatch, getState) => {
  try {
    dispatch({ type: GROUP_FORMS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/groups/${groupID}/forms`, config);
    dispatch({ type: GROUP_FORMS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GROUP_FORMS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
export const getGroupAdmins = groupID => async (dispatch, getState) => {
  try {
    dispatch({ type: GROUP_ADMINS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/groups/${groupID}/admins`, config);
    dispatch({ type: GROUP_ADMINS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GROUP_ADMINS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getGroupUsers = groupID => async (dispatch, getState) => {
  try {
    dispatch({ type: GROUP_USERS_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/groups/${groupID}/users`, config);
    dispatch({ type: GROUP_USERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GROUP_USERS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateGroupTitle =
  (groupID, groupTitle) => async (dispatch, getState) => {
    try {
      dispatch({ type: GROUP_TITLE_REQUEST });

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
        `/api/groups/${groupID}`,
        { title: groupTitle },
        config
      );
      dispatch({ type: GROUP_TITLE_SUCCESS, payload: data });
      setTimeout(() => {
        dispatch({ type: GROUP_TITLE_RESET });
      }, 3000);
    } catch (error) {
      dispatch({
        type: GROUP_TITLE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
