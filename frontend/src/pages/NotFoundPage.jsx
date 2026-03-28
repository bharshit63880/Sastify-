import React from "react";
import Lottie from "lottie-react";
import { FiArrowRight } from "react-icons/fi";
import { notFoundPageAnimation } from "../assets";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card hover={false} className="w-full max-w-3xl text-center">
        <div className="space-y-6">
          <div className="mx-auto max-w-md">
            <Lottie animationData={notFoundPageAnimation} />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-textPrimary">404 Not Found</h1>
            <p className="text-sm text-textSecondary">Sorry, we couldn't find the page you were looking for.</p>
          </div>
          <div className="flex justify-center">
            <Button to="/" icon={<FiArrowRight />}>
              Go back to homepage
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
