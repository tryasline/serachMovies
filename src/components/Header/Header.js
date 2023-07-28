import React from "react";
import { Tabs } from "antd";

import "./Header.css";
import PropTypes from "prop-types";

function Header({ changeTab }) {
  const { TabPane } = Tabs;

  return (
    <div className="header">
      <Tabs defaultActiveKey="1" onChange={changeTab}>
        <TabPane tab="Search" key="1" />
        <TabPane tab="Rated" key="2" />
      </Tabs>
    </div>
  );
}
Header.defaultProps = {
  changeTab: () => {},
};

Header.propTypes = {
  changeTab: PropTypes.func,
};
export default Header;
