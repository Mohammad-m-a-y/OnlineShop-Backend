"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}