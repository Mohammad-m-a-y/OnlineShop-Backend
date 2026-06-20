import api from "@/lib/axios";




export async function getCategories(params = {}) {
  const response = await api.get("/categories", {
    params: {
      is_active: params.is_active ?? null,
    },
  });

  return response.data;
}



export async function createCategory(data= {}) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("slug", data.slug);

  if (data.parent_id) { 
    formData.append("parent_id", data.parent_id); 
  }

  if (data.description) {
    formData.append("description", data.description);
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await api.post( "/categories", formData );

  return response.data;
}




export async function updateCategory(data= {}) {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.slug !== undefined) {
    formData.append("slug", data.slug);
  }

  if (data.parent_id !== undefined) {
    formData.append(
      "parent_id",
      data.parent_id ?? ""
    );
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

  formData.append( "remove_image", data.remove_image ?? false);

  const response = await api.patch( `/categories/${data.category_id}`, formData);

  return response.data;
}




export async function toggleCategoryStatus( categoryId) {
  const response = await api.patch(`/categories/${categoryId}/toggle-status`);

  return response.data;
}

export async function deleteCategory( categoryId) {
  await api.delete( `/categories/${categoryId}`);
}