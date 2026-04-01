import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
import { selectLoggedInUser, logoutAsync } from "../../auth/AuthSlice";
import { selectCartItems } from "../../cart/CartSlice";
import { selectCategories } from "../../categories/CategoriesSlice";
import { fetchProducts } from "../../products/ProductApi";
import { selectStorefrontMetrics } from "../../storefront/StorefrontSlice";
import { selectWishlistItems } from "../../wishlist/WishlistSlice";
import { RECENT_SEARCH_STORAGE_KEY } from "../../../constants";

const primaryLinks = [
  { label: "Home", to: "/" },
  { label: "Catalog", to: "/products" },
];

const loadRecentSearches = () => {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const persistRecentSearch = (query) => {
  const normalized = query.trim();
  if (!normalized) return;
  const unique = [normalized, ...loadRecentSearches().filter((item) => item !== normalized)].slice(0, 5);
  window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(unique));
};

const iconButtonClass =
  "relative inline-flex h-12 min-w-[48px] items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-textPrimary shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_rgba(200,139,74,0.18)]";

const StatPill = ({ text }) => (
  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-xs font-medium text-textSecondary shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-xl">
    <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent to-primary" />
    {text}
  </span>
);

const ActionButton = ({ to, onClick, icon, label, count }) => {
  const inner = (
    <span className={iconButtonClass}>
      {icon}
      {label ? <span className="hidden sm:inline">{label}</span> : null}
      {count ? (
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-button-gradient px-1 text-[10px] font-semibold text-white"
        >
          {count}
        </motion.span>
      ) : null}
    </span>
  );

  if (to) {
    return <Link to={to}>{inner}</Link>;
  }

  return (
    <button type="button" onClick={onClick}>
      {inner}
    </button>
  );
};

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const categories = useSelector(selectCategories);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);
  const cartItems = useSelector(selectCartItems);
  const storefrontMetrics = useSelector(selectStorefrontMetrics);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentQuery = searchParams.get("q");
    setQuery(currentQuery || "");
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 18);
      setIsHidden(currentY > 140 && currentY > lastY);
      lastY = currentY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetchProducts({
          search: query.trim(),
          pagination: { page: 1, limit: 6 },
        });
        setSuggestions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const trustHighlights = useMemo(() => {
    const safeNumber = (value) => Number(value || 0).toLocaleString("en-IN");
    return [
      `${safeNumber(storefrontMetrics.activeProducts)} live products`,
      `${safeNumber(storefrontMetrics.activeCategories)} categories`,
      `${safeNumber(storefrontMetrics.publishedReviews)} reviews`,
    ];
  }, [storefrontMetrics]);

  const handleSearchSubmit = (value = query) => {
    const finalQuery = value.trim();
    if (!finalQuery) return;
    persistRecentSearch(finalQuery);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    await dispatch(logoutAsync());
    navigate("/login");
  };

  const recentSearches = loadRecentSearches();

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6">
      <motion.div
        animate={{
          y: isHidden ? -18 : 0,
          opacity: isHidden ? 0.92 : 1,
          paddingTop: isScrolled ? 10 : 14,
          paddingBottom: isScrolled ? 10 : 14,
          scale: isScrolled ? 0.985 : 1,
        }}
        transition={{ duration: 0.35 }}
        className="glass-card noise-overlay overflow-hidden rounded-[30px] border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.82),rgba(9,13,20,0.78))] px-3 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:px-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 py-2.5 text-xs text-textSecondary">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {trustHighlights.map((item) => (
              <StatPill key={item} text={item} />
            ))}
          </div>
          <p className="hidden md:block">
            Average rating {Number(storefrontMetrics.averageRating || 0).toFixed(1)}/5 from{" "}
            {Number(storefrontMetrics.publishedReviews || 0).toLocaleString("en-IN")} reviews
          </p>
        </div>

        <div className="flex items-center gap-3 py-4">
          <button type="button" onClick={() => setMenuOpen(true)} className={`${iconButtonClass} lg:hidden`}>
            <FiMenu />
          </button>

          <Link to="/" className="min-w-0 shrink-0">
            <p className="bg-button-gradient bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-[2rem]">
              Sastify
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.26em] text-textSecondary sm:block">
              Future commerce
            </p>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {primaryLinks.map((item) => (
              <NavLink key={item.to} to={item.to} className="group relative rounded-full px-5 py-3 text-sm font-medium text-textSecondary transition hover:text-textPrimary">
                {({ isActive }) => (
                  <>
                    <span className={`relative z-[1] transition duration-200 ${isActive ? "text-textPrimary" : ""}`}>{item.label}</span>
                    <span
                      className={[
                        "absolute inset-x-3 bottom-2 h-[2px] origin-center rounded-full bg-gradient-to-r from-accent via-primary to-accent transition duration-300",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                      ].join(" ")}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="relative ml-auto hidden max-w-[620px] flex-1 md:block">
            <motion.div
              animate={{ scale: searchOpen ? 1.01 : 1 }}
              className="relative flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
            >
              <FiSearch className="text-base text-textSecondary" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearchSubmit();
                }}
                className="w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary/80"
                placeholder="Search for mobiles, fashion, appliances and more"
              />
            </motion.div>

            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 top-[calc(100%+12px)] glass-card p-4"
                >
                  {query.trim() ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">Suggestions</p>
                      {suggestions.length ? (
                        suggestions.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => handleSearchSubmit(item.name || item.title)}
                            className="flex w-full items-center justify-between rounded-[18px] border border-transparent px-4 py-3 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
                          >
                            <div>
                              <p className="text-sm font-medium text-textPrimary">{item.name || item.title}</p>
                              <p className="text-xs text-textSecondary">
                                {item.brand?.name || ""} · Rs. {item.price}
                              </p>
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">Open</span>
                          </button>
                        ))
                      ) : (
                        <p className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-textSecondary">
                          No instant matches. Press Enter to view all search results.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">Recent searches</p>
                      {recentSearches.length ? (
                        recentSearches.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleSearchSubmit(item)}
                            className="flex w-full items-center justify-between rounded-[18px] border border-transparent px-4 py-3 text-left transition hover:border-white/10 hover:bg-white/[0.05]"
                          >
                            <span className="text-sm text-textPrimary">{item}</span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">Open</span>
                          </button>
                        ))
                      ) : (
                        <p className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-textSecondary">
                          Your recent searches will appear here.
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setSearchOpen((prev) => !prev)} className={`${iconButtonClass} md:hidden`}>
              <FiSearch />
            </button>

            <ActionButton
              onClick={() => {
                if (loggedInUser) {
                  setAccountOpen((prev) => !prev);
                } else {
                  navigate("/login");
                }
              }}
              icon={<FiUser />}
            />
            {!loggedInUser?.isAdmin ? (
              <>
                <ActionButton to={loggedInUser ? "/wishlist" : "/login"} icon={<FiHeart />} count={wishlistItems.length} />
                <ActionButton to={loggedInUser ? "/orders" : "/login"} icon={<FiPackage />} />
              </>
            ) : null}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
              <ActionButton to="/cart" icon={<FiShoppingCart />} count={cartItems.length} />
            </motion.div>
          </div>
        </div>

        <div className="hidden items-center gap-3 overflow-x-auto pb-4 lg:flex">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-textSecondary shadow-[0_10px_26px_rgba(0,0,0,0.22)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-white/[0.07] hover:text-textPrimary"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {accountOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute right-5 top-[calc(100%-6px)] z-50 w-[250px] glass-card p-3 sm:right-8 lg:right-12"
          >
            {loggedInUser?.isAdmin ? (
              <>
                <Link to="/admin" className="block rounded-[18px] px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.06]">
                  Admin dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm text-textPrimary transition hover:bg-white/[0.06]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/account" className="block rounded-[18px] px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.06]">
                  My account
                </Link>
                <Link to="/orders" className="block rounded-[18px] px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.06]">
                  My orders
                </Link>
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm text-textPrimary transition hover:bg-white/[0.06]">
                  Logout
                </button>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/25 backdrop-blur-sm lg:hidden">
            <motion.div
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              className="glass-card h-full w-[min(88vw,340px)] rounded-none rounded-r-[30px] border-r border-white/8 bg-[linear-gradient(180deg,rgba(12,18,28,0.96),rgba(8,12,20,0.96))] p-5"
            >
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="bg-button-gradient bg-clip-text text-2xl font-black text-transparent">Sastify</p>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-textSecondary">Navigation</p>
                </div>
                <button type="button" onClick={() => setMenuOpen(false)} className={iconButtonClass}>
                  <FiX />
                </button>
              </div>

              <div className="space-y-2">
                {primaryLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="block rounded-[18px] px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.06]">
                    {item.label}
                  </Link>
                ))}
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="block rounded-[18px] px-4 py-3 text-sm text-textSecondary transition hover:bg-white/[0.06] hover:text-textPrimary"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
