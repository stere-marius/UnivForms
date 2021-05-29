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
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAIL,
  FORM_UPDATE_QUESTION_REQUEST,
  FORM_UPDATE_QUESTION_SUCCESS,
  FORM_UPDATE_QUESTION_FAIL,
  FORM_CREATE_QUESTION_REQUEST,
  FORM_CREATE_QUESTION_SUCCESS,
  FORM_CREATE_QUESTION_FAIL,
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

export const sendFormResponse =
  (formData, onUploadProgressEvent) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_SEND_RESPONSE_REQUEST });

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
        `/api/forms/sendAnswer`,
        formData,
        config
      );

      dispatch({ type: FORM_SEND_RESPONSE_SUCCESS, payload: data });
    } catch (error) {
      const errors = error.response.data.errors;

      if (errors) {
        dispatch({
          type: FORM_SEND_RESPONSE_FAIL,
          payload: errors,
        });
        return;
      }

      dispatch({
        type: FORM_SEND_RESPONSE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const createForm = formData => async (dispatch, getState) => {
  try {
    dispatch({ type: FORM_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(`/api/forms`, formData, config);
    dispatch({ type: FORM_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FORM_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateQuestion =
  (formID, questionID, questionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_UPDATE_QUESTION_REQUEST });

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
        `/api/forms/${formID}/questions/${questionID}`,
        questionData,
        config
      );
      dispatch({ type: FORM_UPDATE_QUESTION_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FORM_UPDATE_QUESTION_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const createQuestion =
  (formID, questionData) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_CREATE_QUESTION_REQUEST });

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
        `/api/forms/${formID}/questions`,
        questionData,
        config
      );
      dispatch({ type: FORM_CREATE_QUESTION_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FORM_CREATE_QUESTION_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
