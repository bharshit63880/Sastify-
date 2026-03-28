import React from "react";

export const LoadingState = ({ cards = 8 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="animate-pulse space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="h-56 rounded-2xl bg-white/10" />
          <div className="h-6 w-2/3 rounded-full bg-white/10" />
          <div className="h-4 w-1/2 rounded-full bg-white/10" />
          <div className="h-5 w-1/3 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
};
