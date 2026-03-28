import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageWrapper } from "../components/ui/PageWrapper";
import { getAdminUsers, updateAdminUser } from "../features/admin/AdminApi";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    const data = await getAdminUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role, user.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [search, users]);

  const handleUserUpdate = async (id, payload) => {
    await updateAdminUser(id, payload);
    loadUsers();
  };

  return (
    <PageWrapper className="py-0">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">User management</h1>
        <p className="text-sm text-textSecondary">Review marketplace users, manage roles, and control account access.</p>
      </div>

      <Card hover={false}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <Input
              label="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, phone, or role"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-textSecondary">{users.length} total users</span>
            <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-sm text-accent">{users.filter((user) => user.isVerified).length} verified</span>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-sm text-amber-300">{users.filter((user) => user.isBlocked).length} blocked</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead>
              <tr className="text-textSecondary">
                <th className="px-4 py-4 font-medium">Name</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Phone</th>
                <th className="px-4 py-4 font-medium">Verified</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Blocked</th>
                <th className="px-4 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-textPrimary">{user.name}</p>
                      <p className="mt-1 text-xs text-textSecondary">{user.isAdmin ? "Admin access" : "Marketplace user"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-textSecondary">{user.email}</td>
                  <td className="px-4 py-4 text-textSecondary">{user.phone || "Not added"}</td>
                  <td className="px-4 py-4">
                    <span className={user.isVerified ? "rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs text-accent" : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-textSecondary"}>
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      className="input-base min-w-[120px]"
                      value={user.role || (user.isAdmin ? "admin" : "user")}
                      onChange={(event) => handleUserUpdate(user._id, { role: event.target.value, isBlocked: user.isBlocked })}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={Boolean(user.isBlocked)}
                      onChange={(event) => handleUserUpdate(user._id, { isBlocked: event.target.checked, role: user.role })}
                      className="h-4 w-4 accent-primary"
                    />
                  </td>
                  <td className="px-4 py-4 text-textSecondary">{new Date(user.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredUsers.length ? <p className="pt-6 text-center text-sm text-textSecondary">No users matched your search.</p> : null}
      </Card>
    </PageWrapper>
  );
};
