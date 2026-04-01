import React, { useEffect, useMemo, useState } from "react";
import { FiHeart, FiMinus, FiPlus, FiShare2, FiShield, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { NewsletterBanner } from "../../../components/NewsletterBanner";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { Section } from "../../../components/ui/Section";
import { formatPrice } from "../../../utils/currencyFormatter";
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  selectProductFetchStatus,
  selectSelectedProduct,
} from "../ProductSlice";
import { ProductCard } from "./ProductCard";
import { fetchReviewsByProductIdAsync, selectReviews } from "../../review/ReviewSlice";
import { addGuestCartItem, addToCartAsync } from "../../cart/CartSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice";
import { ProductVisual } from "./ProductVisual";

const tabs = ["Product details", "Rating & reviews"];

export const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);
  const productFetchStatus = useSelector(selectProductFetchStatus);
  const reviews = useSelector(selectReviews);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [pincode, setPincode] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductByIdAsync(id));
    dispatch(fetchReviewsByProductIdAsync(id));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [product?._id]);

  const galleryImages = useMemo(() => {
    const images = product?.images?.filter(Boolean) || [];
    if (images.length) {
      return images;
    }

    if (product?.thumbnail) {
      return [product.thumbnail];
    }

    return [""];
  }, [product?.images, product?.thumbnail]);

  const reviewSummary = useMemo(() => {
    const rating = Number(product?.rating || 0);
    const reviewCount = Number(product?.reviewCount || reviews.length || 0);
    return { rating, reviewCount };
  }, [product, reviews]);

  const perks = useMemo(
    () => [
      {
        icon: <FiTruck />,
        title: "Free delivery",
        description: product?.shippingText || "Shipping information will be confirmed during checkout.",
      },
      {
        icon: <FiShield />,
        title: "Secure checkout",
        description: product?.returnPolicy || "Returns and support depend on the seller policy.",
      },
    ],
    [product?.returnPolicy, product?.shippingText]
  );

  const isWishlisted = wishlistItems.some((item) => item.product._id === product?._id);

  const handleAddToCart = () => {
    const payload = {
      product: product._id,
      quantity,
      color: selectedColor,
      size: selectedSize,
    };

    if (loggedInUser) {
      dispatch(addToCartAsync(payload));
      return;
    }

    dispatch(addGuestCartItem({ product, quantity, color: selectedColor, size: selectedSize }));
  };

  const handleWishlist = () => {
    if (!loggedInUser) {
      return;
    }

    if (isWishlisted) {
      const entry = wishlistItems.find((item) => item.product._id === product._id);
      if (entry) {
        dispatch(deleteWishlistItemByIdAsync(entry._id));
      }
      return;
    }

    dispatch(createWishlistItemAsync({ product: product._id }));
  };

  if (productFetchStatus === "pending" || !product) {
    return <LoadingState cards={1} />;
  }

  if (!product?._id) {
    return (
      <EmptyState
        title="Product unavailable"
        description="The product you’re looking for is no longer available or may have moved."
        actionLabel="Back to catalog"
        actionTo="/products"
      />
    );
  }

  return (
    <PageWrapper className="space-y-0 py-6 md:py-8">
      <Section className="pt-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-textSecondary">
          <Link to="/" className="hover:text-textPrimary">
            Home
          </Link>
          <span>/</span>
          <Link to={`/category/${product.category?.slug || ""}`} className="hover:text-textPrimary">
            {product.category?.name || "Category"}
          </Link>
          <span>/</span>
          <span className="text-textPrimary">{product.name || product.title}</span>
        </div>
      </Section>

      <Section className="pt-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card
            hover={false}
            className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-4 shadow-[0_24px_56px_rgba(0,0,0,0.28)] md:p-5"
          >
            <div className="grid gap-4 md:grid-cols-[88px_1fr] lg:grid-cols-[100px_1fr]">
              <div className="order-2 grid grid-cols-4 gap-3 md:order-1 md:grid-cols-1">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={[
                      "overflow-hidden rounded-[18px] border bg-[#f8f4ee] p-2 transition md:rounded-[20px]",
                      selectedImage === index ? "border-[#111111]" : "border-border hover:border-[#111111]",
                      selectedImage === index ? "border-accent/40 bg-white/[0.08]" : "border-white/10 bg-white/[0.04] hover:border-accent/25",
                    ].join(" ")}
                  >
                    <div className="h-20 w-full">
                      <ProductVisual
                        product={{ ...product, thumbnail: image, images: [image] }}
                        alt={`${product.name || product.title} ${index + 1}`}
                        imageClassName="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="order-1 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,26,40,0.9),rgba(9,13,20,0.88))] p-4 sm:p-5 md:order-2 md:rounded-[28px] md:p-6">
                <div className="mx-auto aspect-square w-full max-w-2xl">
                  <ProductVisual
                    product={{
                      ...product,
                      thumbnail: galleryImages[selectedImage] || product.thumbnail,
                      images: [galleryImages[selectedImage] || product.thumbnail],
                    }}
                    alt={product.name || product.title}
                    imageClassName="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card
            hover={false}
            className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-5 shadow-[0_24px_56px_rgba(0,0,0,0.28)] sm:p-6 md:rounded-[32px] md:p-8"
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-textSecondary">
                  {product.brand?.name || product.brandName || "Shopco"}
                </p>
                <h1 className="text-2xl font-black uppercase leading-tight tracking-tight text-textPrimary sm:text-3xl md:text-4xl">
                  {product.name || product.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-[#f5b301]">
                    <FiStar className="fill-current" />
                    <span className="font-semibold text-textPrimary">{reviewSummary.rating.toFixed(1)}</span>
                  </span>
                  <span className="text-textSecondary">({reviewSummary.reviewCount} Reviews)</span>
                  <span
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
                      product.stock > 0 ? "bg-[#13271c] text-[#7dd79b]" : "bg-[#321723] text-[#ff8cab]",
                    ].join(" ")}
                  >
                    {product.stock > 0 ? "In stock" : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3 border-b border-white/8 pb-6">
                <p className="text-4xl font-black text-textPrimary">{formatPrice(product.price)}</p>
                {product.originalPrice > product.price ? (
                  <>
                    <p className="text-xl text-textSecondary line-through">{formatPrice(product.originalPrice)}</p>
                    <span className="rounded-full bg-[#fce7ea] px-3 py-1 text-sm font-semibold text-[#c44970]">
                      -{product.discountPercent}%
                    </span>
                  </>
                ) : null}
              </div>

              {product.colors?.length > 0 ? (
                <div className="space-y-3 border-b border-white/8 pb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Select Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={[
                          "rounded-full border px-4 py-2 text-sm font-medium transition",
                          selectedColor === color
                            ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white"
                            : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
                        ].join(" ")}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.sizes?.length > 0 ? (
                <div className="space-y-3 border-b border-white/8 pb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textPrimary">Choose Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={[
                          "rounded-full border px-4 py-2 text-sm font-medium transition",
                          selectedSize === size
                            ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white"
                            : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
                        ].join(" ")}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="inline-flex items-center gap-5 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="text-textPrimary"
                  >
                    <FiMinus />
                  </button>
                  <span className="min-w-[16px] text-center text-sm font-semibold text-textPrimary">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((prev) => prev + 1)} className="text-textPrimary">
                    <FiPlus />
                  </button>
                </div>

                <Button
                  icon={<FiShoppingBag />}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  fullWidth
                  className="rounded-full sm:flex-1"
                >
                  Add to Cart
                </Button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className={[
                    "inline-flex h-12 w-12 items-center justify-center rounded-full border transition",
                    isWishlisted
                      ? "border-[#5b2136] bg-[#311621] text-[#ff8cab]"
                      : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
                  ].join(" ")}
                >
                  <FiHeart className={isWishlisted ? "fill-current" : ""} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-textPrimary transition hover:border-accent/25"
                >
                  <FiShare2 />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {perks.map((perk) => (
                    <div key={perk.title} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-textPrimary">
                        {perk.icon}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-textPrimary">{perk.title}</p>
                      <p className="mt-1 text-sm leading-6 text-textSecondary">{perk.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,40,0.94),rgba(9,13,20,0.94))] p-5 text-white shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">Check delivery</p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Input
                      value={pincode}
                      onChange={(event) => setPincode(event.target.value)}
                      placeholder="Enter pincode"
                      className="border-white/10 bg-white/[0.94] text-[#111111] placeholder:text-[#847c73]"
                    />
                    <Button variant="secondary" className="rounded-full">
                      Apply
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    {pincode
                      ? `${product.shippingText || "Seller shipping details"} for service area ${pincode}.`
                      : "Enter your pincode to see delivery support for this product."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section className="pt-8">
        <Card
          hover={false}
          className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(13,19,29,0.96),rgba(8,11,18,0.94))] p-6 shadow-[0_24px_56px_rgba(0,0,0,0.28)] md:p-8"
        >
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(index)}
                className={[
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                  activeTab === index
                    ? "border-accent/35 bg-[linear-gradient(135deg,rgba(200,139,74,0.24),rgba(104,138,255,0.18))] text-white"
                    : "border-white/10 bg-white/[0.05] text-textPrimary hover:border-accent/25",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 ? (
            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <p className="text-base leading-8 text-textSecondary">{product.description}</p>
                {product.highlights?.length ? (
                  <div className="grid gap-3">
                    {product.highlights.map((item) => (
                      <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-textPrimary">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-3">
                {(product.specs || []).length ? (
                  product.specs.map((spec) => (
                    <div key={spec.label} className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">{spec.label}</p>
                      <p className="mt-2 text-sm font-semibold text-textPrimary">{spec.value}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">Seller</p>
                      <p className="mt-2 text-sm font-semibold text-textPrimary">{product.sellerName || "Sastify Retail"}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textSecondary">Warranty</p>
                      <p className="mt-2 text-sm font-semibold text-textPrimary">{product.warranty || "As per seller terms"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 1 ? (
            <div className="mt-8 space-y-4">
              {reviews.length ? (
                reviews.slice(0, 6).map((review) => (
                  <div key={review._id} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-textPrimary">{review.user?.name || "Verified buyer"}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-[#f5b301]">
                        <FiStar className="fill-current" />
                        <span className="font-semibold text-textPrimary">{review.rating}</span>
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-textSecondary">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="mt-6 text-sm text-textSecondary">No reviews yet for this product.</p>
              )}
            </div>
          ) : null}
        </Card>
      </Section>

      {product.relatedProducts?.length > 0 ? (
        <Section className="pt-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tight text-textPrimary">YOU MIGHT ALSO LIKE</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {product.relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <Section className="pb-4">
        <NewsletterBanner />
      </Section>
    </PageWrapper>
  );
};
