import api from "@/lib/axios";



export async function getMyCart() {
  const response = await api.get("/users/me/cart");

  return response.data;
}

export async function createCart() {
  const response = await api.post("/carts");

  return response.data;
}

export async function addCartItem(data) {
  const response = await api.post(`/carts/${data.cart_id}/cart-item`,
    {
      product_id: data.product_id,
      variant_id: data.variant_id,
      quantity: data.quantity,
    }
  );

  return response.data;
}

export async function updateCartItemQuantity( cartId, itemId, quantity) {
  const response = await api.patch(`/carts/${cartId}/cart-item/${itemId}`, null,
    {
      params: {
        quantity,
      },
    }
  );

  return response.data;
}