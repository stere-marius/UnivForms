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
      <div className="d-flex  py-2">
        <p
          className="cursor-pointer"
          onClick={handleToggleContainer}
          aria-expanded={`${isActive}`}
          aria-controls={containerID}
        >
          <i
            className={`fas fa-caret-right ${isActive ? "open" : ""}`}
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
