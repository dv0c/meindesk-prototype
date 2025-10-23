"use client";
import { useRouter } from "next/navigation";
import { FC, useEffect } from "react";

interface RouterRefreshProps {
  children: React.ReactNode;
}

const RouterRefresh: FC<RouterRefreshProps> = ({ children }) => {
  //   WORKAROUND: This is a workaround to refresh the router when the page is loaded
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, []);
  return children;
};

export default RouterRefresh;
