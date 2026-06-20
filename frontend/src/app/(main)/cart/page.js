import AuthGuard from "@/components/auth/AuthGuard";




export default function CartPage() {
  return (
    <AuthGuard>
      <h1>سبد خرید</h1>
    </AuthGuard>
  );
}