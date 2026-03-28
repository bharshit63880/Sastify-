import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { TrackingTimeline } from "../components/TrackingTimeline";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageWrapper } from "../components/ui/PageWrapper";
import { formatPrice } from "../utils/currencyFormatter";
import {
  cancelOrderByIdAsync,
  getOrderByIdAsync,
  selectOrderDetails,
  selectOrderFetchStatus,
} from "../features/order/OrderSlice";

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const order = useSelector(selectOrderDetails);
  const status = useSelector(selectOrderFetchStatus);

  useEffect(() => {
    dispatch(getOrderByIdAsync(id));
  }, [dispatch, id]);

  if (status === "pending" || !order) {
    return <LoadingState cards={1} />;
  }

  return (
    <PageWrapper className="py-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Order {order.orderNumber}</h1>
          <p className="text-sm text-textSecondary">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-textPrimary">
            {order.orderStatus.replace(/_/g, " ")}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-textSecondary">
            {order.paymentStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card hover={false}>
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-textPrimary">Items in this order</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.product} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{item.name}</p>
                    <p className="mt-1 text-sm text-textSecondary">
                      {item.brandName} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-textPrimary">{formatPrice(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-textPrimary">Tracking timeline</h2>
            <TrackingTimeline items={order.trackingHistory || []} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover={false}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-textPrimary">Delivery address</h2>
            <div className="space-y-2 text-sm text-textSecondary">
              <p className="font-semibold text-textPrimary">{order.addressSnapshot.fullName}</p>
              <p>{order.addressSnapshot.line1}</p>
              {order.addressSnapshot.line2 ? <p>{order.addressSnapshot.line2}</p> : null}
              <p>
                {order.addressSnapshot.city}, {order.addressSnapshot.state} - {order.addressSnapshot.postalCode}
              </p>
              <p>{order.addressSnapshot.country}</p>
              <p>{order.addressSnapshot.phoneNumber}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-textPrimary">Payment summary</h2>
            <div className="space-y-3 border-y border-white/10 py-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Subtotal</span>
                <span className="text-textPrimary">{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Shipping</span>
                <span className="text-textPrimary">{formatPrice(order.pricing.shipping || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-textSecondary">Tax</span>
                <span className="text-textPrimary">{formatPrice(order.pricing.tax || 0)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-textPrimary">Total</span>
              <span className="text-xl font-semibold text-textPrimary">{formatPrice(order.pricing.total)}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button to="/orders" variant="secondary">
                Back to orders
              </Button>
              {["pending", "confirmed", "packed"].includes(order.orderStatus) ? (
                <Button
                  variant="ghost"
                  onClick={() => dispatch(cancelOrderByIdAsync({ id: order._id, reason: "Cancelled by customer" }))}
                >
                  Cancel order
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};
