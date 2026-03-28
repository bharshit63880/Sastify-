import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { Footer } from "../features/footer/Footer";
import { Navbar } from "../features/navigation/components/Navbar";

export const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="min-h-[70vh]">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};
