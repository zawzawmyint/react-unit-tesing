import React from "react";

const Greeting = ({ name }) => {
  return <div>{name ? name : "Greeting"}</div>;
};

export default Greeting;
