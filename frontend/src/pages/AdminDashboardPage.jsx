import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { PageWrapper } from "../components/ui/PageWrapper";
import { selectBrands } from "../features/brands/BrandSlice";
import { selectCategories } from "../features/categories/CategoriesSlice";
import {
  createBrand,
  createCategory,
  createCoupon,
  getAdminOverview,
  getAdminUsers,
  getCoupons,
  updateAdminUser,
  updateCoupon,
} from "../features/admin/AdminApi";
import { fetchProducts } from "../features/products/ProductApi";

export const AdminDashboardPage = () => {
  const categories = useSelector(selectCategories);
  const brands = useSelector(selectBrands);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [coupon, setCoupon] = useState({
    code: "",
    title: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 0,
  });

  const loadDashboard = () => {
    Promise.all([
      getAdminOverview(),
      fetchProducts({ admin: true, pagination: { page: 1, limit: 8 } }),
      getAdminUsers(),
      getCoupons(),
    ]).then(([overviewData, productData, usersData, couponsData]) => {
      setOverview(overviewData);
      setProducts(productData.data);
      setUsers(usersData);
      setCoupons(couponsData);
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summaryCards = overview
    ? [
        { label: "Total sales", value: `Rs. ${overview.totalSales}` },
        { label: "Total orders", value: overview.totalOrders },
        { label: "Total users", value: overview.totalUsers },
        { label: "Total products", value: overview.totalProducts },
      ]
    : [];

  return (
    <PageWrapper className="py-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Admin dashboard</h1>
          <p className="text-sm text-textSecondary">Marketplace operations overview, catalog control, users, and offers.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/admin/products/new">Add product</Button>
          <Button to="/admin/orders" variant="secondary">Manage orders</Button>
          <Button to="/admin/users" variant="secondary">Manage users</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-textSecondary">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-textPrimary">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card hover={false}>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-textPrimary">Recent products</h2>
              <Button to="/admin/products/new" variant="ghost">Create</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead>
                  <tr className="text-textSecondary">
                    <th className="px-4 py-4 font-medium">Product</th>
                    <th className="px-4 py-4 font-medium">Price</th>
                    <th className="px-4 py-4 font-medium">Stock</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-4 text-textPrimary">{product.name || product.title}</td>
                      <td className="px-4 py-4 text-textSecondary">Rs. {product.price}</td>
                      <td className="px-4 py-4 text-textSecondary">{product.stock}</td>
                      <td className="px-4 py-4 text-textSecondary">{product.status}</td>
                      <td className="px-4 py-4">
                        <Link to={`/admin/products/${product._id}/edit`} className="text-sm font-semibold text-primary">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-textPrimary">Low stock alerts</h2>
            <div className="space-y-3">
              {overview?.lowStockProducts?.map((product) => (
                <div key={product._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-textPrimary">{product.name}</p>
                  <p className="mt-1 text-sm text-textSecondary">{product.stock} left</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card hover={false}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-textPrimary">Categories & brands</h2>
            <Input label="New category" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
            <Button
              variant="secondary"
              onClick={async () => {
                await createCategory({ name: categoryName });
                setCategoryName("");
                loadDashboard();
              }}
            >
              Add category
            </Button>
            <Input label="New brand" value={brandName} onChange={(event) => setBrandName(event.target.value)} />
            <Button
              variant="secondary"
              onClick={async () => {
                await createBrand({ name: brandName });
                setBrandName("");
                loadDashboard();
              }}
            >
              Add brand
            </Button>
            <div className="space-y-2 text-sm text-textSecondary">
              <p>Categories: {categories.map((item) => item.name).join(", ")}</p>
              <p>Brands: {brands.map((item) => item.name).join(", ")}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-textPrimary">Coupons & offers</h2>
            <Input label="Coupon code" value={coupon.code} onChange={(event) => setCoupon((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} />
            <Input label="Coupon title" value={coupon.title} onChange={(event) => setCoupon((prev) => ({ ...prev, title: event.target.value }))} />
            <Input label="Discount type" value={coupon.discountType} onChange={(event) => setCoupon((prev) => ({ ...prev, discountType: event.target.value }))} />
            <Input type="number" label="Discount value" value={coupon.discountValue} onChange={(event) => setCoupon((prev) => ({ ...prev, discountValue: Number(event.target.value) }))} />
            <Button
              variant="secondary"
              onClick={async () => {
                await createCoupon(coupon);
                loadDashboard();
              }}
            >
              Create coupon
            </Button>
            <div className="space-y-3">
              {coupons.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{item.code}</p>
                    <p className="mt-1 text-sm text-textSecondary">{item.title}</p>
                  </div>
                  <label className="flex items-center gap-3 text-sm text-textSecondary">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={async (event) => {
                        await updateCoupon(item._id, { active: event.target.checked });
                        loadDashboard();
                      }}
                      className="h-4 w-4 accent-primary"
                    />
                    Active
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card hover={false}>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-textPrimary">User management</h2>
            <Button to="/admin/users" variant="ghost">View all users</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead>
                <tr className="text-textSecondary">
                  <th className="px-4 py-4 font-medium">Name</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Blocked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-4 text-textPrimary">{user.name}</td>
                    <td className="px-4 py-4 text-textSecondary">{user.email}</td>
                    <td className="px-4 py-4 text-textSecondary">{user.role}</td>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={user.isBlocked}
                        onChange={async (event) => {
                          await updateAdminUser(user._id, { isBlocked: event.target.checked });
                          loadDashboard();
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
};
