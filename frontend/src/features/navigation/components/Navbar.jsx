import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronDown,
  FiHeart,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiX,
} from "react-icons/fi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Container } from "../../../components/ui/Container";
import { buildCategoryTree, getCategoryHref } from "../../../utils/categoryTree";
import { CategoryGlyph, getCategoryImage } from "../../../utils/categoryPresentation";
import { logoutAsync, selectLoggedInUser } from "../../auth/AuthSlice";
import { selectCartItems } from "../../cart/CartSlice";
import {
  fetchAllCategoriesAsync,
  selectCategories,
  selectCategoryStatus,
} from "../../categories/CategoriesSlice";

const navItemClass =
  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:bg-white hover:text-textPrimary";

const actionClass =
  "relative inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-medium text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(17,17,17,0.08)]";

const iconActionClass =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(17,17,17,0.08)]";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useSelector(selectCategories);
  const categoryStatus = useSelector(selectCategoryStatus);
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems);

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeRootId, setActiveRootId] = useState("");
  const [mobileExpandedRootId, setMobileExpandedRootId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setAccountOpen(false);
    setMobileExpandedRootId("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q") || "";
    if (location.pathname === "/search") {
      setSearchTerm(query);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!categories.length && categoryStatus === "idle") {
      dispatch(fetchAllCategoriesAsync());
    }
  }, [categories.length, categoryStatus, dispatch]);

  const categoryTree = useMemo(() => buildCategoryTree(categories).roots, [categories]);
  const quickCategories = useMemo(() => categoryTree.slice(0, 8), [categoryTree]);

  useEffect(() => {
    if (!activeRootId && categoryTree.length) {
      setActiveRootId(String(categoryTree[0]._id));
    }
  }, [activeRootId, categoryTree]);

  useEffect(() => {
    if (!mobileExpandedRootId && categoryTree.length) {
      setMobileExpandedRootId(String(categoryTree[0]._id));
    }
  }, [categoryTree, mobileExpandedRootId]);

  const activeRoot = categoryTree.find((item) => String(item._id) === activeRootId) || categoryTree[0];

  const accountLinks = loggedInUser?.isAdmin
    ? [
        { label: "Dashboard", to: "/admin" },
        { label: "Orders", to: "/orders" },
      ]
    : [
        { label: "Profile", to: "/account" },
        { label: "Orders", to: "/orders" },
        { label: "Wishlist", to: "/wishlist" },
      ];

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/products");
    setMenuOpen(false);
  };

  const handleProtectedNavigation = (path) => {
    navigate(loggedInUser ? path : "/login");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    setMenuOpen(false);
    await dispatch(logoutAsync());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <Container>
        <div className={["transition duration-200", isScrolled ? "py-3" : "py-4"].join(" ")}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 md:min-w-[180px]">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-textPrimary shadow-[0_10px_24px_rgba(17,17,17,0.05)] md:hidden"
              >
                <FiMenu />
              </button>

              <Link to="/" className="text-[1.65rem] font-semibold tracking-[-0.05em] text-textPrimary">
                Sastify
              </Link>
            </div>

            <form onSubmit={handleSearchSubmit} className="hidden flex-1 md:block">
              <div className="flex h-12 items-center gap-3 rounded-full border border-border bg-white px-4 shadow-[0_10px_24px_rgba(17,17,17,0.05)]">
                <FiSearch className="text-textSecondary" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for fashion, electronics, home and more"
                  className="h-full w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary/80"
                />
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/wishlist")}
                className={iconActionClass}
              >
                <FiHeart />
              </button>

              <button
                type="button"
                onClick={() => handleProtectedNavigation("/orders")}
                className="hidden sm:inline-flex sm:h-11 sm:items-center sm:justify-center sm:gap-2 sm:rounded-full sm:border sm:border-border sm:bg-white sm:px-4 sm:text-sm sm:font-medium sm:text-textPrimary sm:shadow-[0_10px_24px_rgba(17,17,17,0.05)] sm:transition sm:hover:-translate-y-0.5 sm:hover:shadow-[0_16px_32px_rgba(17,17,17,0.08)]"
              >
                <FiPackage />
                Orders
              </button>

              <Link to="/cart" className={actionClass}>
                <FiShoppingCart />
                <span className="hidden sm:inline">Cart</span>
                {cartItems.length ? (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                    {cartItems.length}
                  </span>
                ) : null}
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!loggedInUser) {
                      navigate("/login");
                      return;
                    }

                    setAccountOpen((prev) => !prev);
                    setCategoriesOpen(false);
                  }}
                  className={actionClass}
                >
                  <FiUser />
                  <span className="hidden sm:inline">{loggedInUser ? "Profile" : "Sign in"}</span>
                </button>

                <AnimatePresence>
                  {accountOpen && loggedInUser ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-[24px] border border-border bg-white p-3 shadow-premium"
                    >
                      <div className="grid gap-1">
                        {accountLinks.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="rounded-2xl px-4 py-3 text-sm text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="rounded-2xl px-4 py-3 text-left text-sm text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
            <div className="flex h-12 items-center gap-3 rounded-full border border-border bg-white px-4 shadow-[0_10px_24px_rgba(17,17,17,0.05)]">
              <FiSearch className="text-textSecondary" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products"
                className="h-full w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary/80"
              />
            </div>
          </form>

          <div className="mt-3 hidden items-center justify-between gap-4 md:flex">
            <nav className="flex items-center gap-2">
              <NavLink to="/" className={navItemClass}>
                {({ isActive }) => <span className={isActive ? "text-textPrimary" : ""}>Home</span>}
              </NavLink>
              <NavLink to="/products" className={navItemClass}>
                {({ isActive }) => <span className={isActive ? "text-textPrimary" : ""}>Shop</span>}
              </NavLink>

              <div
                className="relative"
                onMouseEnter={() => {
                  setCategoriesOpen(true);
                  setAccountOpen(false);
                  if (!activeRootId && categoryTree.length) {
                    setActiveRootId(String(categoryTree[0]._id));
                  }
                }}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen((prev) => !prev);
                    setAccountOpen(false);
                  }}
                  className={navItemClass}
                >
                  Categories
                  <FiChevronDown className={`transition ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {categoriesOpen && activeRoot ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 top-[calc(100%+14px)] z-50 w-[min(1040px,82vw)] overflow-hidden rounded-[30px] border border-border bg-white shadow-premium"
                    >
                      <div className="grid grid-cols-[260px_1fr]">
                        <div className="border-r border-border bg-surface p-4">
                          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                            Departments
                          </p>
                          <div className="space-y-1">
                            {categoryTree.map((root) => (
                              <button
                                key={root._id}
                                type="button"
                                onMouseEnter={() => setActiveRootId(String(root._id))}
                                onFocus={() => setActiveRootId(String(root._id))}
                                className={[
                                  "flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm transition",
                                  String(root._id) === String(activeRoot._id)
                                    ? "bg-white text-textPrimary shadow-[0_8px_20px_rgba(17,17,17,0.05)]"
                                    : "text-textSecondary hover:bg-white/80 hover:text-textPrimary",
                                ].join(" ")}
                              >
                                <span className="flex items-center gap-3">
                                  <span
                                    className={[
                                      "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                                      String(root._id) === String(activeRoot._id)
                                        ? "border-border bg-surface text-textPrimary"
                                        : "border-transparent bg-white text-textSecondary",
                                    ].join(" ")}
                                  >
                                    <CategoryGlyph category={root} className="text-base" />
                                  </span>
                                  <span className="font-medium">{root.name}</span>
                                </span>
                                <FiChevronDown className="-rotate-90 text-xs" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="mb-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="space-y-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">
                                Explore
                              </p>
                              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
                                {activeRoot.name}
                              </h3>
                              <Link
                                to={getCategoryHref(activeRoot)}
                                className="inline-flex rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-textPrimary transition hover:bg-white"
                              >
                                Shop all
                              </Link>
                            </div>

                            <div className="overflow-hidden rounded-[24px] border border-border bg-surface">
                              <div className="grid h-full grid-cols-[120px_1fr]">
                                <img
                                  src={getCategoryImage(activeRoot)}
                                  alt={activeRoot.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="flex flex-col justify-center gap-2 px-4 py-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                                    Featured department
                                  </p>
                                  <p className="text-lg font-semibold tracking-tight text-textPrimary">
                                    {activeRoot.name}
                                  </p>
                                  <p className="text-sm text-textSecondary">
                                    {activeRoot.children.length} focused categories
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {activeRoot.children.length ? (
                              activeRoot.children.map((child) => (
                                <div key={child._id} className="rounded-[24px] border border-border bg-surface p-4">
                                  <Link
                                    to={getCategoryHref(child)}
                                    className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-textPrimary"
                                  >
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-textPrimary shadow-[0_8px_18px_rgba(17,17,17,0.05)]">
                                      <CategoryGlyph category={child} className="text-sm" />
                                    </span>
                                    {child.name}
                                  </Link>
                                  <div className="mt-3 space-y-2">
                                    {(child.children.length ? child.children : [child]).slice(0, 6).map((leaf) => (
                                      <Link
                                        key={leaf._id}
                                        to={getCategoryHref(leaf)}
                                        className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm text-textSecondary transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(17,17,17,0.05)] hover:text-textPrimary"
                                      >
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-textPrimary">
                                          <CategoryGlyph category={leaf} className="text-sm" />
                                        </span>
                                        {leaf.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="space-y-3">
                                <Link
                                  to={getCategoryHref(activeRoot)}
                                  className="inline-flex text-sm font-semibold uppercase tracking-[0.16em] text-textPrimary"
                                >
                                  {activeRoot.name}
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </nav>

            <div className="no-scrollbar flex max-w-[52vw] items-center gap-2 overflow-x-auto pb-1">
              {quickCategories.map((category) => (
                <Link
                  key={category._id}
                  to={getCategoryHref(category)}
                  className="shrink-0 rounded-full border border-border bg-white px-4 py-2 text-sm text-textSecondary transition hover:text-textPrimary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm md:hidden"
          >
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full w-[min(88vw,380px)] overflow-y-auto border-r border-border bg-background px-5 py-5 shadow-premium"
            >
              <div className="mb-6 flex items-center justify-between">
                <Link to="/" className="text-2xl font-semibold tracking-[-0.04em] text-textPrimary">
                  Sastify
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-textPrimary"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="mb-5">
                <div className="flex h-12 items-center gap-3 rounded-full border border-border bg-white px-4 shadow-[0_10px_24px_rgba(17,17,17,0.05)]">
                  <FiSearch className="text-textSecondary" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search products"
                    className="h-full w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary/80"
                  />
                </div>
              </form>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation("/wishlist")}
                  className="flex items-center gap-3 rounded-[22px] border border-border bg-white px-4 py-4 text-left text-sm font-medium text-textPrimary"
                >
                  <FiHeart />
                  Wishlist
                </button>
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation("/orders")}
                  className="flex items-center gap-3 rounded-[22px] border border-border bg-white px-4 py-4 text-left text-sm font-medium text-textPrimary"
                >
                  <FiPackage />
                  My orders
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-[24px] border border-border bg-white p-2">
                  <Link to="/" className="block rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-surface">
                    Home
                  </Link>
                  <Link
                    to="/products"
                    className="block rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-surface"
                  >
                    Shop
                  </Link>
                  <Link to="/cart" className="block rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-surface">
                    Cart
                  </Link>
                  <Link
                    to={loggedInUser ? (loggedInUser.isAdmin ? "/admin" : "/account") : "/login"}
                    className="block rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-surface"
                  >
                    {loggedInUser ? "Profile" : "Sign in"}
                  </Link>
                </div>

                <div className="rounded-[24px] border border-border bg-white p-4">
                  <p className="px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">
                    Categories
                  </p>
                  {categoryTree.length ? (
                    <div className="space-y-3">
                      {categoryTree.map((root) => {
                        const isExpanded = String(root._id) === mobileExpandedRootId;

                        return (
                          <div key={root._id} className="overflow-hidden rounded-[22px] border border-border bg-surface">
                            <button
                              type="button"
                              onClick={() =>
                                setMobileExpandedRootId((prev) => (prev === String(root._id) ? "" : String(root._id)))
                              }
                              className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                            >
                              <span className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-textPrimary shadow-[0_8px_18px_rgba(17,17,17,0.05)]">
                                  <CategoryGlyph category={root} className="text-base" />
                                </span>
                                <span className="text-sm font-semibold text-textPrimary">{root.name}</span>
                              </span>
                              <FiChevronDown
                                className={`text-textSecondary transition ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded ? (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="overflow-hidden border-t border-border bg-white"
                                >
                                  <div className="space-y-3 p-4">
                                    <Link
                                      to={getCategoryHref(root)}
                                      className="inline-flex rounded-full border border-border bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-textPrimary"
                                    >
                                      Shop all {root.name}
                                    </Link>

                                    <div className="space-y-3">
                                      {root.children.length ? (
                                        root.children.map((child) => (
                                          <div key={child._id} className="space-y-2">
                                            <Link
                                              to={getCategoryHref(child)}
                                              className="block text-sm font-semibold text-textPrimary"
                                            >
                                              {child.name}
                                            </Link>
                                            {child.children.length ? (
                                              <div className="grid gap-1 pl-3">
                                                {child.children.slice(0, 6).map((leaf) => (
                                                  <Link
                                                    key={leaf._id}
                                                    to={getCategoryHref(leaf)}
                                                    className="rounded-xl px-3 py-2 text-sm text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                                                  >
                                                    {leaf.name}
                                                  </Link>
                                                ))}
                                              </div>
                                            ) : null}
                                          </div>
                                        ))
                                      ) : (
                                        <Link
                                          to={getCategoryHref(root)}
                                          className="block rounded-xl px-3 py-2 text-sm text-textSecondary transition hover:bg-surface hover:text-textPrimary"
                                        >
                                          {root.name}
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-1 text-sm text-textSecondary">
                      {categoryStatus === "rejected" ? "Categories unavailable right now." : "Loading categories..."}
                    </p>
                  )}
                </div>

                {loggedInUser ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-[22px] border border-border bg-white px-4 py-4 text-left text-sm font-medium text-textPrimary"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
