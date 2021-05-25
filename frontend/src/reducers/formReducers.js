import {
  FORM_DETAILS_REQUEST,
  FORM_DETAILS_SUCCESS,
  FORM_DETAILS_FAIL,
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
