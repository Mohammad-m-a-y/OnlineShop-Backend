import "./globals.css";
import { Vazirmatn } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";


const vazir = Vazirmatn({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-vazir",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <AuthProvider>
          <CartProvider>
          {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}