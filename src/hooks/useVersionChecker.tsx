import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useVersionChecker(currentVersion: string, interval = 1000 * 1) {
  const [latestVersion, setLatestVersion] = useState(currentVersion);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/cron/sync/version");
        const data = await res.json();
        if (data.version && data.version !== currentVersion) {
          toast.info("New version available! Please refresh the page.");
          setLatestVersion(data.version);
        }
      } catch (err) {
        console.error("Version check failed", err);
      }
    };

    checkVersion();
    const timer = setInterval(checkVersion, interval);
    return () => clearInterval(timer);
  }, [currentVersion, interval]);

  return latestVersion;
}
