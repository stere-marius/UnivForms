import React, { useState } from "react";
import FormNavTab from "./FormNavTab";

const FormNav = () => {
  const tabs = ["Intrebare curenta", "Intrebari anterioare", "Statistici"];
  const [selected, setSelected] = useState("Home");

  const renderTabs = () =>
    tabs.map(tab => {
      const isSelectedTab = selected === tab;
      const fontBold = isSelectedTab && "fw-bold";
      const textColor = selected === tab ? "#000" : "rgba(0, 0, 0, 0.7)";

      return (
        <li
          className="nav-item pt-4 px-4 pb-2"
          key={tab}
          style={{ cursor: "pointer" }}
        >
          <p
            className={"nav-item text-decoration-none " + fontBold}
            style={{ color: textColor, cursor: "pointer" }}
            onClick={() => setSelected(tab)}
          >
            {tab}
          </p>
        </li>
      );
    });

  return (
    <div>
      <ul className="nav nav-tabs">
        {renderTabs()}
        <li className="nav-item px-4 pt-4 pb-2 " style={{ marginLeft: "auto" }}>
          <p className="text-dark fw-bold">10:00</p>
        </li>
      </ul>

      <FormNavTab isSelected={selected === "Intrebare curenta"}>
        <p>Some test text</p>
      </FormNavTab>

      <FormNavTab isSelected={selected === "Intrebari anterioare"}>
        <h1>More test text</h1>
      </FormNavTab>

      <FormNavTab isSelected={selected === "Statistici"}>
        <ul>
          <li>List test 1</li>
          <li>List test 2</li>
          <li>List test 3</li>
        </ul>
      </FormNavTab>
    </div>
  );
};

export default FormNav;
