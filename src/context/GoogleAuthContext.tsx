"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { GoogleUserSession } from "@/types";

interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  exp?: number;
}

interface GoogleAuthContextType {
  session: GoogleUserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  customClientId: string;
  setCustomClientId: (clientId: string) => void;
  loginWithCredential: (credential: string) => void;
  loginWithCustomEmail: (email: string, name?: string) => void;
  loginWithDemoAccount: (userId: string, email: string, name: string, picture?: string) => void;
  logout: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  customClientId: "",
  setCustomClientId: () => {},
  loginWithCredential: () => {},
  loginWithCustomEmail: () => {},
  loginWithDemoAccount: () => {},
  logout: () => {},
});

const DEFAULT_DEMO_USER: GoogleUserSession = {
  User_ID: "google-sub-1029384756",
  Email: "user@khafai.app",
  Name: "Khafai User 1",
  Picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
  isDemo: true,
};

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<GoogleUserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customClientId, setCustomClientIdState] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("khafai_google_session");
      const storedClientId = localStorage.getItem("khafai_google_client_id");

      if (storedClientId) {
        setCustomClientIdState(storedClientId);
      }

      if (stored) {
        const parsed: GoogleUserSession = JSON.parse(stored);
        setSession(parsed);
      } else {
        setSession(DEFAULT_DEMO_USER);
      }
    } catch {
      setSession(DEFAULT_DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCustomClientId = (id: string) => {
    setCustomClientIdState(id);
    if (id) {
      localStorage.setItem("khafai_google_client_id", id);
    } else {
      localStorage.removeItem("khafai_google_client_id");
    }
  };

  const saveSession = (newSession: GoogleUserSession | null) => {
    setSession(newSession);
    if (newSession) {
      localStorage.setItem("khafai_google_session", JSON.stringify(newSession));
    } else {
      localStorage.removeItem("khafai_google_session");
    }
  };

  const loginWithCredential = (credential: string) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credential);
      const newSession: GoogleUserSession = {
        User_ID: decoded.sub,
        Email: decoded.email,
        Name: decoded.name || decoded.email.split("@")[0],
        Picture: decoded.picture,
        idToken: credential,
        isDemo: false,
      };
      saveSession(newSession);
    } catch (err) {
      console.error("Failed to decode Google ID token", err);
    }
  };

  const loginWithCustomEmail = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Generate deterministic Google Sub ID from email address
    const subHash = cleanEmail
      .split("")
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 10000000000, 1000000000);
    const userId = `google-sub-${subHash}`;

    const displayName = name || cleanEmail.split("@")[0];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff`;

    const newSession: GoogleUserSession = {
      User_ID: userId,
      Email: cleanEmail,
      Name: displayName,
      Picture: avatarUrl,
      isDemo: false,
    };
    saveSession(newSession);
  };

  const loginWithDemoAccount = (userId: string, email: string, name: string, picture?: string) => {
    const demoSession: GoogleUserSession = {
      User_ID: userId,
      Email: email,
      Name: name,
      Picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`,
      isDemo: true,
    };
    saveSession(demoSession);
  };

  const logout = () => {
    saveSession(null);
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        customClientId,
        setCustomClientId,
        loginWithCredential,
        loginWithCustomEmail,
        loginWithDemoAccount,
        logout,
      }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);
