import api from "@/lib/axios";




export async function createVariant(data) {
  const response = await api.post("/products/variants", {
    product_id: data.product_id,
    sku: data.sku,
    price_modifier: data.price_modifier,
    discounted_price: data.discounted_price,
    stock_quantity: data.stock_quantity,
  });

  return response.data;
}


export async function updateVariant(id, data) {
  const response = await api.patch(
    `/products/variants/${id}`,
    {
      sku: data.sku ?? null,
      price_modifier: data.price_modifier ?? null,
      discounted_price: data.discounted_price ?? null,
      stock_quantity: data.stock_quantity ?? null,
    }
  );

  return response.data;
}


export async function deleteVariant(id) {
  await api.delete(`/products/variants/${id}`);
}

