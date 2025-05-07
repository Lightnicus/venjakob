"use client";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

const ShowNavigation = () => {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Navigation />;
};

export default ShowNavigation; 