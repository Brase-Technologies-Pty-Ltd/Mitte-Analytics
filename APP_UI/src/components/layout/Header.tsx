import React from "react";
import { Navbar, Container, Nav, Dropdown, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../assets/images/CK_Logo_Square.avif";
import sampleUserLogo from "../../assets/images/user.png";
import "./header.css";
import { IMAGES } from "../../variables";

const Header: React.FC = () => {

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };
  

  return (
    <Navbar expand="lg" className="header px-3">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/dashboard">
          <img src={IMAGES.logo.dashboardLogo} alt="Brand Logo" height="50" />
        </Navbar.Brand>

        {/* User Dropdown */}
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle as="div" className="user-dropdown">
              <Image src={sampleUserLogo} alt="User" roundedCircle width={40} height={40} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-custom">
              <Dropdown.Item as={Link} to="/profile">
                <FaUser className="dropdown-icon" /> Profile
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/settings">
                <FaCog className="dropdown-icon" /> Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <FaSignOutAlt className="dropdown-icon" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
