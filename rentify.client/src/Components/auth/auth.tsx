import React, { createContext, useState, useContext, ReactNode } from "react";
import Services from "./uservice";
interface AuthContextType {
  user: string | null;
  logOut: () => void;
  logIn: (username: string, password: string) => Promise<boolean>;
  getRoles: () => string;
  userInfo: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  const services = new Services();
  const [user, setUser] = useState<null | string>(authToken || null);
  const [role, setRole] = useState<"" | string>("");
  const [userInfo, setUserInfo] = useState<null | any>(null);
  const logOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("permissionClass");
    window.location.reload();
  };

  const logIn = async (username: string, password: string) => {
    let data = await fetch("/login/", {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    })
      .then((rsp) => rsp.json())
      .then((response) => {
        return response;
      });
    if (data.accessToken !== undefined) {
      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      fetch("/api/getRls", {
        method: "get",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.accessToken}`,
        },
      })
        .then((rsp) => rsp.json())
        .then((response) => {
          const { statusCode, value } = response;
          if (statusCode === 200) {
            setRole(value[0]);
            localStorage.setItem("permissionClass", value[0]);
          }
        });
      setUser(localStorage.getItem("authToken"));
      return true;
    }
    setUser(null);
    return false;
  };
  const getRoles = () => role;
  const getUserInfo = async () => {
    const res = await services.getUser();
    const { statusCode, value } = res;
    if (statusCode === 200) {
      setUserInfo(value);
    }
  }
  React.useEffect(() => {
    getUserInfo();
  }, []);
  const methods: AuthContextType = {
    user,
    logOut,
    logIn,
    getRoles,
    userInfo
  };

  return (
    <AuthContext.Provider value={methods}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
