import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  clearResetPasswordError,
  clearResetPasswordSuccessMessage,
  resetPasswordAsync,
  resetResetPasswordStatus,
  selectResetPasswordError,
  selectResetPasswordStatus,
  selectResetPasswordSuccessMessage,
} from "../AuthSlice";

export const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const status = useSelector(selectResetPasswordStatus);
  const error = useSelector(selectResetPasswordError);
  const successMessage = useSelector(selectResetPasswordSuccessMessage);
  const { userId, passwordResetToken } = useParams();
  const navigate = useNavigate();
  const isSuccess = status === "fulfilled" || status === "fullfilled";

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Unable to reset password");
    }
    return () => {
      dispatch(clearResetPasswordError());
    };
  }, [dispatch, error]);

  useEffect(() => {
    if (isSuccess) {
      toast.success(successMessage?.message || "Password reset successfully");
      navigate("/login");
    }
    return () => {
      dispatch(clearResetPasswordSuccessMessage());
    };
  }, [dispatch, isSuccess, navigate, successMessage]);

  useEffect(() => {
    return () => {
      dispatch(resetResetPasswordStatus());
    };
  }, [dispatch]);

  const handleResetPassword = async (data) => {
    const payload = { ...data, userId, token: passwordResetToken };
    delete payload.confirmPassword;
    dispatch(resetPasswordAsync(payload));
    reset();
  };

  return (
    <AuthShell
      eyebrow="Set a new password"
      title="Choose a fresh password and get back into your account."
      description="Your updated password will be used immediately for login, checkout, and every protected flow in the storefront."
      highlights={[
        "Password requirements are validated before submission",
        "The reset token flow is preserved exactly as implemented",
        "You will be redirected back to login after success",
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-textPrimary">Reset password</h2>
          <p className="text-sm text-textSecondary">Please enter and confirm your new password.</p>
        </div>

        <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
          <Input
            label="New password"
            type="password"
            error={errors.password?.message}
            {...register("password", {
              required: "Please enter a password",
              pattern: {
                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                message: "Use at least 8 characters with uppercase, lowercase, and a number",
              },
            })}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm the password",
              validate: (value, formValues) => value === formValues.password || "Passwords do not match",
            })}
          />
          <Button type="submit" fullWidth disabled={status === "pending"}>
            {status === "pending" ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
};
