import React from "react";

const Button = ({ backgroundColor, borderRadius, text }) => {
  return (
    <button
      style={{
        backgroundColor: { backgroundColor },
        borderRadius: { borderRadius },
      }}
    >
      {text}
    </button>
  );
};

export default Button;
