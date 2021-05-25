import axios from "axios";
import {
  FORM_DETAILS_REQUEST,
  FORM_DETAILS_SUCCESS,
  FORM_DETAILS_FAIL,
} from "../constants/formConstants";

export const listFormDetails = id => async dispatch => {
  try {
    dispatch({ type: FORM_DETAILS_REQUEST });
    const { data } = await axios.get(`/api/forms/${id}`);
    dispatch({ type: FORM_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FORM_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
