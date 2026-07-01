import api from "@/lib/axios";



export async function getBrands(params = {}) {

  try {
    const response = await api.get("/brands", {
      params: {
        is_active: params.is_active ?? null,
      },
    });

    return response.data;

  } catch (error) {
    if (error.response?.status === 404) {
      return { items: [], total_count: 0 }
    }
    throw error
  }

}



export async function createBrand(data) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("slug", data.slug);


  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await api.post("/brands", formData);

  return response.data;
}



export async function updateBrand(data) {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.slug !== undefined) {
    formData.append("slug", data.slug);
  }

  if (data.description !== undefined) {
    formData.append(
      "description",
      data.description
    );
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  formData.append(
    "remove_image",
    data.remove_image ?? false
  );

  const response = await api.put(`/brands/${data.brand_id}`, formData);

  return response.data;
}



export async function deleteBrand(brandId) {
  await api.delete(`/brands/${brandId}`);
}



export async function toggleBrandStatus(
  brandId
) {
  const response = await api.patch(
    `/brands/${brandId}/toggle-status`
  );

  return response.data;
}