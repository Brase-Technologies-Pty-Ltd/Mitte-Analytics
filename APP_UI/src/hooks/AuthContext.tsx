import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import SmartConfirmAlert from '../components/confirmAlert/SmartConfirmAlert';

interface AuthData {
  time: string;
  userdata: any | undefined;
  roles: any[] | undefined;
  iat: number | undefined;
  exp: number | undefined;
  token: string;
}

interface AuthContextProps {
  authData: AuthData | null;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData | null>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | null>(() => {
    const exp = localStorage.getItem("expireTime");
    const iat = localStorage.getItem("loggedInTime");
    const roles = localStorage.getItem("roles");

    return {
      time: new Date().toString(),
      userdata: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : undefined,
      roles: roles ? JSON.parse(roles) : undefined,
      iat: iat ? Number(iat) : undefined,
      exp: exp ? Number(exp) : undefined,
      token: localStorage.getItem("token") || "",
    };
  });
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (authData?.exp && Date.now() >= authData.exp * 1000) {
        setShowAlert(true);
        setAuthData(null);
        localStorage.clear();
      }
    }, 1000 * 10);

    return () => clearInterval(interval);
  }, [authData]);

  const handleConfirmLogout = () => {
    setAuthData(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
      {showAlert && (
        <SmartConfirmAlert
          show={true}
          title="Session Expired"
          message="Your session has expired. Please log in again."
          confirmText='Log in again'
          onConfirm={handleConfirmLogout}
        />
      )}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
