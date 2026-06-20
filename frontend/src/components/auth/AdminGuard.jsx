"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


export default function AdminGuard({ children }) {
  const router = useRouter();

  const {user,loading,isAuthenticated} = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!user?.is_admin && !user?.is_owner) {
      router.replace("/");
    }
  }, [loading,isAuthenticated,user,router]);

  if (loading) {
    return <p>در حال بارگذاری...</p>;
  }

  if (!user || (!user.is_admin && !user.is_owner)) {
    return null;
  }

  return children;
}