import "./globals.css"
import '@fontsource/vazirmatn/300.css'
import '@fontsource/vazirmatn/400.css'
import '@fontsource/vazirmatn/500.css'
import '@fontsource/vazirmatn/600.css'
import '@fontsource/vazirmatn/700.css'
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"



export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
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