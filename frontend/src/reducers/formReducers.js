import {
  FORM_DETAILS_REQUEST,
  FORM_DETAILS_SUCCESS,
  FORM_DETAILS_FAIL,
  FORM_UPDATE_REQUEST,
  FORM_UPDATE_SUCCESS,
  FORM_UPDATE_FAIL,
  FORM_UPDATE_RESET,
  FORM_SEND_RESPONSE_REQUEST,
  FORM_SEND_RESPONSE_SUCCESS,
  FORM_SEND_RESPONSE_FAIL,
  FORM_CREATE_REQUEST,
  FORM_CREATE_SUCCESS,
  FORM_CREATE_FAIL,
  FORM_CREATE_RESET,
  FORM_UPDATE_QUESTION_REQUEST,
  FORM_UPDATE_QUESTION_SUCCESS,
  FORM_UPDATE_QUESTION_FAIL,
  FORM_UPDATE_QUESTION_RESET,
  FORM_CREATE_QUESTION_REQUEST,
  FORM_CREATE_QUESTION_SUCCESS,
  FORM_CREATE_QUESTION_FAIL,
  FORM_DELETE_QUESTION_REQUEST,
  FORM_DELETE_QUESTION_SUCCESS,
  FORM_DELETE_QUESTION_FAIL,
  FORM_DELETE_QUESTION_RESET,
  FORM_ANSWERS_REQUEST,
  FORM_ANSWERS_SUCCESS,
  FORM_ANSWERS_FAIL,
  FORM_ANSWERS_RESET,
  FORM_ANSWER_REQUEST,
  FORM_ANSWER_SUCCESS,
  FORM_ANSWER_FAIL,
  FORM_ANSWER_RESET,
  FORM_DETAILS_RESET,
  FORM_DELETE_ANSWER_REQUEST,
  FORM_DELETE_ANSWER_SUCCESS,
  FORM_DELETE_ANSWER_FAIL,
  FORM_DELETE_ANSWER_RESET,
} from "../constants/formConstants";

export const formDetailsReducer = (state = { form: {} }, action) => {
  switch (action.type) {
    case FORM_DETAILS_REQUEST:
      return { loading: true, ...state };
    case FORM_DETAILS_SUCCESS:
      return { loading: false, form: action.payload };
    case FORM_DETAILS_FAIL:
      return { loading: false, error: action.payload, form: {} };
    case FORM_DETAILS_RESET:
      return { form: {} };
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
      return {
        loading: false,
        error: action.payload.errors,
        canAnswer: action.payload.canAnswer,
      };
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
    case FORM_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const formUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_UPDATE_REQUEST:
      return { loading: true };
    case FORM_UPDATE_SUCCESS:
      return { loading: false, success: true, form: action.payload };
    case FORM_UPDATE_FAIL:
      return { loading: false, success: false, error: action.payload };
    case FORM_UPDATE_RESET:
      return {};
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
    case FORM_UPDATE_QUESTION_RESET:
      return {};
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

export const formDeleteQuestionReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_DELETE_QUESTION_REQUEST:
      return { loading: true };
    case FORM_DELETE_QUESTION_SUCCESS:
      return { loading: false, success: true };
    case FORM_DELETE_QUESTION_FAIL:
      return { loading: false, success: false, error: action.payload };
    case FORM_DELETE_QUESTION_RESET:
      return {};
    default:
      return state;
  }
};

export const formAnswersReducer = (
  state = { raspunsuri: [], raspunsuriTotale: 0 },
  action
) => {
  switch (action.type) {
    case FORM_ANSWERS_REQUEST:
      return { loading: true };
    case FORM_ANSWERS_SUCCESS:
      return {
        loading: false,
        raspunsuri: action.payload.raspunsuri,
        raspunsuriTotale: action.payload.raspunsuriTotale,
        creatorFormular: action.payload.creatorFormular,
      };
    case FORM_ANSWERS_FAIL:
      return { loading: false, error: action.payload };
    case FORM_ANSWERS_RESET:
      return {};
    default:
      return state;
  }
};

export const formAnswerReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_ANSWER_REQUEST:
      return { loading: true };
    case FORM_ANSWER_SUCCESS:
      return { loading: false, raspuns: action.payload };
    case FORM_ANSWER_FAIL:
      return { loading: false, error: action.payload };
    case FORM_ANSWER_RESET:
      return {};
    default:
      return state;
  }
};

export const formAnswerDeleteReducer = (state = {}, action) => {
  switch (action.type) {
    case FORM_DELETE_ANSWER_REQUEST:
      return { loading: true };
    case FORM_DELETE_ANSWER_SUCCESS:
      return { loading: false, success: true };
    case FORM_DELETE_ANSWER_FAIL:
      return { loading: false, success: false };
    case FORM_DELETE_ANSWER_RESET:
      return {};
    default:
      return state;
  }
};
