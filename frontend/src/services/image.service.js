import api from "@/lib/axios";


 
 


export async function uploadProductImage(data) {
  const formData = new FormData();

  formData.append("image", data.image);

  formData.append(
    "is_primary",
    data.is_primary
  );

  if (data.alt_text) {
    formData.append(
      "alt_text",
      data.alt_text
    );
  }

  const response = await api.post(
    `/products/${data.product_id}/images`,
    formData
  );

  return response.data;
}




export async function updateProductImageOrder(productId,imageId,newOrder) {
  const response = await api.patch(
    `/products/${productId}/images/${imageId}`,
    {
      new_order: newOrder,
    }
  );

  return response.data;
}


export async function deleteProductImage(productId,imageId) {
  await api.delete(
    `/products/${productId}/images/${imageId}`
  );
}