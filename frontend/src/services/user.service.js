import api from "@/lib/axios";


export async function getUsers(
  params = {}
) {
  const response = await api.get(
    "/users",
    {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 10,
      },
    }
  );

  return response.data;
}



export async function getCurrentUser() {
  const response = await api.get("/users/me");

  return response.data;
}



export async function getMyCart() {
  const response = await api.get("/users/me/cart");

  return response.data;
}



export async function updateCurrentUser(data = {}) {

  const formData = new FormData();

  if ( data.username !== undefined) {
    formData.append( "username", data.username );
  }

  if ( data.full_name !== undefined) {
    formData.append( "full_name", data.full_name );
  }

  if ( data.email !== undefined) {
    formData.append( "email",  data.email );
  }

  if (data.image) { 
    formData.append( "image", data.image );
  }

  formData.append( "remove_image", data.remove_image ?? false );

  const response = await api.patch( "/users/me", formData );

  return response.data;
}



export async function toggleAdminRole(
  userId
) {
  const response =
    await api.patch(
      `/users/${userId}/toggle-admin`
    );

  return response.data;
}



export async function toggleOwnerRole(
  userId
) {
  const response =
    await api.patch(
      `/users/${userId}/toggle-owner`
    );

  return response.data;
}



export async function toggleUserStatus(
  userId
) {
  const response =
    await api.patch(
      `/users/${userId}/toggle-status`
    );

  return response.data;
}



export async function deleteUser(
  userId
) {
  await api.delete(
    `/users/${userId}`
  );
}