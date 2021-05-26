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

export const formSendResponsesReducer = (state = {}, action) => {
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

export const formFileUploadReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_FILE_UPLOAD_REQUEST:
      return { loading: true };
    case FORM_FILE_UPLOAD_SUCCESS:
      return { loading: false, success: true };
    case FORM_FILE_UPLOAD_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
