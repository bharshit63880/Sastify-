import React, { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { Card } from "../../../components/ui/Card";
import { formatPrice } from "../../../utils/currencyFormatter";
import { getOrderByUserIdAsync, selectOrderFetchStatus, selectOrders } from "../OrderSlice";

export const UserOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrderFetchStatus);

  useEffect(() => {
    dispatch(getOrderByUserIdAsync());
  }, [dispatch]);

  if (status === "pending") {
    return <LoadingState cards={3} />;
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your placed orders and delivery tracking will appear here."
        actionLabel="Start shopping"
        actionTo="/products"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} hover={false}>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-textPrimary">Order {order.orderNumber}</h3>
                <p className="text-sm text-textSecondary">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
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

            <div className="space-y-3 border-y border-white/10 py-4">
              {order.items.slice(0, 2).map((item) => (
                <div key={item.product} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-textSecondary">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-textPrimary">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-semibold text-textPrimary">Total paid: {formatPrice(order.pricing.total)}</p>
              <Link
                to={`/orders/${order._id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-textPrimary"
              >
                View details & tracking
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
