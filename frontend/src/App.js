import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements
} from "react-router-dom";
import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice';
import { Protected } from './features/auth/components/Protected';
import { fetchAllBrandsAsync } from './features/brands/BrandSlice';
import { fetchAllCategoriesAsync } from './features/categories/CategoriesSlice';
import { hydrateGuestCart, selectCartItems, selectIsGuestCart, syncGuestCartAsync } from './features/cart/CartSlice';
import { fetchStorefrontOverviewAsync } from './features/storefront/StorefrontSlice';
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AdminLayout } from './layout/AdminLayout';
import { RootLayout } from './layout/RootLayout';
import {
  AddProductPage,
  AdminDashboardPage,
  AdminOrdersPage,
  AdminUsersPage,
  CartPage,
  CategoryPage,
  CheckoutPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  OrderDetailsPage,
  OrderSuccessPage,
  OtpVerificationPage,
  ProductDetailsPage,
  ProductUpdatePage,
  ProductsPage,
  ResetPasswordPage,
  SearchResultsPage,
  SignupPage,
  UserOrdersPage,
  UserProfilePage,
  WishlistPage
} from './pages';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const loggedInUser = useSelector(selectLoggedInUser);
  const cartItems = useSelector(selectCartItems);
  const isGuestCart = useSelector(selectIsGuestCart);

  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync());
    dispatch(fetchAllBrandsAsync());
    dispatch(fetchStorefrontOverviewAsync());
    dispatch(hydrateGuestCart());
  }, [dispatch]);

  useEffect(() => {
    if (loggedInUser?.isVerified && isGuestCart && cartItems.length) {
      dispatch(syncGuestCartAsync(cartItems));
    }
  }, [cartItems, dispatch, isGuestCart, loggedInUser]);

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/verify-otp' element={<OtpVerificationPage/>}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
        <Route path='/reset-password/:userId/:passwordResetToken' element={<ResetPasswordPage/>}/>
        <Route element={<RootLayout />}>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/products' element={<ProductsPage/>}/>
          <Route path='/search' element={<SearchResultsPage/>}/>
          <Route path='/category/:slug' element={<CategoryPage/>}/>
          <Route path='/products/:id' element={<ProductDetailsPage/>}/>
          <Route path='/cart' element={<CartPage/>}/>
          <Route path='/checkout' element={<Protected><CheckoutPage/></Protected>}/>
          <Route path='/order-success/:id' element={<Protected><OrderSuccessPage/></Protected>}/>
          <Route path='/orders' element={<Protected><UserOrdersPage/></Protected>}/>
          <Route path='/orders/:id' element={<Protected><OrderDetailsPage/></Protected>}/>
          <Route path='/account' element={<Protected><UserProfilePage/></Protected>}/>
          <Route path='/wishlist' element={<Protected><WishlistPage/></Protected>}/>
        </Route>

        <Route path='/admin' element={<Protected adminOnly><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboardPage/>}/>
          <Route path='orders' element={<AdminOrdersPage/>}/>
          <Route path='users' element={<AdminUsersPage/>}/>
          <Route path='products/new' element={<AddProductPage/>}/>
          <Route path='products/:id/edit' element={<ProductUpdatePage/>}/>
        </Route>

        <Route path='*' element={<NotFoundPage/>} />
      </>
    )
  )

  return isAuthChecked ? <RouterProvider router={routes}/> : "";
}

export default App;
