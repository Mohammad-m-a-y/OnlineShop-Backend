import api from "@/lib/axios";



export async function createAttribute(data) {
  const response = await api.post(
    `/products/variants/${data.variantId}/attributes`,
    {
      name: data.name,
      value: data.value,
    }
  );

  return response.data;
}

export async function updateAttribute(
  variantId,
  attributeId,
  data
) {
  const response = await api.patch(
    `/products/variants/${variantId}/attributes/${attributeId}`,
    {
      name: data.name ?? null,
      value: data.value ?? null,
    }
  );

  return response.data;
}


export async function deleteAttribute(
  attributeId
) {
  await api.delete(
    `/products/variants/attributes/${attributeId}`
  );
}

