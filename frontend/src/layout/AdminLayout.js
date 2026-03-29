import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiBox, FiGrid, FiLogOut, FiMenu, FiPackage, FiUsers, FiX } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { logoutAsync } from "../features/auth/AuthSlice";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: <FiGrid /> },
  { label: "Products", to: "/admin/products/new", icon: <FiBox /> },
  { label: "Orders", to: "/admin/orders", icon: <FiPackage /> },
  { label: "Users", to: "/admin/users", icon: <FiUsers /> },
];

export const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : true));

  React.useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  React.useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutAsync());
    navigate("/login");
  };

  const navContent = (
    <div className="flex h-full flex-col gap-8 rounded-r-[32px] border-r border-white/10 bg-slate-950/90 px-5 py-6 backdrop-blur-xl lg:w-72">
      <div className="space-y-3">
        <span className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Admin Console
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">Sastify Admin</h1>
          <p className="mt-2 text-sm text-textSecondary">Catalog, orders, users, and promotions in one place.</p>
        </div>
      </div>

      <div className="space-y-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "border border-primary/30 bg-primary/15 text-textPrimary shadow-glow"
                  : "text-textSecondary hover:bg-white/[0.05] hover:text-textPrimary",
              ].join(" ")}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-textPrimary">Operations snapshot</p>
          <p className="mt-2 text-sm text-textSecondary">Monitor inventory, shipping state changes, and customer access from a single workspace.</p>
        </div>
        <Button variant="secondary" fullWidth icon={<FiLogOut />} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <div className="flex min-h-screen">
        <div className="hidden lg:block">{navContent}</div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            >
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                className="relative h-full max-w-[300px]"
              >
                <button
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-textPrimary"
                  type="button"
                >
                  <FiX />
                </button>
                {navContent}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex-1">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl lg:hidden">
            <Container className="flex items-center justify-between py-4">
              <button
                onClick={() => setOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-textPrimary"
                type="button"
              >
                <FiMenu />
              </button>
              <div className="text-right">
                <p className="text-sm font-semibold text-textPrimary">Sastify Admin</p>
                <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Control Center</p>
              </div>
            </Container>
          </div>

          <Container className="py-8 lg:py-10">
            {!isDesktop ? (
              <div className="mb-6 flex justify-end lg:hidden">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-textPrimary"
                  type="button"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            ) : null}
            <Outlet />
          </Container>
        </div>
      </div>
    </div>
  );
};
