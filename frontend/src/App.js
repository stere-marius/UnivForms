import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import UserAnswerTab from "./components/form/UserAnswerTab";
import Header from "./components/Header";
import Meta from "./components/Meta";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import FormAnswersScreen from "./screens/FormAnswersScreen";
import FormEditScreen from "./screens/FormEditScreen";
import FormMainScreen from "./screens/FormMainScreen";
import FormSummaryScreen from "./screens/FormSummaryScreen";
import FormViewScreen from "./screens/FormViewScreen";
import GroupMainScreen from "./screens/GroupMainScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import "./wdyr";

function App() {
  document.body.style = "background: #191722";

  return (
    <>
      <Meta />
      <Router>
        <Switch>
          <PrivateRoute path="/group/:id">
            <GroupMainScreen />
          </PrivateRoute>
          <PrivateRoute path="/form/:id" exact>
            <FormMainScreen />
          </PrivateRoute>
          <PrivateRoute path="/form/:id/edit">
            <FormEditScreen />
          </PrivateRoute>
          <PrivateRoute path="/form/:id/view">
            <FormViewScreen />
          </PrivateRoute>
          <PrivateRoute path="/form/:id/summary">
            <FormSummaryScreen />
          </PrivateRoute>
          <PrivateRoute exact path="/form/:id/answers">
            <FormAnswersScreen />
          </PrivateRoute>
          <PrivateRoute path="/my-profile">
            <UserProfileScreen />
          </PrivateRoute>
          <Route
            path="/form/:id/answers/:answerID"
            exact
            render={props => (
              <>
                <Header />
                <div
                  className="mt-4 container bg-white py-2"
                  style={{ borderRadius: "16px" }}
                >
                  <UserAnswerTab
                    formID={props.match.params.id}
                    answerID={props.match.params.answerID}
                  />
                </div>
              </>
            )}
          />
          <Route path="/login" component={LoginScreen} />
          <Route path="/register" component={RegisterScreen} />
          <Route path="/resetPassword" component={ResetPasswordScreen} />
          <Route path="/" component={HomeScreen} exact />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
