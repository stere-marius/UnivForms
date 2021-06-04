import axios from "axios";
import {
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_SUCCESS,
  GROUP_CREATE_FAIL,
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
