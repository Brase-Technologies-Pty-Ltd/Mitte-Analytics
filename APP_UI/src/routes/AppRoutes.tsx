import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/layout/Layout";
import NotFound from "../pages/notFound/NotFound";
import LoginPage from "../pages/login/LoginPage";
import Dashboard from "../pages/dashboard/Dashboard";
import ListUsers from "../pages/users/ListUsers";
import ListImprest from "../pages/imprest/ListImprest";
import ListCamera from "../pages/cameras/ListCameras";
import ImprestProductList from "../pages/imprestProduct/ImprestProductList";
import ProductList from "../pages/product/ProductList";
import BarCodeContainer from "../components/barCodeGenerater/BarCodeContainer";
import ListRole from "../pages/roles/ListRole";
import UserRoles from "../pages/userRoles/ListUserRole";


// Lazy-loaded pages

const privateRoutes = [
  { path: "/dashboard", element: <Dashboard />, allowedRoles: [] },
  { path: "/users", element: <ListUsers />, allowedRoles: [] },
  { path: "/imprestlist", element: <ListImprest />, allowedRoles: [] },
  { path: "/camera", element: <ListCamera />, allowedRoles: [] },
  { path: "/imprestproductlist", element: <ImprestProductList />, allowedRoles: [] },
  { path: "/productlist", element: <ProductList />, allowedRoles: [] },
  { path: "/rolelist", element: <ListRole />, allowedRoles: [] },
  { path: "/userrole", element: <UserRoles />, allowedRoles: [] },
];

const PrivateRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("token");
  const userRoles = JSON.parse(localStorage.getItem("roles") || "{}");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If no specific roles are required, allow access to all authenticated users
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Super-admin and admin have full access
  if (userRoles?.some((role: any) => role?.name.includes("super-admin")) || userRoles.some((role: any) => role?.name.includes("admin"))) {
    return <Outlet />;
  }

  // Check if user has the required role
  if (!userRoles.some((role: any) => allowedRoles.includes(role))) {
    toast.error("You are not authorized to access this page.");
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/qrCodes" element={<BarCodeContainer />} />


      {/* Private Routes Wrapped in Layout */}
      <Route element={<PrivateRoute />}>a
        <Route path="/" element={<Layout />}>
          {privateRoutes?.map(({ path, element, allowedRoles }) => (
            <Route key={path} path={path} element={<PrivateRoute allowedRoles={allowedRoles} />} >
              <Route index element={element} />
            </Route>
          ))}
        </Route>
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
