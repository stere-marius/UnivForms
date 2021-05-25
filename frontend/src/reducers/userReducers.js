import {
  USER_LOGIN_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_GROUPS_REQUEST,
  USER_GROUPS_SUCCESS,
  USER_GROUPS_FAIL,
  USER_FORMS_REQUEST,
  USER_FORMS_SUCCESS,
  USER_FORMS_FAIL,
  USER_FORMS_RESET,
  USER_GROUPS_RESET,
} from "../constants/userConstants";

export const userLoginReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return { loading: true };
    case USER_LOGIN_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_LOGIN_FAIL:
      return { loading: false, error: action.payload };
    case USER_LOGOUT:
      return {};
    default:
      return state;
  }
};

export const userRegisterReducer = (state = {}, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
      return { loading: true };
    case USER_REGISTER_SUCCESS:
      return { loading: false, userInfo: action.payload };
    case USER_REGISTER_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const userGroupsReducer = (state = { groups: [] }, action) => {
  switch (action.type) {
    case USER_GROUPS_REQUEST:
      return { ...state, loading: true };
    case USER_GROUPS_SUCCESS:
      return { loading: false, groups: action.payload };
    case USER_GROUPS_FAIL:
      return { loading: false, error: action.payload };
    case USER_GROUPS_RESET:
      return { groups: [] };
    default:
      return state;
  }
};

export const userFormsReducer = (state = { forms: [] }, action) => {
  switch (action.type) {
    case USER_FORMS_REQUEST:
      return { ...state, loading: true };
    case USER_FORMS_SUCCESS:
      return { loading: false, forms: action.payload };
    case USER_FORMS_FAIL:
      return { loading: false, error: action.payload };
    case USER_FORMS_RESET:
      return { forms: [] };
    default:
      return state;
  }
};
