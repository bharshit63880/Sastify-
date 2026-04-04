import React from "react";
import { cn } from "../../utils/cn";

export const Container = ({ className = "", children }) => {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
};
