import React, { createContext, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
export const GoogleAuthContext = createContext();

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const getUserData = () => {
  const userData = JSON.parse(sessionStorage.getItem("googleUserInfo"));
  if (!userData) return null;
  if (Date.now() > userData.exp * 1000) {
    sessionStorage.removeItem("googleToken");
    sessionStorage.removeItem("googleUserInfo");
    return null;
  }

  return userData;
};

export function GoogleAuth({ children }) {
  const sessionData = JSON.parse(sessionStorage.getItem("googleUserInfo"));
  //   const tokenExpired = Date.now() > sessionData.exp * 1000;
  const [userInfo, setUserInfo] = useState(getUserData());

  const handleSuccess = (resp) => {
    const userData = parseJwt(resp.credential);
    sessionStorage.setItem("googleToken", resp.credential);
    sessionStorage.setItem("googleUserInfo", JSON.stringify(userData));
    setUserInfo(userData);
  };

  const handleFailure = (err) => {
    console.log("Google sign in error: ", err);
  };

  const googleAuthLogout = () => {
    googleLogout();
    sessionStorage.setItem("googleToken", null);
    sessionStorage.setItem("googleUserInfo", null);
    setUserInfo(null);
  };

  const contextValue = { userInfo, googleAuthLogout };

  return (
    <GoogleAuthContext.Provider value={contextValue}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {!userInfo || userInfo?.exp * 1000 > Date.now() ? (
          <div className="row g-0 mt-5 mb-3 justify-content-center">
            <div className="col-auto">
              <GoogleLogin
                onSuccess={handleSuccess}
                onFailure={handleFailure}
                size="large"
                shape="pill"
                theme="filled_black"
              />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
}