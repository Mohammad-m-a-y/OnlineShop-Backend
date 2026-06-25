"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyCart, createCart, addCartItem, updateCartItemQuantity, abandoneCart , deleteCartItem} from "@/services/cart.service";


const CartContext = createContext(null);



export function CartProvider({ children }) {

    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0)
    const [loading, setLoading] = useState(true);



    async function refreshCart() {
        try {
            setLoading(true);

            const data = await getMyCart();

            setCart(data);

            const count = data?.items?.reduce( (sum, item) => sum + item.quantity,0 ) || 0;

            setCartItemsCount(count);

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {

        async function init() {


            if (!isAuthenticated) {
                setCart(null)
                setLoading(false);
                return;
            }

            try {
                await refreshCart();
            } finally {
                setLoading(false);
            }

        }

        init();
    }, [isAuthenticated])



    async function addItem({ productId, variantId, quantity = 1 }) {
        let currentCart = cart;

        if (!currentCart) {
            currentCart = await createCart();

            setCart(currentCart);
        }

        await addCartItem({
            cart_id: currentCart.id,
            product_id: productId,
            variant_id: variantId,
            quantity: quantity,
        });

        await refreshCart();
    }


    async function updateQuantity(itemId, quantity) {
        if (!cart) return;

        await updateCartItemQuantity(cart.id, itemId, quantity)

        await refreshCart();

    }


    async function deleteItem(itemId) {
        if (!cart) return;
        
        await deleteCartItem(cart.id, itemId)
        await refreshCart();
    }


    async function deleteCart() {

        if (!cart) return;

        await abandoneCart(cart.id)

        return await refreshCart();
        
    }




    const value = {
        cart,
        cartItemsCount,
        loading,

        refreshCart,
        deleteCart,
        addItem,
        deleteItem,
        updateQuantity,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )

}




export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}