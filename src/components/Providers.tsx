"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider, useGoogleAuth } from "@/context/GoogleAuthContext";

function GoogleOAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const { customClientId } = useGoogleAuth();
  const googleClientId =
    customClientId ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "185343067017-lnui2nbdub6tl503cuu4opntei97332k.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      <GoogleOAuthProviderWrapper>
        {children}
      </GoogleOAuthProviderWrapper>
    </GoogleAuthProvider>
  );
}
