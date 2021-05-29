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
  FORM_UPDATE_QUESTION_REQUEST,
  FORM_UPDATE_QUESTION_SUCCESS,
  FORM_UPDATE_QUESTION_FAIL,
  FORM_CREATE_QUESTION_REQUEST,
  FORM_CREATE_QUESTION_SUCCESS,
  FORM_CREATE_QUESTION_FAIL,
} from "../constants/formConstants";

export const formDetailsReducer = (state = { form: {} }, action) => {
  switch (action.type) {
    case FORM_DETAILS_REQUEST:
      return { loading: true, ...state };
    case FORM_DETAILS_SUCCESS:
      return { loading: false, form: action.payload };
    case FORM_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const formSendResponseReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_SEND_RESPONSE_REQUEST:
      return { loading: true };
    case FORM_SEND_RESPONSE_SUCCESS:
      return { loading: false, success: true };
    case FORM_SEND_RESPONSE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const formCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_CREATE_REQUEST:
      return { loading: true };
    case FORM_CREATE_SUCCESS:
      return { loading: false, success: true, form: action.payload };
    case FORM_CREATE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const formUpdateQuestionReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_UPDATE_QUESTION_REQUEST:
      return { loading: true };
    case FORM_UPDATE_QUESTION_SUCCESS:
      return { loading: false, success: true, question: action.payload };
    case FORM_UPDATE_QUESTION_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const formCreateQuestionReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_CREATE_QUESTION_REQUEST:
      return { loading: true };
    case FORM_CREATE_QUESTION_SUCCESS:
      return { loading: false, success: true, question: action.payload };
    case FORM_CREATE_QUESTION_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};
