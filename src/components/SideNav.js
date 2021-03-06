import React from "react";
import { Nav, Image } from "react-bootstrap";
import "./style.css";
import { ArrowRightIcon } from "@heroicons/react/solid";
import { NavLink } from "react-router-dom";
import Logo from "../assets/launchpad_logo.svg";

function SideNav() {
  return (
    <>
      <Nav className="flex-column sideBar">
        <NavLink className="logo" to="/">
          <Image src={Logo} style={{ width: "220px" }}></Image>
        </NavLink>
        <NavLink className="navPill unselectable" to="/">
          collections
          <ArrowRightIcon className="pillArrow"></ArrowRightIcon>
        </NavLink>
        <NavLink className="navPill unselectable" to="/files">
          files
          <ArrowRightIcon className="pillArrow"></ArrowRightIcon>
        </NavLink>
        <NavLink className="navPill unselectable" to="/launch">
          launch
          <ArrowRightIcon className="pillArrow"></ArrowRightIcon>
        </NavLink>
      </Nav>
    </>
  );
}
export default SideNav;
