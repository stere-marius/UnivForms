import React from "react";
import { Helmet } from "react-helmet";

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keyword" content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: "Univ Forms",
  keyword: "formulare, chestionare, formulare dinamice",
  description: "Creeaza un formular sau chestionar cu usurinta",
};

export default Meta;
