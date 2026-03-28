import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export const TrackingTimeline = ({ items = [] }) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.status}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <FiCheckCircle />
            </div>
            {index < items.length - 1 ? <div className="mt-2 h-full min-h-14 w-px bg-white/10" /> : null}
          </div>
          <div className="pb-3">
            <p className="text-sm font-semibold text-textPrimary">{item.title}</p>
            <p className="mt-1 text-sm text-textSecondary">{item.description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-textSecondary/80">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
