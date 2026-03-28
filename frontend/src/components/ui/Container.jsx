import React from "react";
import { cn } from "../../utils/cn";

export const Container = ({ className = "", children }) => {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20", className)}>{children}</div>;
};
