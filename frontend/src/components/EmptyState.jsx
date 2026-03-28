import React from "react";
import { FiArrowRight, FiInbox } from "react-icons/fi";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

export const EmptyState = ({ title, description, actionLabel, actionTo }) => {
  return (
    <Card hover={false} className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
        <FiInbox className="text-2xl" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-textPrimary">{title}</h3>
        <p className="mx-auto max-w-lg text-base text-textSecondary">{description}</p>
      </div>
      {actionLabel && actionTo ? (
        <Button to={actionTo} icon={<FiArrowRight />}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
};
