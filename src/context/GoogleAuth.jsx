import React, { createContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "../constants";

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

export function GoogleAuth() {
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

  useEffect(() => {
    const onWindowFocus = () => !getUserData() && setUserInfo(null);
    window.addEventListener("focus", onWindowFocus);
    return () => window.removeEventListener("focus", onWindowFocus);
  }, []);

  return (
    <GoogleAuthContext.Provider value={{ userInfo, googleAuthLogout }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {!userInfo || userInfo?.exp * 1000 < Date.now() ? (
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
