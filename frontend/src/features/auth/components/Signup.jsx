import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  clearSignupError,
  resetSignupStatus,
  selectLoggedInUser,
  selectSignupError,
  selectSignupStatus,
  signupAsync,
} from "../AuthSlice";

export const Signup = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSignupStatus);
  const error = useSelector(selectSignupError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp");
    } else if (loggedInUser) {
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Unable to create account");
      dispatch(clearSignupError());
    }
  }, [dispatch, error]);

  useEffect(() => {
    if (status === "fulfilled") {
      toast.success("Account created. Verify your email to continue.");
    }

    return () => {
      dispatch(resetSignupStatus());
    };
  }, [dispatch, status]);

  const onSubmit = (data) => {
    const payload = { ...data };
    delete payload.confirmPassword;
    dispatch(signupAsync(payload));
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Join a marketplace designed around trust, speed, and clarity."
      description="Save your wishlist, keep delivery addresses ready, track orders, and move through checkout faster every time."
      highlights={[
        "Address book and account history synced after login",
        "Order lifecycle with confirmed, packed, shipped, and delivered milestones",
        "Coupon-ready checkout and scalable payment gateway architecture",
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-textPrimary">Sign up</h2>
          <p className="text-sm text-textSecondary">Your account will be used for checkout, tracking, and saved preferences.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
                message: "Enter a valid email",
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
                message: "Use 8+ chars with upper, lower, and number",
              },
            })}
          />
          <Input
            label="Confirm password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === watch("password") || "Passwords do not match",
            })}
          />
          <Button type="submit" fullWidth disabled={status === "pending"}>
            {status === "pending" ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-textSecondary">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};
