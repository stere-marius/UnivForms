import axios from "axios";
import {
  FORM_DETAILS_REQUEST,
  FORM_DETAILS_SUCCESS,
  FORM_DETAILS_FAIL,
  FORM_SEND_RESPONSE_REQUEST,
  FORM_SEND_RESPONSE_SUCCESS,
  FORM_SEND_RESPONSE_FAIL,
  FORM_FILE_UPLOAD_REQUEST,
  FORM_FILE_UPLOAD_SUCCESS,
  FORM_FILE_UPLOAD_FAIL,
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

export const sendFormResponses = responseData => async (dispatch, getState) => {
  try {
    dispatch({ type: FORM_SEND_RESPONSE_REQUEST });

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
      `/api/forms/${responseData.formID}/response`,
      responseData,
      config
    );

    dispatch({ type: FORM_SEND_RESPONSE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FORM_SEND_RESPONSE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const formFileUpload =
  (formData, onUploadProgressEvent) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_FILE_UPLOAD_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: progressEv => onUploadProgressEvent(progressEv),
      };

      const { data } = await axios.post(
        "/api/forms/uploadFormResponse",
        formData,
        config
      );

      dispatch({ type: FORM_FILE_UPLOAD_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FORM_FILE_UPLOAD_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
