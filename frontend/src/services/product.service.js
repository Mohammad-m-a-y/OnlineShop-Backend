import api from "@/lib/axios";
import qs from "qs";



export async function getProducts(params = {}) {
  const res = await api.get("/products", {
    params,

    paramsSerializer: (params) =>
      qs.stringify(params, {
        arrayFormat: "repeat",
      }),
  });

  return res.data;
}


export async function getProductById(id) {
  const response = await api.get(
    `/products/${id}`
  );

  return response.data;
}


export async function getProductBySlug(slug) {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
}



export async function addProduct(data) {
  const response = await api.post('/products', {
    name: data.name,
    slug: data.slug,
    description: data.description,
    base_price: data.base_price,
    brand_id: data.brand_id ?? null,
    short_description: data.short_description ?? null,
    category_ids: data.category_ids ?? null,
  })

  return response.data;
  
}



export async function updateProduct(prductId, data) {
  const response = await api.put(`/products/${prductId}`, {
    name: data.name ?? null,
    slug: data.slug ?? null,
    base_price: data.base_price ?? null,
    description: data.description ?? null,
    short_description: data.short_description ?? null,
    category_ids: data.category_ids ?? null,
    brand_id: data.brand_id ?? null,
    remove_brand: data.remove_brand, // boolean
    is_available:  data.is_available !== undefined ? data.is_available : null,

  })

  return response.data
  
}




export async function toggleProductStatus(prductId) {
  const response = await api.patch(`/products/${prductId}/toggle-status`)
  
  return response.data
}



export async function deleteProduct(prductId) {
  const response = await api.delete(`/products/${prductId}`)
  
}


