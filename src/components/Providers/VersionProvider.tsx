'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

interface VersionContextType {
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
}

const VersionContext = createContext<VersionContextType>({
  currentVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  latestVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  isOutdated: false,
});

export const VersionProvider = ({ children, checkInterval = 10000 }: { children: ReactNode, checkInterval?: number }) => {
  const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";
  const [latestVersion, setLatestVersion] = useState(currentVersion);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/cron/sync/version");
        const data = await res.json();
        if (data.version && data.version !== currentVersion) {
          setLatestVersion(data.version);
          toast.info("New version available! Refresh to update.");
        }
      } catch (err) {
        console.error("Version check failed", err);
      }
    };

    checkVersion();
    const timer = setInterval(checkVersion, checkInterval);
    return () => clearInterval(timer);
  }, [currentVersion, checkInterval]);

  return (
    <VersionContext.Provider value={{ currentVersion, latestVersion, isOutdated: latestVersion !== currentVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

// Custom hook for easier consumption
export const useVersion = () => useContext(VersionContext);
