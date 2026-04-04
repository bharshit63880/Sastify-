import React, { useEffect, useMemo, useState } from "react";
import { FiHeart, FiMinus, FiPlus, FiShoppingBag, FiStar, FiTruck } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { Button } from "../../../components/ui/Button";
import { PageWrapper } from "../../../components/ui/PageWrapper";
import { Section } from "../../../components/ui/Section";
import { formatPrice } from "../../../utils/currencyFormatter";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import { addGuestCartItem, addToCartAsync } from "../../cart/CartSlice";
import { fetchReviewsByProductIdAsync, selectReviews } from "../../review/ReviewSlice";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice";
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  selectProductFetchStatus,
  selectSelectedProduct,
} from "../ProductSlice";
import { ProductCard } from "./ProductCard";
import { ProductVisual } from "./ProductVisual";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = useSelector(selectSelectedProduct);
  const productFetchStatus = useSelector(selectProductFetchStatus);
  const reviews = useSelector(selectReviews);
  const loggedInUser = useSelector(selectLoggedInUser);
  const wishlistItems = useSelector(selectWishlistItems);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
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
    if (images.length) return images;
    if (product?.thumbnail) return [product.thumbnail];
    return [""];
  }, [product?.images, product?.thumbnail]);

  const isWishlisted = wishlistItems.some((item) => item.product?._id === product?._id);
  const stock = Number(product?.stock || product?.stockQuantity || 0);

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
      navigate("/login");
      return;
    }

    if (isWishlisted) {
      const entry = wishlistItems.find((item) => item.product?._id === product._id);
      if (entry) dispatch(deleteWishlistItemByIdAsync(entry._id));
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
    <PageWrapper className="py-6 md:py-8">
      <Section className="pt-2">
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

      <Section className="pt-5">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-border bg-white p-5 shadow-card">
            <div className="grid gap-4 md:grid-cols-[84px_1fr]">
              <div className="order-2 grid grid-cols-4 gap-3 md:order-1 md:grid-cols-1">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={[
                      "overflow-hidden rounded-[20px] border bg-surface p-2 transition",
                      selectedImage === index ? "border-primary" : "border-border hover:border-primary/20",
                    ].join(" ")}
                  >
                    <div className="h-16 w-full">
                      <ProductVisual
                        product={{ ...product, thumbnail: image, images: [image] }}
                        alt={`${product.name || product.title} ${index + 1}`}
                        imageClassName="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="order-1 overflow-hidden rounded-[28px] border border-border bg-surface p-4 md:order-2 md:p-6">
                <div className="mx-auto aspect-[4/4.8] w-full max-w-2xl overflow-hidden rounded-[22px]">
                  <ProductVisual
                    product={{
                      ...product,
                      thumbnail: galleryImages[selectedImage] || product.thumbnail,
                      images: [galleryImages[selectedImage] || product.thumbnail],
                    }}
                    alt={product.name || product.title}
                    imageClassName="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-border bg-white p-6 shadow-card md:p-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-textSecondary">
                {product.brand?.name || product.brandName || "Sastify"}
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary md:text-4xl">
                {product.name || product.title}
              </h1>
              <p className="body-copy max-w-xl line-clamp-3">
                {product.description || "A clean, premium product detail experience with less friction and clearer purchase actions."}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-textSecondary">
                <span className="inline-flex items-center gap-1">
                  <FiStar className="fill-current text-[#d19b2d]" />
                  <span className="font-medium text-textPrimary">{Number(product.rating || 0).toFixed(1)}</span>
                </span>
                <span>{Number(product.reviewCount || reviews.length || 0)} reviews</span>
                <span className={stock > 0 ? "text-textSecondary" : "text-[#c74d6f]"}>
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 border-y border-border py-5">
              <p className="text-4xl font-semibold tracking-[-0.04em] text-textPrimary">{formatPrice(product.price)}</p>
              {product.originalPrice > product.price ? (
                <>
                  <p className="text-lg text-textSecondary line-through">{formatPrice(product.originalPrice)}</p>
                  <span className="rounded-full bg-surface px-3 py-1 text-sm font-semibold text-textPrimary">
                    Save {product.discountPercent}%
                  </span>
                </>
              ) : null}
            </div>

            {product.colors?.length ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        selectedColor === color
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-textPrimary hover:border-primary/15",
                      ].join(" ")}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes?.length ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-textSecondary">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white text-textPrimary hover:border-primary/15",
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-5 rounded-full border border-border bg-surface px-5 py-3">
                <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} className="text-textPrimary">
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
                disabled={stock <= 0}
                fullWidth
                className="sm:flex-1"
              >
                Add to cart
              </Button>

              <Button variant="secondary" onClick={handleWishlist} className="sm:w-auto">
                <FiHeart className={isWishlisted ? "fill-current text-[#d14d72]" : ""} />
              </Button>
            </div>

            <div className="rounded-[24px] border border-border bg-surface px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-textPrimary shadow-[0_8px_20px_rgba(17,17,17,0.06)]">
                  <FiTruck />
                </span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">Delivery and returns</p>
                  <p className="mt-1 text-sm leading-6 text-textSecondary">
                    {product.shippingText || "Delivery details are confirmed at checkout. Returns follow the seller policy."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-border bg-white p-6 shadow-card">
            <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Description</h2>
            <p className="mt-4 body-copy">
              {product.description || "This product is part of the current curated catalog."}
            </p>
            {product.highlights?.length ? (
              <div className="mt-5 grid gap-3">
                {product.highlights.map((item) => (
                  <div key={item} className="rounded-[20px] border border-border bg-surface px-4 py-3 text-sm text-textPrimary">
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[30px] border border-border bg-white p-6 shadow-card">
            <h2 className="text-2xl font-semibold tracking-tight text-textPrimary">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.length ? (
                reviews.slice(0, 4).map((review) => (
                  <div key={review._id} className="rounded-[20px] border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-textPrimary">{review.user?.name || "Verified buyer"}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-textSecondary">
                        <FiStar className="fill-current text-[#d19b2d]" />
                        <span className="font-medium text-textPrimary">{review.rating}</span>
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-textSecondary">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-textSecondary">No reviews yet for this product.</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {product.relatedProducts?.length ? (
        <Section>
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-textPrimary">You may also like</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {product.relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}
    </PageWrapper>
  );
};
