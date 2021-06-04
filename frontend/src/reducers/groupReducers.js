import {
  GROUP_CREATE_REQUEST,
  GROUP_CREATE_SUCCESS,
  GROUP_CREATE_FAIL,
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
