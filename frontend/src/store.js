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
  formDetailsReducer,
  formFileUploadReducer,
} from "./reducers/formReducers";

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userGroups: userGroupsReducer,
  userForms: userFormsReducer,
  formDetails: formDetailsReducer,
  formFileUpload: formFileUploadReducer,
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
