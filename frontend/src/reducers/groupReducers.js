import {
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_SUCCESS,
  GROUP_CREATE_FAIL,
  GROUP_FORMS_REQUEST,
  GROUP_FORMS_SUCCESS,
  GROUP_FORMS_FAIL,
  GROUP_FORMS_RESET,
  GROUP_ADMINS_REQUEST,
  GROUP_ADMINS_SUCCESS,
  GROUP_ADMINS_FAIL,
  GROUP_ADMINS_RESET,
  GROUP_USERS_REQUEST,
  GROUP_USERS_SUCCESS,
  GROUP_USERS_FAIL,
  GROUP_USERS_RESET,
  GROUP_TITLE_REQUEST,
  GROUP_TITLE_SUCCESS,
  GROUP_TITLE_FAIL,
  GROUP_TITLE_RESET,
} from "../constants/groupConstants";

export const groupCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case GROUP_CREATE_REQUEST:
      return { loading: true, ...state };
    case GROUP_CREATE_SUCCESS:
      return { loading: false, success: true, group: action.payload };
    case GROUP_CREATE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const groupFormsReducer = (state = { forms: [] }, action) => {
  switch (action.type) {
    case GROUP_FORMS_REQUEST:
      return { loading: true };
    case GROUP_FORMS_SUCCESS:
      return {
        loading: false,
        forms: action.payload.forms,
        groupTitle: action.payload.titlu,
      };
    case GROUP_FORMS_FAIL:
      return { loading: false, error: action.payload };
    case GROUP_FORMS_RESET:
      return { forms: [] };
    default:
      return state;
  }
};

export const groupAdminsReducer = (state = { admins: [] }, action) => {
  switch (action.type) {
    case GROUP_ADMINS_REQUEST:
      return { loading: true };
    case GROUP_ADMINS_SUCCESS:
      return { loading: false, admins: action.payload };
    case GROUP_ADMINS_FAIL:
      return { loading: false, error: action.payload };
    case GROUP_ADMINS_RESET:
      return { forms: [] };
    default:
      return state;
  }
};

export const groupUsersReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case GROUP_USERS_REQUEST:
      return { loading: true };
    case GROUP_USERS_SUCCESS:
      return { loading: false, users: action.payload };
    case GROUP_USERS_FAIL:
      return { loading: false, error: action.payload };
    case GROUP_USERS_RESET:
      return { users: [] };
    default:
      return state;
  }
};

export const groupTitleReducer = (state = {}, action) => {
  switch (action.type) {
    case GROUP_TITLE_REQUEST:
      return { loading: true };
    case GROUP_TITLE_SUCCESS:
      return { loading: false, title: action.payload.title, success: true };
    case GROUP_TITLE_FAIL:
      return { loading: false, error: action.payload };
    case GROUP_TITLE_RESET:
      return {};
    default:
      return state;
  }
};
