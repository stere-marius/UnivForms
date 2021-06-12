import "./wdyr";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FormViewScreen from "./screens/FormViewScreen";
import FormMainScreen from "./screens/FormMainScreen";
import FormEditScreen from "./screens/FormEditScreen";
import FormSummaryScreen from "./screens/FormSummaryScreen";
import FormAnswersScreen from "./screens/FormAnswersScreen";
import PrivateRoute from "./components/PrivateRoute";
import GroupMainScreen from "./screens/group/GroupMainScreen";

function App() {
  document.body.style = "background: #191722";

  return (
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
        <PrivateRoute path="/form/:id/answers">
          <FormAnswersScreen />
        </PrivateRoute>
        <Route path="/login" component={LoginScreen} />
        <Route path="/register" component={RegisterScreen} />
        <Route path="/" component={HomeScreen} exact />
      </Switch>
    </Router>
  );
}

export default App;
