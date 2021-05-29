import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = ({ title }) => {
  return (
    <Spinner
      animation="border"
      role="status"
      style={{
        width: "100px",
        height: "100px",
        margin: "auto",
        display: "block",
      }}
    >
      <span className="sr-only">{title && "Procesăm datele..."}</span>
    </Spinner>
  );
};

export default Loader;
