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
      title={isSuccess ? "Check your inbox" : "Reset your password"}
      description={
        isSuccess
          ? "We sent a reset link to your registered email."
          : "Enter your email and we’ll send you a secure reset link."
      }
    >
      <div className="space-y-6">
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
