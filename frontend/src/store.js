import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  userLoginReducer,
  userRegisterReducer,
  userGroupsReducer,
  userFormsReducer,
} from "./reducers/userReducers";
import {
  formCreateQuestionReducer,
  formCreateReducer,
  formDeleteQuestionReducer,
  formDetailsReducer,
  formSendResponseReducer,
  formUpdateQuestionReducer,
  formUpdateReducer,
} from "./reducers/formReducers";

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userGroups: userGroupsReducer,
  userForms: userFormsReducer,
  formDetails: formDetailsReducer,
  formResponse: formSendResponseReducer,
  formCreate: formCreateReducer,
  formUpdate: formUpdateReducer,
  formUpdatedQuestion: formUpdateQuestionReducer,
  formCreatedQuestion: formCreateQuestionReducer,
  formDeletedQuestion: formDeleteQuestionReducer,
});

const userInfoFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialState = { userLogin: { userInfo: userInfoFromStorage } };

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
