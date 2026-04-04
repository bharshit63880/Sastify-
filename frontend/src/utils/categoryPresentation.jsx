import React from "react";
import {
  FiGrid,
  FiHeadphones,
  FiHeart,
  FiHome,
  FiMonitor,
  FiShoppingBag,
  FiSmartphone,
  FiSun,
  FiWatch,
} from "react-icons/fi";

const imageFallbacks = {
  electronics:
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
  fashion:
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=80",
  "home-kitchen":
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  "beauty-wellness":
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
};

const iconRules = [
  { terms: ["mobile", "phone", "electronics"], icon: FiSmartphone },
  { terms: ["audio", "speaker", "headphone", "earbuds"], icon: FiHeadphones },
  { terms: ["watch", "wearable", "fitness"], icon: FiWatch },
  { terms: ["fashion", "menswear", "womenswear", "footwear", "accessories"], icon: FiShoppingBag },
  { terms: ["home", "kitchen", "cookware", "decor", "appliance"], icon: FiHome },
  { terms: ["beauty", "wellness", "skincare", "hair"], icon: FiHeart },
  { terms: ["lighting"], icon: FiSun },
  { terms: ["laptop", "tablet", "monitor"], icon: FiMonitor },
];

const getCategoryKey = (category) =>
  [category?.slug, category?.name, category?.parent?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const getCategoryImage = (category) =>
  category?.image ||
  category?.children?.find((child) => child.image)?.image ||
  imageFallbacks[category?.slug] ||
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80";

export const getCategoryIcon = (category) => {
  const key = getCategoryKey(category);
  const match = iconRules.find((rule) => rule.terms.some((term) => key.includes(term)));
  return match?.icon || FiGrid;
};

export const CategoryGlyph = ({ category, className = "" }) => {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} />;
};
