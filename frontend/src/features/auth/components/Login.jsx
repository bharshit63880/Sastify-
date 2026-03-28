import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  clearLoginError,
  loginAsync,
  resetLoginStatus,
  selectLoggedInUser,
  selectLoginError,
  selectLoginStatus,
} from "../AuthSlice";

const authHighlights = [
  "Curated catalog across lifestyle and home essentials",
  "Secure checkout with COD and online payment architecture",
  "Order tracking, account history, and trusted delivery messaging",
];

export const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectLoginError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (loggedInUser) {
      const target = location.state?.from || (loggedInUser.isAdmin ? "/admin" : "/");
      navigate(loggedInUser.isVerified ? target : "/verify-otp");
    }
  }, [location.state, loggedInUser, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Unable to sign in");
      dispatch(clearLoginError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    return () => {
      dispatch(resetLoginStatus());
    };
  }, [dispatch]);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to continue your marketplace journey."
      description="Access your cart, saved addresses, orders, and secure checkout from one polished workspace."
      highlights={authHighlights}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-textPrimary">Login</h2>
          <p className="text-sm text-textSecondary">Use your registered email to access your account.</p>
        </div>

        <form onSubmit={handleSubmit((data) => dispatch(loginAsync(data)))} className="space-y-4">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email",
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <Button type="submit" fullWidth disabled={status === "pending"}>
            {status === "pending" ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center justify-between gap-4 text-sm">
          <Link to="/forgot-password" className="text-textSecondary hover:text-textPrimary">
            Forgot password?
          </Link>
          <Link to="/signup" className="font-semibold text-primary">
            Create account
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-textSecondary">
          <p className="font-semibold text-textPrimary">Demo access after seeding</p>
          <p className="mt-2">admin@sastify.com / Admin@123</p>
          <p>riya.sharma@sastify.com / User@1234</p>
        </div>
      </div>
    </AuthShell>
  );
};
