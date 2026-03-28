import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageWrapper } from "../components/ui/PageWrapper";
import {
  getAllOrdersAsync,
  selectOrders,
  updateOrderByIdAsync,
} from "../features/order/OrderSlice";

const orderStatuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  useEffect(() => {
    dispatch(getAllOrdersAsync());
  }, [dispatch]);

  return (
    <PageWrapper className="py-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Order management</h1>
        <p className="text-sm text-textSecondary">Review every order, update fulfillment status, and add tracking notes.</p>
      </div>

      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-textSecondary">
                <th className="px-4 py-4 font-medium">Order</th>
                <th className="px-4 py-4 font-medium">Customer</th>
                <th className="px-4 py-4 font-medium">Total</th>
                <th className="px-4 py-4 font-medium">Payment</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium">Tracking note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-4 text-textPrimary">{order.orderNumber}</td>
                  <td className="px-4 py-4 text-textSecondary">{order.addressSnapshot?.fullName || "Customer"}</td>
                  <td className="px-4 py-4 text-textPrimary">Rs. {order.pricing?.total}</td>
                  <td className="px-4 py-4 text-textSecondary">{order.paymentStatus}</td>
                  <td className="px-4 py-4">
                    <select
                      className="input-base min-w-[180px]"
                      value={order.orderStatus}
                      onChange={(event) =>
                        dispatch(
                          updateOrderByIdAsync({
                            _id: order._id,
                            orderStatus: event.target.value,
                            trackingTitle: event.target.value.replace(/_/g, " "),
                          })
                        )
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <Input
                      placeholder="Add tracking note"
                      onBlur={(event) => {
                        if (event.target.value.trim()) {
                          dispatch(
                            updateOrderByIdAsync({
                              _id: order._id,
                              orderStatus: order.orderStatus,
                              trackingTitle: order.orderStatus.replace(/_/g, " "),
                              trackingDescription: event.target.value,
                            })
                          );
                        }
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageWrapper>
  );
};
