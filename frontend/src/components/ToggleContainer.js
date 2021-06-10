import React, { useState } from "react";
import { Collapse } from "react-bootstrap";

const ToggleContainer = ({
  title,
  classes,
  toggleActive,
  children,
  containerID,
}) => {
  const [isActive, setActive] = useState(false);

  const handleToggleContainer = () => {
    toggleActive(!isActive);
    setActive(!isActive);
  };

  return (
    <div className={` ${classes ? [...classes].join(" ") : ""}`}>
      <div className="d-flex">
        <p
          className="toggle-container-text cursor-pointer py-2"
          aria-expanded={`${isActive}`}
          aria-controls={containerID}
          onClick={handleToggleContainer}
        >
          <i
            className={`fas fa-arrow-right ${isActive ? "open" : ""}`}
            style={{ marginRight: "0.5rem" }}
          />
          {title}
        </p>
      </div>

      <Collapse in={isActive}>
        <div id={containerID}>{children}</div>
      </Collapse>
    </div>
  );
};

export default ToggleContainer;
