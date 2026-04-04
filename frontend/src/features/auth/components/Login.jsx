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
      title="Sign in"
      description="Access your cart, orders, and checkout in one clean workspace."
    >
      <div className="space-y-6">
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
          <Link to="/signup" className="font-semibold text-accent hover:text-textPrimary">
            Create account
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};
