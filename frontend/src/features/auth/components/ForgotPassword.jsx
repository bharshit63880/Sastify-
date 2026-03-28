import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  clearForgotPasswordError,
  clearForgotPasswordSuccessMessage,
  forgotPasswordAsync,
  resetForgotPasswordStatus,
  selectForgotPasswordError,
  selectForgotPasswordStatus,
  selectForgotPasswordSuccessMessage,
} from "../AuthSlice";

export const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const status = useSelector(selectForgotPasswordStatus);
  const error = useSelector(selectForgotPasswordError);
  const successMessage = useSelector(selectForgotPasswordSuccessMessage);
  const isSuccess = status === "fulfilled" || status === "fullfilled";

  useEffect(() => {
    if (error) {
      toast.error(error?.message || "Unable to send reset email");
    }
    return () => {
      dispatch(clearForgotPasswordError());
    };
  }, [dispatch, error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(successMessage?.message || "Password reset email sent");
    }
    return () => {
      dispatch(clearForgotPasswordSuccessMessage());
    };
  }, [dispatch, isSuccess, successMessage]);

  useEffect(() => {
    return () => {
      dispatch(resetForgotPasswordStatus());
    };
  }, [dispatch]);

  const handleForgotPassword = async (data) => {
    dispatch(forgotPasswordAsync(data));
    reset();
  };

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Reset access without leaving your secure account flow."
      description="We will send a password reset link to your registered email so you can continue with checkout, tracking, and saved preferences."
      highlights={[
        "Secure email-first account recovery",
        "No backend business logic changes to the reset flow",
        "You can return here any time if the link expires",
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-textPrimary">
            {isSuccess ? "Email has been sent" : "Forgot your password?"}
          </h2>
          <p className="text-sm text-textSecondary">
            {isSuccess
              ? "Please check your inbox and click the link to reset your password."
              : "Enter your registered email below to receive a password reset link."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register("email", {
                required: "Please enter an email",
                pattern: {
                  value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
                  message: "Enter a valid email",
                },
              })}
            />
            <Button type="submit" fullWidth disabled={status === "pending"}>
              {status === "pending" ? "Sending..." : "Send password reset link"}
            </Button>
          </form>
        ) : null}

        <Link to="/login" className="text-sm font-semibold text-primary">
          Go back to login
        </Link>
      </div>
    </AuthShell>
  );
};
