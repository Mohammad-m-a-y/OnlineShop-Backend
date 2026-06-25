import api from "@/lib/axios";

export async function initiatePayment(orderId) {
  const response = await api.post("/payments/initiate", {
    order_id: orderId,
  });

  return response.data;
}