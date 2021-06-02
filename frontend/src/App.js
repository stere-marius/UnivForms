import "./wdyr";
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import FormViewScreen from "./screens/FormViewScreen";
import FormMainScreen from "./screens/FormMainScreen";
import FormEditScreen from "./screens/FormEditScreen";
import FormSummaryScreen from "./screens/FormSummaryScreen";
import FormAnswersScreen from "./screens/FormAnswersScreen";

function App() {
  document.body.style = "background: #191722";

  return (
    <Router>
      <Route path="/login" component={LoginScreen} />
      <Route path="/register" component={RegisterScreen} />
      <Route path="/form/:id" exact component={FormMainScreen} />
      <Route path="/form/:id/edit" component={FormEditScreen} />
      <Route path="/form/:id/view" component={FormViewScreen} />
      <Route path="/form/:id/summary" component={FormSummaryScreen} />
      <Route path="/form/:id/answers" component={FormAnswersScreen} />
      <Route path="/" component={HomeScreen} exact />
    </Router>
  );
}

export default App;