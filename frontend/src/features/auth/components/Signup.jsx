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
    dispatch(signupAsync(data));
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Create your account"
      description="Set up your account for faster checkout, saved orders, and a simpler return path."
    >
      <div className="space-y-6">
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
          <Button type="submit" fullWidth disabled={status === "pending"}>
            {status === "pending" ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-textSecondary">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:text-textPrimary">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};
