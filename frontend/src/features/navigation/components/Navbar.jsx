import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiChevronRight,
  FiGrid,
  FiHeart,
  FiLogOut,
  FiMenu,
  FiPackage,
  FiSearch,
  FiShield,
  FiShoppingBag,
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
import { Button } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";

const CountBubble = ({ count, children }) => (
  <span className="relative inline-flex">
    {children}
    {count ? (
      <span className="absolute -right-2 -top-2 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
        {count}
      </span>
    ) : null}
  </span>
);

const loadRecentSearches = () => {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const persistRecentSearch = (query) => {
  const normalized = query.trim();
  if (!normalized) {
    return;
  }

  const unique = [normalized, ...loadRecentSearches().filter((item) => item !== normalized)].slice(0, 5);
  window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(unique));
};

const primaryLinks = [
  { label: "Home", to: "/" },
  { label: "Catalog", to: "/products" },
];

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentQuery = searchParams.get("q");
    if (currentQuery) {
      setQuery(currentQuery);
    }
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

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
        setSuggestions(response.data);
      } catch (error) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const recentSearches = useMemo(() => loadRecentSearches(), [location.pathname, searchOpen]);

  const trustHighlights = useMemo(() => {
    const safeNumber = (value) => Number(value || 0).toLocaleString("en-IN");
    return [
      `${safeNumber(storefrontMetrics.activeProducts)} live products`,
      `${safeNumber(storefrontMetrics.activeCategories)} categories`,
      `${safeNumber(storefrontMetrics.publishedReviews)} published reviews`,
    ];
  }, [storefrontMetrics.activeCategories, storefrontMetrics.activeProducts, storefrontMetrics.publishedReviews]);

  const accountLinks = loggedInUser?.isAdmin
    ? [
        { label: "Admin dashboard", to: "/admin", icon: <FiGrid /> },
        { label: "Logout", action: "logout", icon: <FiLogOut /> },
      ]
    : [
        { label: "My account", to: "/account", icon: <FiUser /> },
        { label: "My orders", to: "/orders", icon: <FiPackage /> },
        { label: "Logout", action: "logout", icon: <FiLogOut /> },
      ];

  const handleSearchSubmit = (value = query) => {
    const finalQuery = value.trim();
    if (!finalQuery) {
      return;
    }

    persistRecentSearch(finalQuery);
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
  };

  const handleLogout = async () => {
    setAccountOpen(false);
    await dispatch(logoutAsync());
    navigate("/login");
  };

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50 transition duration-300",
          scrolled ? "border-b border-border bg-background/90 shadow-card backdrop-blur-2xl" : "bg-transparent",
        ].join(" ")}
      >
        <div className="border-b border-border bg-[#fbf8f4]">
          <Container className="flex flex-col gap-2 py-2.5 text-sm text-textSecondary md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              {trustHighlights.map((item) => (
                <span key={item} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5">
                  <FiShield className="text-primary" />
                  {item}
                </span>
              ))}
            </div>
            <p className="hidden md:block">
              Average rating {Number(storefrontMetrics.averageRating || 0).toFixed(1)}/5 from{" "}
              {Number(storefrontMetrics.publishedReviews || 0).toLocaleString("en-IN")} customer reviews.
            </p>
          </Container>
        </div>

        <Container className="py-4">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary lg:hidden sm:h-11 sm:w-11"
            >
              <FiMenu />
            </button>

            <Link to="/" className="min-w-0 shrink">
              <p className="text-xl font-semibold tracking-tight text-textPrimary sm:text-2xl">Sastify</p>
              <p className="hidden text-[10px] uppercase tracking-[0.22em] text-textSecondary sm:block">Modern marketplace</p>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-2 text-sm font-medium transition",
                      isActive ? "bg-white/[0.08] text-textPrimary" : "text-textSecondary hover:bg-white/[0.05] hover:text-textPrimary",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="relative ml-auto hidden max-w-xl flex-1 md:block">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
                <FiSearch className="text-textSecondary" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  className="w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary"
                  placeholder="Search for mobiles, fashion, appliances and more"
                />
              </div>

              <AnimatePresence>
                {searchOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-[calc(100%+10px)] rounded-3xl border border-border bg-white p-4 shadow-card backdrop-blur-2xl"
                  >
                    {query.trim() ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-textSecondary">Suggestions</p>
                        {suggestions.length ? (
                          suggestions.map((item) => (
                            <button
                              key={item._id}
                              onClick={() => handleSearchSubmit(item.name || item.title)}
                              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/[0.05]"
                              type="button"
                            >
                              <div>
                                <p className="text-sm font-medium text-textPrimary">{item.name || item.title}</p>
                                <p className="text-xs text-textSecondary">{item.brand?.name || ""} · Rs. {item.price}</p>
                              </div>
                              <FiChevronRight className="text-textSecondary" />
                            </button>
                          ))
                        ) : (
                          <p className="rounded-2xl border border-border bg-[#fbf8f4] px-4 py-3 text-sm text-textSecondary">
                            No instant matches. Press Enter to view all search results.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-textSecondary">Recent searches</p>
                        {recentSearches.length ? (
                          recentSearches.map((item) => (
                            <button
                              key={item}
                              onClick={() => handleSearchSubmit(item)}
                              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm text-textPrimary transition hover:bg-white/[0.05]"
                              type="button"
                            >
                              <span>{item}</span>
                              <FiChevronRight className="text-textSecondary" />
                            </button>
                          ))
                        ) : (
                          <p className="rounded-2xl border border-border bg-[#fbf8f4] px-4 py-3 text-sm text-textSecondary">
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
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary md:hidden sm:h-11 sm:w-11"
              >
                <FiSearch />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (loggedInUser) {
                    setAccountOpen((prev) => !prev);
                  } else {
                    navigate("/login");
                  }
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary sm:h-11 sm:w-11"
              >
                <FiUser />
              </button>

              {!loggedInUser?.isAdmin ? (
                <>
                  <Link to={loggedInUser ? "/wishlist" : "/login"} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary sm:h-11 sm:w-11">
                    <CountBubble count={wishlistItems.length}>
                      <FiHeart />
                    </CountBubble>
                  </Link>
                  <Link to={loggedInUser ? "/orders" : "/login"} className="hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-textPrimary sm:inline-flex">
                    <FiPackage />
                  </Link>
                </>
              ) : null}

              <Link to="/cart" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-textPrimary sm:h-11 sm:w-11">
                <CountBubble count={cartItems.length}>
                  <FiShoppingBag />
                </CountBubble>
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="mt-4 rounded-2xl border border-border bg-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FiSearch className="text-textSecondary" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSearchSubmit();
                        }
                      }}
                      className="w-full bg-transparent text-sm text-textPrimary outline-none placeholder:text-textSecondary"
                      placeholder="Search for products"
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-4 hidden items-center gap-2 overflow-x-auto pb-1 lg:flex">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="whitespace-nowrap rounded-full border border-border bg-white px-4 py-2 text-sm text-textSecondary transition hover:border-primary/30 hover:text-textPrimary"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </Container>

        <AnimatePresence>
          {accountOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-4 top-[calc(100%-8px)] z-50 w-[240px] rounded-3xl border border-border bg-white p-3 shadow-card backdrop-blur-2xl sm:right-8 lg:right-20"
            >
              {accountLinks.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.05]"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-textPrimary transition hover:bg-white/[0.05]"
                    type="button"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ x: -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              className="h-full w-[min(88vw,320px)] border-r border-border bg-background px-5 py-6"
            >
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <p className="text-xl font-semibold text-textPrimary">Sastify</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Navigation</p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white text-textPrimary"
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-2">
                {primaryLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="block rounded-2xl px-4 py-3 text-sm text-textPrimary transition hover:bg-white/[0.05]">
                    {item.label}
                  </Link>
                ))}
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="block rounded-2xl px-4 py-3 text-sm text-textSecondary transition hover:bg-white/[0.05] hover:text-textPrimary"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  fullWidth
                  variant="secondary"
                  to={loggedInUser?.isAdmin ? "/admin" : loggedInUser ? "/orders" : "/login"}
                >
                  {loggedInUser?.isAdmin ? "Open admin dashboard" : loggedInUser ? "View my orders" : "Sign in"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
