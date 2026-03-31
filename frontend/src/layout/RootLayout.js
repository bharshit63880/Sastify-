import React from "react";
import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop";
import { Container } from "../components/ui/Container";
import { Footer } from "../features/footer/Footer";
import { Navbar } from "../features/navigation/components/Navbar";

export const RootLayout = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="relative min-h-[70vh]">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </div>
  );
};
