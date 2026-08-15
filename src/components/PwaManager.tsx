"use client";

import React from "react";
import { PwaInstallBanner } from "./PwaInstallBanner";
import { IosInstallModal } from "./IosInstallModal";
import { OfflineStatusToast } from "./OfflineStatusToast";

export const PwaManager: React.FC = () => {
  return (
    <>
      <OfflineStatusToast />
      <PwaInstallBanner />
      <IosInstallModal />
    </>
  );
};
