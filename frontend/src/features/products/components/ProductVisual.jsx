import React from "react";
import { cn } from "../../../utils/cn";

const visualMap = [
  {
    match: ["t shirt", "t-shirt", "tee", "graphic tee", "topwear", "menswear"],
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["shirt", "casual shirt", "formal shirt", "overshirt"],
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["hoodie", "sweatshirt", "pullover"],
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["jeans", "denim", "trouser", "pants"],
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["dress", "gown"],
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["skirt"],
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["jacket", "coat", "blazer"],
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["sneaker", "shoe", "footwear", "running shoe"],
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["sandal", "slipper"],
    image:
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["bag", "backpack", "luggage"],
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["watch", "smartwatch", "fitness band"],
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["smartphone", "phone", "charger", "power bank"],
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["laptop", "notebook"],
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["earbuds", "headphones"],
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["speaker", "soundbar"],
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["television", "tv"],
    image:
      "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["air conditioner", "ac"],
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["refrigerator", "fridge"],
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["washing machine"],
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["microwave", "oven"],
    image:
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["mixer", "blender", "grinder"],
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["sofa", "couch"],
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["chair"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["bed", "mattress"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["desk", "table"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["lamp", "lighting"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["skincare", "hair care", "grooming", "makeup", "beauty"],
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    match: ["cookware", "cooker", "kitchenware", "dinner set", "bottle"],
    image:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
  },
];

const getProductKey = (product) =>
  [
    product?.category?.name,
    product?.categoryName,
    product?.name,
    product?.title,
    product?.shortDescription,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getFallbackImage = (product) => {
  const key = getProductKey(product);
  const matched = visualMap.find((entry) => entry.match.some((term) => key.includes(term)));

  return (
    matched?.image ||
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80"
  );
};

export const shouldUseGeneratedVisual = (product) => {
  const image = product?.thumbnail || product?.images?.[0] || "";

  return !image;
};

export const ProductVisual = ({ product, className = "", imageClassName = "", alt }) => {
  const image = product?.thumbnail || product?.images?.[0] || "";

  return (
    <img
      src={shouldUseGeneratedVisual(product) ? getFallbackImage(product) : image}
      alt={alt}
      loading="lazy"
      className={cn("h-full w-full object-cover", className, imageClassName)}
    />
  );
};
