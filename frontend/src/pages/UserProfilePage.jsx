import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PageWrapper } from "../components/ui/PageWrapper";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { selectAddresses } from "../features/address/AddressSlice";
import { selectUserInfo } from "../features/user/UserSlice";

export const UserProfilePage = () => {
  const user = useSelector(selectUserInfo);
  const addresses = useSelector(selectAddresses);

  return (
    <PageWrapper className="py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">My account</h1>
        <p className="text-sm text-textSecondary">Keep your profile details and saved delivery addresses ready for faster checkout.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card hover={false}>
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Profile information</p>
              <h2 className="mt-2 text-2xl font-semibold text-textPrimary">{user?.name}</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-textSecondary">Email</p>
                <p className="mt-1 font-medium text-textPrimary">{user?.email}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-textSecondary">Phone</p>
                <p className="mt-1 font-medium text-textPrimary">{user?.phone || "Add a phone number in checkout"}</p>
              </div>
            </div>
            <Button to="/orders" variant="secondary">
              View orders
            </Button>
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Saved addresses</p>
              <h2 className="mt-2 text-2xl font-semibold text-textPrimary">Delivery destinations</h2>
            </div>
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-textPrimary">{address.fullName || user?.name}</p>
                  <p className="mt-2 text-sm text-textSecondary">
                    {address.line1 || address.street}, {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p className="mt-1 text-sm text-textSecondary">{address.phoneNumber}</p>
                </div>
              ))}
              {!addresses.length ? (
                <p className="text-sm text-textSecondary">Add an address during checkout to save it here for future orders.</p>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};
