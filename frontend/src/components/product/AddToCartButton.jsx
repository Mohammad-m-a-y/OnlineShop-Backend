"use client";

import { useState } from "react";
import styles from "./AddToCartButton.module.css";
import { addCartItem } from "@/services/cart.service";
import { useCart } from "@/context/CartContext";


export default function AddToCartButton({ productId, variantId, disabled = false }) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false)

  const {cart, refreshCart} = useCart()

  async function handleClick() {
    
    try{

      setIsAdding(true)

      await addCartItem({
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId,
        quantity: 1
      })

      await refreshCart();
          
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);

    } catch(err){
      console.error(err)
    } finally{
      setIsAdding(false)
    }




  }

  return (
    <button
      className={`${styles.btn} ${added ? styles.added : ""}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {added ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          به سبد اضافه شد
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {!isAdding ? " افزودن به سبد خرید" : "درحال افزودن..."}
         
        </>
      )}
    </button>
  );
}