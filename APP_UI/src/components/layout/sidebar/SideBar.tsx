import {
  Sidebar,
  Menu,
  MenuItem,
  sidebarClasses,
  menuClasses,
} from "react-pro-sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import SmartConfirmAlert from "../../confirmAlert/SmartConfirmAlert";
import isAdmin from "../../../services/adminService";
// import "react-pro-sidebar/dist/styles.css";
import "./SideBarStyles.css";

// Icons
import dashboardicon from "../../../assets/sidebar-icons/dashboard.svg";
import usersicon from "../../../assets/sidebar-icons/usersgroup.svg";
import imprestproducticon from "../../../assets/sidebar-icons/imprestproduct.svg";
import roleicon from "../../../assets/sidebar-icons/role.svg";
import impresticon from "../../../assets/sidebar-icons/imprest.svg";
import producticon from "../../../assets/sidebar-icons/product.svg";
import assignedroleicon from "../../../assets/sidebar-icons/assignedrole.svg";
import logout from "../../../assets/sidebar-icons/logout.svg";
import hoveredDashboard from "../../../assets/sidebar-icons/colored-icons/G-dashboard.svg";
import hoveredUser from "../../../assets/sidebar-icons/colored-icons/G-users.svg";
import hoveredRole from "../../../assets/sidebar-icons/colored-icons/G-role.svg";
import hoveredImprestProduct from "../../../assets/sidebar-icons/colored-icons/G-imprestproduct.svg";
import hoveredProduct from "../../../assets/sidebar-icons/colored-icons/G-product.svg";
import hoveredImprest from "../../../assets/sidebar-icons/colored-icons/G-imprest.svg";
import hoveredLogout from "../../../assets/sidebar-icons/colored-icons/G-logout.svg";
import hoveredAssignedRole from "../../../assets/sidebar-icons/colored-icons/G-assignedrole.svg";
import camragreen from "../../../assets/addCam2.svg";
import camraWhite from "../../../assets/addCam1.svg";

interface SidebarProps {
  open: boolean;
  handleToggleSidebar: () => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ open, handleToggleSidebar }) => {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menuItems = isAdmin()
    ? [
      { path: "/dashboard", name: "Dashboard", icon: dashboardicon, iconHover: hoveredDashboard },
      { path: "/camera", name: "Cameras", icon: camraWhite, iconHover: camragreen },
      { path: "/users", name: "Users", icon: usersicon, iconHover: hoveredUser },
      { path: "/imprestlist", name: "Imprest", icon: impresticon, iconHover: hoveredImprest },
      { path: "/rolelist", name: "Roles", icon: roleicon, iconHover: hoveredRole },
      { path: "/productlist", name: "Products", icon: producticon, iconHover: hoveredProduct },
      { path: "/userrole", name: "Assigned Roles", icon: assignedroleicon, iconHover: hoveredAssignedRole },
      { path: "/imprestproductlist", name: "Imprest Products", icon: imprestproducticon, iconHover: hoveredImprestProduct },
    ]
    : [
      { path: "/dashboard", name: "Dashboard", icon: dashboardicon, iconHover: hoveredDashboard },
      { path: "/imprestlist", name: "Imprest", icon: impresticon, iconHover: hoveredImprest },
      { path: "/productlist", name: "Products", icon: producticon, iconHover: hoveredProduct },
      { path: "/imprestproductlist", name: "Imprest Products", icon: imprestproducticon, iconHover: hoveredImprestProduct },
    ];

  return (
    <>
      <Sidebar
        collapsed={!open}
        backgroundColor="#198754"
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            display: "flex",
            flexDirection: "column",
            height: "100%"
          },
        }}
      >
        <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-2">
          {open ? <h4 className="text-white mb-0">Titrate</h4> : null}
          <button
            className="btn btn-sm text-white ms-2"
            onClick={handleToggleSidebar}
            style={{
              width: "30px",
              height: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 0,
            }}
            title={open ? "Collapse" : "Expand"}
          >
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {open ? "☰" : "☰"}
            </span>
          </button>
        </div>



        {/* <div > */}
        <div className="d-flex " style={{ justifyContent: "space-between", flexDirection: "column", height: "100%" }}>
          <Menu
            rootStyles={{
              [`.${menuClasses.button}`]: {
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                margin: "4px 8px",
                gap: "12px",
                transition: "all 0.3s ease",
              },
              [`.${menuClasses.button}:hover`]: {
                backgroundColor: "white",
                color: "#198754",
              },
            }}
          >
            {/* <MenuItem onClick={handleToggleSidebar}>
                {
                  open ? (<div className="d-flex justify-content-between align-items-center">
                    <span>Titrate</span>
                    <span className="">x</span>
                  </div>
                  ) : (<span>☰</span>)
                }
              </MenuItem> */}

            {menuItems.map((item: any) => {
              const isActive = pathname === item.path;
              const isHovered = hoveredPath === item.path;

              return (
                <MenuItem
                  key={item.path}
                  active={isActive}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHoveredPath(item.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  icon={
                    <img
                      src={isActive || isHovered ? item.iconHover : item.icon}
                      alt={item.name}
                      className="sidebar-icon"
                    />
                  }
                  style={{
                    color: isActive ? "#0f8945" : "",
                  }}
                  className={isActive ? "menu-item-active" : ""}
                >
                  {item.name}
                </MenuItem>
              );
            })}
          </Menu>

          {/* Footer with Logout */}
          {/* <div className="sidebar-footer"> */}
          <Menu
            rootStyles={{
              [`.${menuClasses.button}`]: {
                color: "white",
                padding: "10px 16px",
                borderRadius: "8px",
                margin: "8px",
                gap: "12px",
              },
              [`.${menuClasses.button}:hover`]: {
                backgroundColor: "white",
                color: "#198754",
              },
            }}

            style={{
              borderTop: "1px solid #fff"
            }}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
          >
            <MenuItem
              onClick={() => setOpenLogoutModal(true)}

              icon={<img
                src={isLogoutHovered ? hoveredLogout : logout}
                alt="logout"
                className="sidebar-icon"

              />}
            >
              Logout
            </MenuItem>
          </Menu>
          {/* </div> */}
        </div>
        {/* </div> */}
      </Sidebar >

      {openLogoutModal && (
        <SmartConfirmAlert
          show={openLogoutModal}
          title="Confirm Logout"
          message="Are you sure you want to proceed?"
          confirmText="Yes"
          cancelText="No"
          isShowDeleteIcon={false}
          onConfirm={handleLogout}
          onCancel={() => setOpenLogoutModal(false)}
        />
      )
      }
    </>
  );
};

export default AppSidebar;
