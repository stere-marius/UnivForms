import axios from "axios";
import {
  FORM_DETAILS_REQUEST,
  FORM_DETAILS_SUCCESS,
  FORM_DETAILS_FAIL,
  FORM_SEND_RESPONSE_REQUEST,
  FORM_SEND_RESPONSE_SUCCESS,
  FORM_SEND_RESPONSE_FAIL,
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAIL,
  FORM_CREATE_RESET,
  FORM_UPDATE_RESET,
  FORM_UPDATE_QUESTION_REQUEST,
  FORM_UPDATE_QUESTION_SUCCESS,
  FORM_UPDATE_QUESTION_FAIL,
  FORM_CREATE_QUESTION_REQUEST,
  FORM_CREATE_QUESTION_SUCCESS,
  FORM_CREATE_QUESTION_FAIL,
  FORM_DELETE_QUESTION_REQUEST,
  FORM_DELETE_QUESTION_SUCCESS,
  FORM_DELETE_QUESTION_FAIL,
  FORM_DELETE_QUESTION_RESET,
  FORM_UPDATE_REQUEST,
  FORM_UPDATE_SUCCESS,
  FORM_UPDATE_FAIL,
  FORM_UPDATE_QUESTION_RESET,
  FORM_ANSWERS_REQUEST,
  FORM_ANSWERS_SUCCESS,
  FORM_ANSWERS_FAIL,
  FORM_ANSWER_REQUEST,
  FORM_ANSWER_SUCCESS,
  FORM_ANSWER_FAIL,
  FORM_DELETE_ANSWER_REQUEST,
  FORM_DELETE_ANSWER_FAIL,
  FORM_DELETE_ANSWER_SUCCESS,
  FORM_DELETE_ANSWER_RESET,
} from "../constants/formConstants";

export const listFormDetails = (id, isView) => async (dispatch, getState) => {
  try {
    dispatch({ type: FORM_DETAILS_REQUEST });
    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const { data } = await axios.get(
      `/api/forms/${id}${isView ? "/view" : ""}`,
      config
    );

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
    dispatch({ type: FORM_CREATE_RESET });
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

export const updateForm = (formID, formData) => async (dispatch, getState) => {
  try {
    dispatch({ type: FORM_UPDATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.put(`/api/forms/${formID}`, formData, config);
    dispatch({ type: FORM_UPDATE_SUCCESS, payload: data });

    setTimeout(() => {
      dispatch({ type: FORM_UPDATE_RESET });
    }, 3000);
  } catch (error) {
    dispatch({
      type: FORM_UPDATE_FAIL,
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
      setTimeout(() => {
        dispatch({ type: FORM_UPDATE_QUESTION_RESET });
      }, 3500);
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
  (formID, questionData, successCb = () => {}) =>
  async (dispatch, getState) => {
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
      successCb(data);
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

export const deleteQuestion =
  (formID, questionID) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_DELETE_QUESTION_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.delete(
        `/api/forms/${formID}/questions/${questionID}`,
        config
      );

      dispatch({ type: FORM_DELETE_QUESTION_SUCCESS });

      setTimeout(() => {
        dispatch({ type: FORM_DELETE_QUESTION_RESET });
      }, 3500);
    } catch (error) {
      dispatch({
        type: FORM_DELETE_QUESTION_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const getFormAnswers =
  (formID, page, searchQuery) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_ANSWERS_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `/api/forms/${formID}/answers${
          searchQuery ? `?search=${searchQuery}` : ""
        }`,
        { pagina: page },
        config
      );

      dispatch({ type: FORM_ANSWERS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FORM_ANSWERS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const getFormAnswer =
  (formID, answerID) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_ANSWER_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/forms/${formID}/answers/${answerID}`,
        config
      );

      dispatch({ type: FORM_ANSWER_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: FORM_ANSWER_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const deleteFormAnswer =
  (formID, answerID) => async (dispatch, getState) => {
    try {
      dispatch({ type: FORM_DELETE_ANSWER_REQUEST });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.delete(
        `/api/forms/${formID}/answers/${answerID}`,
        config
      );

      dispatch({ type: FORM_DELETE_ANSWER_SUCCESS, payload: data });

      setTimeout(() => {
        dispatch({ type: FORM_DELETE_ANSWER_RESET });
      }, 3000);
    } catch (error) {
      dispatch({
        type: FORM_DELETE_ANSWER_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };
