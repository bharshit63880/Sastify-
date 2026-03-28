import React from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageWrapper } from "../components/ui/PageWrapper";

export const OrderSuccessPage = () => {
  const { id } = useParams();

  return (
    <PageWrapper className="flex min-h-[70vh] items-center justify-center py-8">
      <Card hover={false} className="w-full max-w-2xl text-center">
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
            <FiCheckCircle className="text-3xl" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Order placed successfully</h1>
            <p className="text-sm text-textSecondary">Your order has been created and payment status has been saved securely.</p>
            <p className="text-sm text-textSecondary">Reference: {id}</p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button to={`/orders/${id}`} icon={<FiArrowRight />}>
              View tracking
            </Button>
            <Button to="/products" variant="secondary">
              Continue shopping
            </Button>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
};
