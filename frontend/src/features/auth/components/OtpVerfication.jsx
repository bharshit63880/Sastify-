import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../../components/ui/AuthShell";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  clearOtpVerificationError,
  clearResendOtpError,
  clearResendOtpSuccessMessage,
  logoutAsync,
  resendOtpAsync,
  resetOtpVerificationStatus,
  resetResendOtpStatus,
  selectLoggedInUser,
  selectOtpVerificationError,
  selectOtpVerificationStatus,
  selectResendOtpError,
  selectResendOtpStatus,
  selectResendOtpSuccessMessage,
  verifyOtpAsync,
} from "../AuthSlice";

export const OtpVerfication = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const resendOtpStatus = useSelector(selectResendOtpStatus);
  const resendOtpError = useSelector(selectResendOtpError);
  const resendOtpSuccessMessage = useSelector(selectResendOtpSuccessMessage);
  const otpVerificationStatus = useSelector(selectOtpVerificationStatus);
  const otpVerificationError = useSelector(selectOtpVerificationError);

  const shouldShowOtpForm = useMemo(
    () =>
      resendOtpStatus === "fulfilled" ||
      otpVerificationStatus === "pending" ||
      Boolean(resendOtpSuccessMessage),
    [otpVerificationStatus, resendOtpStatus, resendOtpSuccessMessage]
  );

  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login");
      return;
    }

    if (loggedInUser.isVerified) {
      navigate("/");
    }
  }, [loggedInUser, navigate]);

  useEffect(() => {
    if (resendOtpError) {
      toast.error(resendOtpError.message || "Unable to send OTP");
    }
    return () => {
      dispatch(clearResendOtpError());
    };
  }, [dispatch, resendOtpError]);

  useEffect(() => {
    if (resendOtpSuccessMessage) {
      toast.success(resendOtpSuccessMessage.message || "OTP sent successfully");
    }
    return () => {
      dispatch(clearResendOtpSuccessMessage());
    };
  }, [dispatch, resendOtpSuccessMessage]);

  useEffect(() => {
    if (otpVerificationError) {
      toast.error(otpVerificationError.message || "OTP verification failed");
    }
    return () => {
      dispatch(clearOtpVerificationError());
    };
  }, [dispatch, otpVerificationError]);

  useEffect(() => {
    if (otpVerificationStatus === "fulfilled") {
      toast.success("Email verified successfully");
      dispatch(resetResendOtpStatus());
      navigate("/");
    }

    return () => {
      dispatch(resetOtpVerificationStatus());
    };
  }, [dispatch, navigate, otpVerificationStatus]);

  const handleSendOtp = () => {
    if (!loggedInUser?._id) {
      return;
    }

    dispatch(resendOtpAsync({ user: loggedInUser._id }));
  };

  const handleVerifyOtp = (data) => {
    if (!loggedInUser?._id) {
      return;
    }

    dispatch(verifyOtpAsync({ ...data, userId: loggedInUser._id }));
  };

  const handleLogout = async () => {
    await dispatch(logoutAsync());
    navigate("/login");
  };

  return (
    <AuthShell
      eyebrow="Email verification required"
      title="Verify your email"
      description="Enter the one-time password sent to your inbox to activate your account."
    >
      <div className="space-y-6">
        <div className="rounded-[24px] border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">Registered email</p>
          <p className="mt-2 text-sm font-semibold text-textPrimary">{loggedInUser?.email}</p>
        </div>

        {shouldShowOtpForm ? (
          <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
            <Input
              label="4-digit OTP"
              inputMode="numeric"
              error={errors.otp?.message}
              {...register("otp", {
                required: "OTP is required",
                minLength: {
                  value: 4,
                  message: "Please enter a 4 digit OTP",
                },
                maxLength: {
                  value: 4,
                  message: "Please enter a 4 digit OTP",
                },
              })}
            />
            <Button type="submit" fullWidth disabled={otpVerificationStatus === "pending"}>
              {otpVerificationStatus === "pending" ? "Verifying..." : "Verify email"}
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={handleSendOtp} disabled={resendOtpStatus === "pending"}>
              {resendOtpStatus === "pending" ? "Sending..." : "Resend OTP"}
            </Button>
          </form>
        ) : (
          <Button fullWidth onClick={handleSendOtp} disabled={resendOtpStatus === "pending"}>
            {resendOtpStatus === "pending" ? "Sending..." : "Get OTP"}
          </Button>
        )}

        <div className="space-y-2">
          <p className="text-sm text-textSecondary">Need a different account?</p>
          <button type="button" onClick={handleLogout} className="text-sm font-semibold text-primary">
            Sign out and use another email
          </button>
        </div>
      </div>
    </AuthShell>
  );
};
