import React from "react";
import { PageWrapper } from "../components/ui/PageWrapper";
import { UserOrders } from "../features/order/components/UserOrders";

export const UserOrdersPage = () => {
  return (
    <PageWrapper className="py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">My orders</h1>
        <p className="text-sm text-textSecondary">Track every order, payment state, and delivery milestone from one history view.</p>
      </div>
      <UserOrders />
    </PageWrapper>
  );
};
