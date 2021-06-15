import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

const NotFound = () => (
  <div className="container">
    <Header />
    <div
      className="p-5 my-5"
      style={{
        borderRadius: "22px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
        backgroundColor: "#EFEFEF",
      }}
    >
      <div className="d-flex flex-column align-items-center">
        <h1>404 - Aceasta pagină nu există!</h1>
        <Link to="/">Întoarce-te pe pagina de home</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
