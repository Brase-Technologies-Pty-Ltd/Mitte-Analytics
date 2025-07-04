import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../layout/Topbar";
import Sidebar from "./sidebar/SideBar";
import Footer from "./Footer";

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="d-flex flex-column" style={{ height: "100vh" }}>


      <Topbar />

      <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: "100%" }}>


        {/* Sidebar */}
        <Sidebar open={collapsed} handleToggleSidebar={() => setCollapsed(!collapsed)} />


        {/* Main Content */}
        <div
          className="flex-grow-1 d-flex flex-column"
          style={{ overflowY: "auto", transition: "margin-left 0.3s" }}
        >
          <div className="flex-grow-1 py-4 px-3">
            <Outlet />
          </div>

          {/* Footer goes here */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
