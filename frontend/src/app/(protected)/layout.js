"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export default function ProtectedLayout({ children }) {
  return (

    <AuthGuard>

      <Header />
      {children}
      <Footer />
      
    </AuthGuard>



  );
}