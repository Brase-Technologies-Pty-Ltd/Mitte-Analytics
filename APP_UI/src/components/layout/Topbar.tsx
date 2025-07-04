import React, { useState } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSignOutAlt, FaCog } from "react-icons/fa";
import Logo from "../../assets/Mittelogo.png";
import sampleUserLogo from "../../assets/user.png";
import UpdatePassword from "../common/forgotPassword/UpdatePassword";
import "./topBar.css";
import MitteModal from "../mitte-Modal/MitteModel";
import MitteButton from "../mitteButton/MitteButton";
import Mlogo from "../../assets/logo_only_text 12px.svg";
import { IMAGES } from "../../variables";

const Topbar: React.FC = () => {

  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const userInfo = localStorage.getItem("user");
  const user = userInfo ? JSON.parse(userInfo) : null;
  const handleCloseModal = () => setShowModal(false);
  const handleOpenModal = () => setShowModal(true);
  const handleLogoutConfirm = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userDetails");
    window.location.href = "/login";
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Navbar expand="lg" className="topbar px-4 py-2 shadow-sm" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="#">
            <img
              src={IMAGES.logo.dashboardLogo}
              alt="Sox Logo"
              height={45}
            />
            <img
              src={Mlogo}
              alt="Sox Logo"
              height={55}
            />

          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="user-dropdown d-flex align-items-center">
                  <div className="ms-2 d-none d-md-block">
                    <h6 className="user-hello">Hello</h6>
                    <h6 className="user-info">{user?.first_name + " " + user?.last_name}</h6>
                  </div>
                  <img src={sampleUserLogo} alt="User" className="rounded-circle" width="40" height="40" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-custom">
                  <Dropdown.Item onClick={handleOpenModal}>
                    <FaCog className="dropdown-icon me-2" /> Update Password
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogoutClick} className="text-danger">
                    <FaSignOutAlt className="dropdown-icon me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>
      <MitteModal
        show={showModal}
        onClose={handleCloseModal}
        headerText="Update Password"
        modalBodyComponent={
          <UpdatePassword
            userId={user?.id}
            handleModalClose={handleCloseModal}
          />
        }
      />
      <MitteModal
        show={showLogoutModal}
        onClose={handleCancelLogout}
        headerText="Confirm to Logout"
        modalBodyComponent={
          <div>
            <p>Are you sure you want to proceed?</p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <MitteButton variant="secondary" onClick={handleLogoutConfirm}>
                Yes
              </MitteButton>
              <MitteButton variant="secondary" onClick={handleCancelLogout}>
                No
              </MitteButton>
            </div>
          </div>
        }
      />


    </>
  );
};

export default Topbar;