 
import api from "@/lib/axios";




export async function getMyAddresses() {
  const response = await api.get("/users/me/addresses");

  return response.data;
}



export async function getAddress(id) {
  const response = await api.get(`/addresses/${id}`);

  return response.data;
}

export async function createAddress(data) {
  const response = await api.post("/addresses", data);

  return response.data;
}

export async function updateAddress(id, data) {
  const response = await api.put( `/addresses/${id}`, data);

  return response.data;
}

export async function deleteAddress(id) {
  await api.delete(`/addresses/${id}`);
}