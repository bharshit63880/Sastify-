import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStorefrontOverview } from "./StorefrontApi";

const initialState = {
  status: "idle",
  overview: {
    metrics: {
      activeProducts: 0,
      activeCategories: 0,
      activeBrands: 0,
      totalOrders: 0,
      inStockProducts: 0,
      publishedReviews: 0,
      averageRating: 0,
    },
    categoryCounts: {},
    brandCounts: {},
    testimonials: [],
  },
  error: null,
};

export const fetchStorefrontOverviewAsync = createAsyncThunk(
  "storefront/fetchStorefrontOverviewAsync",
  async () => {
    const overview = await fetchStorefrontOverview();
    return overview;
  }
);

const storefrontSlice = createSlice({
  name: "storefrontSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStorefrontOverviewAsync.pending, (state) => {
        state.status = "pending";
      })
      .addCase(fetchStorefrontOverviewAsync.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.overview = action.payload;
      })
      .addCase(fetchStorefrontOverviewAsync.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error;
      });
  },
});

export const selectStorefrontStatus = (state) => state.StorefrontSlice.status;
export const selectStorefrontOverview = (state) => state.StorefrontSlice.overview;
export const selectStorefrontMetrics = (state) => state.StorefrontSlice.overview.metrics;
export const selectStorefrontCategoryCounts = (state) => state.StorefrontSlice.overview.categoryCounts;
export const selectStorefrontBrandCounts = (state) => state.StorefrontSlice.overview.brandCounts;
export const selectStorefrontTestimonials = (state) => state.StorefrontSlice.overview.testimonials;

export default storefrontSlice.reducer;
