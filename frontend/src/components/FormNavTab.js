import React from "react";

const FormNavTab = ({ children, isSelected }) => {
  return <>{isSelected && <>{children}</>}</>;
};

export default FormNavTab;
